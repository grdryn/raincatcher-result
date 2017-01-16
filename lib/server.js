'use strict';

var sync = require('fh-wfm-sync/lib/server');
var config = require('./config');
var shortid = require('shortid');

module.exports = function(mediator, app, mbaasApi) {
  sync.init(mediator, mbaasApi, config.datasetId, config.syncOptions);

  mediator.subscribe(config.topicPrefix + config.datasetId + ':create', function(resultToCreate, mediatorTopicIdentifier) {
    // Add an id field required by the new simple store module to the result object to be created
    resultToCreate.id = shortid.generate();

    mediator.request(config.topicPrefix + 'data:' + config.datasetId + ':create', resultToCreate, {uid: resultToCreate.id})
      .then(function(createdresult) {
        mediator.publish('done:' + config.topicPrefix + config.datasetId + ':create:' + mediatorTopicIdentifier, createdresult);
      });
  });

  mediator.subscribe(config.topicPrefix + config.datasetId + ':list', function() {
    mediator.request(config.topicPrefix + 'data:' + config.datasetId + ':list')
      .then(function(listOfresult) {
        mediator.publish('done:' + config.topicPrefix + config.datasetId + ':list', listOfresult);
      });
  });

  mediator.subscribe(config.topicPrefix + config.datasetId + ':update', function(resultToUpdate) {
    mediator.request(config.topicPrefix + 'data:' + config.datasetId + ':update', resultToUpdate, {uid: resultToUpdate.id})
      .then(function(updatedresult) {
        mediator.publish('done:' + config.topicPrefix + config.datasetId + ':update:' + updatedresult.id, updatedresult);
      });
  });

  mediator.subscribe(config.topicPrefix + config.datasetId + ':read', function(uid) {
    mediator.request(config.topicPrefix + 'data:' + config.datasetId + ':read', uid)
      .then(function(result) {
        mediator.publish('done:' + config.topicPrefix + config.datasetId + ':read:' + uid, result);
      });
  });

  mediator.subscribe(config.topicPrefix + config.datasetId + ':delete', function(uid) {
    mediator.request(config.topicPrefix + 'data:' + config.datasetId + ':delete', uid)
      .then(function(result) {
        mediator.publish('done:' + config.topicPrefix + config.datasetId + ':delete:' + uid, result);
      });
  });
};
