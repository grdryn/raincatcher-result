var CONSTANTS = require('../../constants');

/**
 * Initialsing a subscriber for Listing results.
 *
 * @param {object} resultEntityTopics
 * @param {ManagerWrapper} resultClient
 */
module.exports = function listResultSubscriber(resultEntityTopics, resultClient) {

  /**
   *
   * Handling the listing of results
   *
   * @param {object} parameters
   * @param {string/number} parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleListResultsTopic(parameters) {
    var self = this;
    parameters = parameters || {};
    var resultListErrorTopic = resultEntityTopics.getTopic(CONSTANTS.TOPICS.LIST, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var resultListDoneTopic = resultEntityTopics.getTopic(CONSTANTS.TOPICS.LIST, CONSTANTS.DONE_PREFIX, parameters.topicUid);

    resultClient.manager.list()
    .then(function(arrayOfResults) {
      self.mediator.publish(resultListDoneTopic, arrayOfResults);
    }).catch(function(error) {
      self.mediator.publish(resultListErrorTopic, error);
    });
  };
};