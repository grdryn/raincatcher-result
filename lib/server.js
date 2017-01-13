'use strict';

var sync = require('fh-wfm-sync/lib/server');
var config = require('./config');


module.exports = function(mediator, app, mbaasApi) {
  sync.init(mediator, mbaasApi, config.datasetId, config.syncOptions);

  // Add an id field required by the new simple store module to the result object to be created
  mediator.subscribe('wfm:cloud:result:create', function(resultToCreate, ts) {
    resultToCreate.id = ts;
    mediator.publish('wfm:cloud:data:result:create', resultToCreate);
  });
};
