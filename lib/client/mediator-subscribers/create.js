var _ = require('lodash');
var CONSTANTS = require('../../constants');


/**
 * Initialising a subscriber for creating a result.
 *
 * @param {object} resultEntityTopics
 * @param {ManagerWrapper} resultClient
 */
module.exports = function createResultSubscriber(resultEntityTopics, resultClient) {

  /**
   *
   * Handling the creation of a result
   *
   * @param {object} parameters
   * @param {object} parameters.resultToCreate   - The result item to create
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleCreateResultTopic(parameters) {
    var self = this;
    parameters = parameters || {};
    var resultCreateErrorTopic = resultEntityTopics.getTopic(CONSTANTS.TOPICS.CREATE, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var resultToCreate = parameters.resultToCreate;

    //If no result is passed, can't create one
    if (!_.isPlainObject(resultToCreate)) {
      return self.mediator.publish(resultCreateErrorTopic, new Error("Invalid Data To Create A Result."));
    }

    resultClient.manager.create(resultToCreate)
    .then(function(createdResult) {
      self.mediator.publish(resultEntityTopics.getTopic(CONSTANTS.TOPICS.CREATE, CONSTANTS.DONE_PREFIX, parameters.topicUid), createdResult);
    }).catch(function(error) {
      self.mediator.publish(resultCreateErrorTopic, error);
    });
  };
};