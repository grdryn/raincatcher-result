var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var ResultClient = require('../result-client');
var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Result Remove Mediator Topic", function() {

  var mockResult = {
    id: "resultid",
    name: "This is a mock Work Order"
  };

  var removeTopic = "wfm:results:remove";
  var doneRemoveTopic = "done:wfm:results:remove:resultid";
  var errorRemoveTopic = "error:wfm:results:remove";

  var syncRemoveTopic = "wfm:sync:result:remove";
  var doneSyncRemoveTopic = "done:wfm:sync:result:remove:resultid";
  var errorSyncRemoveTopic = "error:wfm:sync:result:remove:resultid";

  var resultClient = ResultClient(mediator);

  var resultSubscribers = new MediatorTopicUtility(mediator);
  resultSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.RESULT_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    resultSubscribers.on(CONSTANTS.TOPICS.REMOVE, require('./remove')(resultSubscribers, resultClient));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    resultSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to remove a result', function() {
    this.subscribers[syncRemoveTopic] = mediator.subscribe(syncRemoveTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockResult.id);

      mediator.publish(doneSyncRemoveTopic, mockResult);
    });

    var donePromise = mediator.promise(doneRemoveTopic);

    mediator.publish(removeTopic, {id: mockResult.id, topicUid: mockResult.id});

    return donePromise;
  });

  it('should publish an error if there is no ID to remove', function() {
    var errorPromise = mediator.promise(errorRemoveTopic);

    mediator.publish(removeTopic);

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Expected An ID");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncRemoveTopic] = mediator.subscribe(syncRemoveTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockResult.id);

      mediator.publish(errorSyncRemoveTopic, expectedError);
    });

    var errorPromise = mediator.promise(errorRemoveTopic + ":" + mockResult.id);

    mediator.publish(removeTopic, {id: mockResult.id, topicUid: mockResult.id});

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});