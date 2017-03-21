var CONSTANTS = require('../../constants');

/**
 * Initialsing a subscriber for reading results.
 *
 * @param {object} resultEntityTopics
 * @param {ManagerWrapper} resultClient
 */
module.exports = function readResultSubscriber(resultEntityTopics, resultClient) {


  /**
   *
   * Handling the reading of a single result
   *
   * @param {object} parameters
   * @param {string} parameters.id - The ID of the result to read.
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleReadResultsTopic(parameters) {
    var self = this;
    parameters = parameters || {};

    var resultReadErrorTopic = resultEntityTopics.getTopic(CONSTANTS.TOPICS.READ, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var resultReadDoneTopic = resultEntityTopics.getTopic(CONSTANTS.TOPICS.READ, CONSTANTS.DONE_PREFIX, parameters.topicUid);

    //If there is no ID, then we can't read the result.
    if (!parameters.id) {
      return self.mediator.publish(resultReadErrorTopic, new Error("Expected An ID When Reading A Result"));
    }

    resultClient.manager.read(parameters.id)
    .then(function(result) {
      self.mediator.publish(resultReadDoneTopic, result);
    }).catch(function(error) {
      self.mediator.publish(resultReadErrorTopic, error);
    });
  };

};