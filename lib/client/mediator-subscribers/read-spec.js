var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var ResultClient = require('../result-client');
var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Result Read Mediator Topic", function() {

  var mockResult = {
    id: "resultid",
    name: "This is a mock Work Order"
  };

  var readTopic = "wfm:results:read";
  var doneReadTopic = "done:wfm:results:read:resultid";
  var errorReadTopic = "error:wfm:results:read";

  var syncReadTopic = "wfm:sync:result:read";
  var doneSyncReadTopic = "done:wfm:sync:result:read:resultid";
  var errorSyncReadTopic = "error:wfm:sync:result:read:resultid";

  var resultSubscribers = new MediatorTopicUtility(mediator);
  resultSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.RESULT_ENTITY_NAME);

  var resultClient = ResultClient(mediator);

  var readSubscribers = require('./read')(resultSubscribers, resultClient);

  beforeEach(function() {
    this.subscribers = {};
    resultSubscribers.on(CONSTANTS.TOPICS.READ, readSubscribers);
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    resultSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to read result', function() {
    this.subscribers[syncReadTopic] = mediator.subscribe(syncReadTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockResult.id);

      mediator.publish(doneSyncReadTopic, mockResult);
    });

    var donePromise = mediator.promise(doneReadTopic);

    mediator.publish(readTopic, {id: mockResult.id, topicUid: mockResult.id});

    return donePromise.then(function(readResult) {
      expect(readResult).to.deep.equal(mockResult);
    });
  });

  it('should publish an error if there is no ID to read', function() {
    var errorPromise = mediator.promise(errorReadTopic);

    mediator.publish(readTopic);

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Expected An ID");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncReadTopic] = mediator.subscribe(syncReadTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockResult.id);

      mediator.publish(errorSyncReadTopic, expectedError);
    });

    var errorPromise = mediator.promise(errorReadTopic + ":" + mockResult.id);

    mediator.publish(readTopic, {id: mockResult.id, topicUid: mockResult.id});

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});