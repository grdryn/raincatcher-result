var CONSTANTS = require('../../constants');

/**
 * Initialsing a subscriber for removing results.
 *
 * @param {object} resultEntityTopics
 * @param {ManagerWrapper} resultClient
 */
module.exports = function removeResultSubscriber(resultEntityTopics, resultClient) {


  /**
   *
   * Handling the removal of a single result
   *
   * @param {object} parameters
   * @param {string} parameters.id - The ID of the result to remove.
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleRemoveResult(parameters) {
    var self = this;
    parameters = parameters || {};
    var resultRemoveErrorTopic = resultEntityTopics.getTopic(CONSTANTS.TOPICS.REMOVE, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var resultRemoveDoneTopic = resultEntityTopics.getTopic(CONSTANTS.TOPICS.REMOVE, CONSTANTS.DONE_PREFIX, parameters.topicUid);

    //If there is no ID, then we can't read the result.
    if (!parameters.id) {
      return self.mediator.publish(resultRemoveErrorTopic, new Error("Expected An ID When Removing A Result"));
    }

    resultClient.manager.delete({
      id: parameters.id
    })
    .then(function() {
      self.mediator.publish(resultRemoveDoneTopic);
    }).catch(function(error) {
      self.mediator.publish(resultRemoveErrorTopic, error);
    });
  };
};