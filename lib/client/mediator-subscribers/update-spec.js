var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var ResultClient = require('../result-client');
var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');


describe("Result Update Mediator Topic", function() {

  var mockResultToUpdate = {
    id: "resultidtoupdate",
    name: "This is a mock Work Order"
  };

  var expectedUpdatedResult =  _.defaults({name: "Updated Result"}, mockResultToUpdate);

  var topicUid = 'testtopicuid1';

  var updateTopic = "wfm:results:update";
  var doneUpdateTopic = "done:wfm:results:update:testtopicuid1";
  var errorUpdateTopic = "error:wfm:results:update:testtopicuid1";

  var syncUpdateTopic = "wfm:sync:result:update";
  var doneSyncUpdateTopic = "done:wfm:sync:result:update";
  var errorSyncUpdateTopic = "error:wfm:sync:result:update";

  var resultClient = ResultClient(mediator);

  var resultSubscribers = new MediatorTopicUtility(mediator);
  resultSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.RESULT_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    resultSubscribers.on(CONSTANTS.TOPICS.UPDATE, require('./update')(resultSubscribers, resultClient));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    resultSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to update a result', function() {
    this.subscribers[syncUpdateTopic] = mediator.subscribe(syncUpdateTopic, function(parameters) {
      expect(parameters.itemToUpdate).to.deep.equal(mockResultToUpdate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(doneSyncUpdateTopic + ":" + parameters.topicUid, expectedUpdatedResult);
    });

    var donePromise = mediator.promise(doneUpdateTopic);

    mediator.publish(updateTopic, {
      resultToUpdate: mockResultToUpdate,
      topicUid: topicUid
    });

    return donePromise.then(function(updatedResult) {
      expect(updatedResult).to.deep.equal(expectedUpdatedResult);
    });
  });

  it('should publish an error if there is no object to update', function() {
    var errorPromise = mediator.promise(errorUpdateTopic);

    mediator.publish(updateTopic, {
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should publish an error if there is no result id', function() {
    var errorPromise = mediator.promise(errorUpdateTopic);

    mediator.publish(updateTopic, {
      resultToUpdate: {},
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");

    this.subscribers[syncUpdateTopic] = mediator.subscribe(syncUpdateTopic, function(parameters) {
      expect(parameters.itemToUpdate).to.deep.equal(mockResultToUpdate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(errorSyncUpdateTopic + ":" + parameters.topicUid, expectedError);
    });

    var errorPromise = mediator.promise(errorUpdateTopic);

    mediator.publish(updateTopic, {
      resultToUpdate: mockResultToUpdate,
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});