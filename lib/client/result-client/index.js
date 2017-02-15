var q = require('q');
var _ = require('lodash');
var shortid = require('shortid');
var CONSTANTS = require('../../constants');
var config = require('../../config');
var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');
var mediator, manager, resultSyncSubscribers;

/**
 *
 * Getting Promises for done and error topics.
 *
 * @param doneTopicPromise  - A promise for the done topic.
 * @param errorTopicPromise - A promise for the error topic.
 * @returns {*}
 */
function getTopicPromises(doneTopicPromise, errorTopicPromise) {
  var deferred = q.defer();

  doneTopicPromise.then(function(createdResult) {
    deferred.resolve(createdResult);
  });

  errorTopicPromise.then(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}


/**
 *
 * Creating a new result.
 *
 * @param {object} resultToCreate - The Result to create.
 */
function create(resultToCreate) {

  //Creating a unique channel to get the response
  var topicUid = shortid.generate();

  var topicParams = {topicUid: topicUid, itemToCreate: resultToCreate};

  var donePromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.CREATE, CONSTANTS.DONE_PREFIX, topicUid));

  var errorPromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.CREATE, CONSTANTS.ERROR_PREFIX, topicUid));

  mediator.publish(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.CREATE), topicParams);

  return getTopicPromises(donePromise, errorPromise);
}

/**
 *
 * Updating an existing result.
 *
 * @param {object} resultToUpdate - The result to update
 * @param {string} resultToUpdate.id - The ID of the result to update
 */
function update(resultToUpdate) {
  var topicParams = {topicUid: resultToUpdate.id, itemToUpdate: resultToUpdate};

  var donePromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.UPDATE, CONSTANTS.DONE_PREFIX, topicParams.topicUid));

  var errorPromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.UPDATE, CONSTANTS.ERROR_PREFIX, topicParams.topicUid));

  mediator.publish(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.UPDATE), topicParams);

  return getTopicPromises(donePromise, errorPromise);
}

/***
 *
 * Reading a single result.
 *
 * @param {string} resultId - The ID of the result to read
 */
function read(resultId) {
  var donePromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.READ, CONSTANTS.DONE_PREFIX, resultId));

  var errorPromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.READ, CONSTANTS.ERROR_PREFIX, resultId));

  mediator.publish(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.READ), {id: resultId, topicUid: resultId});

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Listing All Results
 */
function list() {
  var donePromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.LIST, CONSTANTS.DONE_PREFIX));

  var errorPromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.LIST, CONSTANTS.ERROR_PREFIX));

  mediator.publish(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.LIST));

  return getTopicPromises(donePromise, errorPromise);
}

/**
 *
 * Removing a workororder using the sync topics
 *
 * @param {object} resultToRemove
 * @param {string} resultToRemove.id - The ID of the workoroder to remove
 */
function remove(resultToRemove) {

  var donePromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.REMOVE, CONSTANTS.DONE_PREFIX, resultToRemove.id));

  var errorPromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.REMOVE, CONSTANTS.ERROR_PREFIX, resultToRemove.id));

  mediator.publish(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.REMOVE),  {id: resultToRemove.id, topicUid: resultToRemove.id});

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Starting the synchronisation process for results.
 */
function start() {

  var donePromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.START, CONSTANTS.DONE_PREFIX));

  var errorPromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.START, CONSTANTS.ERROR_PREFIX));

  mediator.publish(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.START));

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Stopping the synchronisation process for results.
 */
function stop() {
  var donePromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.STOP, CONSTANTS.DONE_PREFIX));

  var errorPromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.STOP, CONSTANTS.ERROR_PREFIX));

  mediator.publish(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.STOP));

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Forcing the results to sync to the remote store.
 */
function forceSync() {
  var donePromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.FORCE_SYNC, CONSTANTS.DONE_PREFIX));

  var errorPromise = mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.FORCE_SYNC, CONSTANTS.ERROR_PREFIX));

  mediator.publish(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.FORCE_SYNC));

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Safe stop forces a synchronisation to the remote server and then stops the synchronisation process.
 * @returns {Promise}
 */
function safeStop() {
  return forceSync().then(stop);
}


/**
 * Waiting for the synchronisation process to complete to the remote cluster.
 */
function waitForSync() {
  return mediator.promise(resultSyncSubscribers.getTopic(CONSTANTS.TOPICS.SYNC_COMPLETE));
}

function ManagerWrapper(_manager) {
  this.manager = _manager;
  var self = this;

  var methodNames = ['create', 'read', 'update', 'delete', 'list', 'start', 'stop', 'safeStop', 'forceSync', 'waitForSync'];
  methodNames.forEach(function(methodName) {
    self[methodName] = function() {
      return q.when(self.manager[methodName].apply(self.manager, arguments));
    };
  });
}


/**
 *
 * Initialising the result-client with a mediator.
 *
 * @param _mediator
 * @returns {ManagerWrapper|*}
 */
module.exports = function(_mediator) {

  //If there is already a manager, use this
  if (manager) {
    return manager;
  }

  mediator = _mediator;

  resultSyncSubscribers = new MediatorTopicUtility(mediator);
  resultSyncSubscribers.prefix(CONSTANTS.SYNC_TOPIC_PREFIX).entity(config.datasetId);

  manager = new ManagerWrapper({
    create: create,
    update: update,
    list: list,
    delete: remove,
    start: start,
    stop: stop,
    read: read,
    safeStop: safeStop,
    forceSync: forceSync,
    publishRecordDeltaReceived: _.noop,
    waitForSync: waitForSync,
    datasetId: config.datasetId
  });

  return manager;
};