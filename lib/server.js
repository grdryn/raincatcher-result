'use strict';

var sync = require('fh-wfm-sync/lib/server');
var config = require('./config');
var shortid = require('shortid');

/**
 * Function to generate topic used by the mediator to request, subscribe and publish to.
 *
 * @param {string} topicPrefix Defines the topic name.
 * @param {string} action Defines which CRUDL action is to be used.
 * @param {string} prefix Prefix used to add to the start of the topic to determine if request was done.
 * @param {string} uid Unique identifier to identify unique topics.
 * @returns {string} topic Generated topic to be used by the mediator
 */
function generateTopic(topicPrefix, action, prefix, uid) {
  var topic = "";

  if (prefix) {
    topic = topic + prefix + ':';
  }
  topic = topic + topicPrefix + config.datasetId + ':' + action;
  if (uid) {
    topic = topic + ':' + uid;
  }

  return topic;
}


/**
 * Subscribers to sync topics which sends a request to the simple store module for CRUDL operations.
 * Publishes the response received from the simple store module back to sync
 */
module.exports = function(mediator, app, mbaasApi) {
  sync.init(mediator, mbaasApi, config.datasetId, config.syncOptions);

  mediator.subscribe(generateTopic(config.cloudTopicPrefix, 'create'), function(resultToCreate, mediatorTopicIdentifier) {
    // Add an id field required by the new simple store module to the result object to be created
    resultToCreate.id = shortid.generate();

    mediator.request(generateTopic(config.cloudDataTopicPrefix, 'create'), resultToCreate, {uid: resultToCreate.id})
      .then(function(createdResult) {
        mediator.publish(generateTopic(config.cloudTopicPrefix, 'create', 'done', mediatorTopicIdentifier), createdResult);
      });
  });

  mediator.subscribe(generateTopic(config.cloudTopicPrefix, 'list'), function() {
    mediator.request(generateTopic(config.cloudDataTopicPrefix, 'list'))
      .then(function(listOfresult) {
        mediator.publish(generateTopic(config.cloudTopicPrefix, 'list', 'done'), listOfresult);
      });
  });

  mediator.subscribe(generateTopic(config.cloudTopicPrefix, 'update'), function(resultToUpdate) {
    mediator.request(generateTopic(config.cloudDataTopicPrefix, 'update'), resultToUpdate, {uid: resultToUpdate.id})
      .then(function(updatedResult) {
        mediator.publish(generateTopic(config.cloudTopicPrefix, 'update', 'done', updatedResult.id), updatedResult);
      });
  });

  mediator.subscribe(generateTopic(config.cloudTopicPrefix, 'read'), function(uid) {
    mediator.request(generateTopic(config.cloudDataTopicPrefix, 'read'), uid)
      .then(function(readResult) {
        mediator.publish(generateTopic(config.cloudTopicPrefix, 'read', 'done', uid), readResult);
      });
  });

  mediator.subscribe(generateTopic(config.cloudTopicPrefix, 'delete'), function(uid) {
    mediator.request(generateTopic(config.cloudDataTopicPrefix, 'delete'), uid)
      .then(function(deletedResult) {
        mediator.publish(generateTopic(config.cloudTopicPrefix, 'delete', 'done', uid), deletedResult);
      });
  });
};
