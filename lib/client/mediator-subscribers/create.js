var topicGenerators = require('../../topic-generators');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var resultClient = require('../result-client');

/**
 * Initialsing a subscriber for creating a result.
 *
 * @param {Mediator} mediator
 *
 */
module.exports = function createResultSubscriber(mediator) {

  var createResultTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.CREATE
  });


  /**
   *
   * Handling the creation of a result
   *
   * @param {object} parameters
   * @param {object} parameters.resultToCreate   - The result item to create
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  function handleCreateResultTopic(parameters) {
    parameters = parameters || {};
    var resultCreateErrorTopic = topicGenerators.errorTopic({
      topicName: CONSTANTS.TOPICS.CREATE,
      topicUid: parameters.topicUid
    });

    var resultCreateDoneTopic = topicGenerators.doneTopic({
      topicName: CONSTANTS.TOPICS.CREATE,
      topicUid: parameters.topicUid
    });

    var resultToCreate = parameters.resultToCreate;

    //If no result is passed, can't create one
    if (!_.isPlainObject(resultToCreate)) {
      return mediator.publish(resultCreateErrorTopic, new Error("Invalid Data To Create A Result."));
    }

    resultClient(mediator).manager.create(resultToCreate)
    .then(function(createdResult) {
      mediator.publish(resultCreateDoneTopic, createdResult);
    }).catch(function(error) {
      mediator.publish(resultCreateErrorTopic, error);
    });
  }

  return mediator.subscribe(createResultTopic, handleCreateResultTopic);
};