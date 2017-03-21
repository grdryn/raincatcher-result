var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');

var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');
var ResultClient = require('../result-client');

describe("Result Create Mediator Topic", function() {

  var mockResultToCreate = {
    name: "This is a mock Work Order"
  };

  var expectedCreatedResult =  _.extend({_localuid: "createdResultLocalId"}, mockResultToCreate);

  var topicUid = 'testtopicuid1';

  var createTopic = "wfm:results:create";
  var doneCreateTopic = "done:wfm:results:create:testtopicuid1";
  var errorCreateTopic = "error:wfm:results:create:testtopicuid1";

  var syncCreateTopic = "wfm:sync:result:create";
  var doneSyncCreateTopic = "done:wfm:sync:result:create";
  var errorSyncCreateTopic = "error:wfm:sync:result:create";

  var resultSubscribers = new MediatorTopicUtility(mediator);
  resultSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.RESULT_ENTITY_NAME);

  var resultClient = ResultClient(mediator);

  beforeEach(function() {
    this.subscribers = {};
    resultSubscribers.on(CONSTANTS.TOPICS.CREATE, require('./create')(resultSubscribers, resultClient));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    resultSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to create a result', function() {
    this.subscribers[syncCreateTopic] = mediator.subscribe(syncCreateTopic, function(parameters) {
      expect(parameters.itemToCreate).to.deep.equal(mockResultToCreate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(doneSyncCreateTopic + ":" + parameters.topicUid, expectedCreatedResult);
    });

    var donePromise = mediator.promise(doneCreateTopic);

    mediator.publish(createTopic, {
      resultToCreate: mockResultToCreate,
      topicUid: topicUid
    });

    return donePromise.then(function(createdResult) {
      expect(createdResult).to.deep.equal(expectedCreatedResult);
    });
  });

  it('should publish an error if there is no object to update', function() {
    var errorPromise = mediator.promise(errorCreateTopic);

    mediator.publish(createTopic, {
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncCreateTopic] = mediator.subscribe(syncCreateTopic, function(parameters) {
      expect(parameters.itemToCreate).to.deep.equal(mockResultToCreate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(errorSyncCreateTopic + ":" + parameters.topicUid, expectedError);
    });

    var errorPromise = mediator.promise(errorCreateTopic);

    mediator.publish(createTopic, {
      resultToCreate: mockResultToCreate,
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});