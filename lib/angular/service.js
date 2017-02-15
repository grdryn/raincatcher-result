'use strict';

var config = require('../config')
  , _ = require('lodash')
  ;

var resultClient = require('../client/result-client');
var resultMediatorSubscribers = require('../client/mediator-subscribers');

module.exports = 'wfm.result.sync';


function wrapManager($q, $timeout, manager) {
  var wrappedManager = _.create(manager);
  wrappedManager.getByWorkorderId = function(workorderId) {
    return wrappedManager.list()
    .then(function(results) {
      return wrappedManager.filterByWorkorder(results, workorderId);
    });
  };
  wrappedManager.filterByWorkorder = function(resultsArray, workorderId) {
    var deferred = $q.defer();
    var filtered = resultsArray.filter(function(result) {
      return String(result.workorderId) === String(workorderId);
    });
    var result =  filtered && filtered.length ? filtered[0] : {};
    deferred.resolve(result);
    return deferred.promise;
  };
  wrappedManager.extractAppformSubmissionIds = function(result) {
    var submissionIds = null;
    if ( result && result.stepResults && ! _.isEmpty(result.stepResults)) {
      var appformStepResults = _.filter(result.stepResults, function(stepResult) {
        return !! stepResult.step.formId;
      });
      if (! _.isEmpty(appformStepResults)) {
        submissionIds = _.map(appformStepResults, function(stepResult) {
          return stepResult.submission.submissionId;
        }).filter(function(id) {
          return !! id;
        });
      }
    }
    return submissionIds;
  };
  return wrappedManager;
}

angular.module('wfm.result.sync', [])
.factory('resultSync', function($q, $timeout, mediator) {
  var resultSync = {};
  resultSync.createManager = function(queryParams) {
    if (resultSync.manager) {
      return $q.when(resultSync.manager);
    } else {
      resultSync.manager = wrapManager($q, $timeout, resultClient(mediator));
      resultMediatorSubscribers.init(mediator);
      console.log('Sync is managing dataset:', config.datasetId, 'with filter: ', queryParams);
      return resultSync.manager;
    }
  };
  resultSync.removeManager = function() {
    if (resultSync.manager) {
      return resultSync.manager.safeStop()
        .then(function() {
          resultMediatorSubscribers.tearDown();
          delete resultSync.manager;
        });
    }
  };
  return resultSync;
})

.filter('isEmpty', function() {
  return function(object) {
    return (Object.keys(object).length === 0);
  };
})

.run(function(mediator, resultSync) {
  mediator.subscribe('wfm:appform:submission:complete', function(event) {
    var metaData = event.metaData.wfm;
    var submissionResult = event.submissionResult;
    resultSync.managerPromise
    .then(function(manager) {
      return manager.getByWorkorderId(metaData.workorderId)
      .then(function(result) {
        var stepResult = result.stepResults[metaData.step.code];
        stepResult.submission = submissionResult;
        return manager.update(result);
      });
    })
    .then(function(result) {
      mediator.publish('wfm:result:remote-update:' + result.workorderId, result);
    });
  });
});
