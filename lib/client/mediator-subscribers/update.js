var CONSTANTS = require('../../constants');
var _ = require('lodash');

/**
 * Initialsing a subscriber for updating a result.
 *
 * @param {object} resultEntityTopics
 * @param {ManagerWrapper} resultClient
 */
module.exports = function updateResultSubscriber(resultEntityTopics, resultClient) {

  /**
   *
   * Handling the update of a result
   *
   * @param {object} parameters
   * @param {object} parameters.resultToUpdate   - The result item to update
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleUpdateTopic(parameters) {
    var self = this;
    parameters = parameters || {};
    var resultUpdateErrorTopic = resultEntityTopics.getTopic(CONSTANTS.TOPICS.UPDATE, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var resultUpdateDoneTopic = resultEntityTopics.getTopic(CONSTANTS.TOPICS.UPDATE, CONSTANTS.DONE_PREFIX, parameters.topicUid);

    var resultToUpdate = parameters.resultToUpdate;

    //If no result is passed, can't update one. Also require the ID of the workorde to update it.
    if (!_.isPlainObject(resultToUpdate) || !resultToUpdate.id) {
      return self.mediator.publish(resultUpdateErrorTopic, new Error("Invalid Data To Update A Result."));
    }

    resultClient.manager.update(resultToUpdate)
    .then(function(updatedResult) {
      self.mediator.publish(resultUpdateDoneTopic, updatedResult);
    }).catch(function(error) {
      self.mediator.publish(resultUpdateErrorTopic, error);
    });
  };
};