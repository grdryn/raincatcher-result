var topicGenerators = require('../../topic-generators');
var CONSTANTS = require('../../constants');
var resultClient = require('../result-client');

/**
 * Initialsing a subscriber for reading results.
 *
 * @param {Mediator} mediator
 *
 */
module.exports = function readResultSubscriber(mediator) {

  var readResultTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.READ
  });


  /**
   *
   * Handling the reading of a single result
   *
   * @param {object} parameters
   * @param {string} parameters.id - The ID of the result to read.
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  function handleReadResultsTopic(parameters) {
    parameters = parameters || {};

    var resultReadErrorTopic = topicGenerators.errorTopic({
      topicName: CONSTANTS.TOPICS.READ,
      topicUid: parameters.topicUid
    });

    var resultReadDoneTopic = topicGenerators.doneTopic({
      topicName: CONSTANTS.TOPICS.READ,
      topicUid: parameters.topicUid
    });

    //If there is no ID, then we can't read the result.
    if (!parameters.id) {
      return mediator.publish(resultReadErrorTopic, new Error("Expected An ID When Reading A Result"));
    }

    resultClient(mediator).manager.read(parameters.id)
    .then(function(result) {
      mediator.publish(resultReadDoneTopic, result);
    }).catch(function(error) {
      mediator.publish(resultReadErrorTopic, error);
    });
  }

  return mediator.subscribe(readResultTopic, handleReadResultsTopic);
};