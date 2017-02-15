var topicGenerators = require('../../topic-generators');
var CONSTANTS = require('../../constants');
var _ = require('lodash');
var resultClient = require('../result-client');

/**
 * Initialsing a subscriber for updating a result.
 *
 * @param {Mediator} mediator
 *
 */
module.exports = function updateResultSubscriber(mediator) {

  var updateResultTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.UPDATE
  });


  /**
   *
   * Handling the update of a result
   *
   * @param {object} parameters
   * @param {object} parameters.resultToUpdate   - The result item to update
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  function handleUpdateTopic(parameters) {
    parameters = parameters || {};
    var resultUpdateErrorTopic = topicGenerators.errorTopic({
      topicName: CONSTANTS.TOPICS.UPDATE,
      topicUid: parameters.topicUid
    });

    var resultUpdateDoneTopic = topicGenerators.doneTopic({
      topicName: CONSTANTS.TOPICS.UPDATE,
      topicUid: parameters.topicUid
    });

    var resultToUpdate = parameters.resultToUpdate;

    //If no result is passed, can't update one. Also require the ID of the workorde to update it.
    if (!_.isPlainObject(resultToUpdate) || !resultToUpdate.id) {
      return mediator.publish(resultUpdateErrorTopic, new Error("Invalid Data To Update A Result."));
    }

    resultClient(mediator).manager.update(resultToUpdate)
    .then(function(updatedResult) {
      mediator.publish(resultUpdateDoneTopic, updatedResult);
    }).catch(function(error) {
      mediator.publish(resultUpdateErrorTopic, error);
    });
  }

  return mediator.subscribe(updateResultTopic, handleUpdateTopic);
};