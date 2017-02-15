var topicGenerators = require('../../topic-generators');
var CONSTANTS = require('../../constants');
var resultClient = require('../result-client');

/**
 * Initialsing a subscriber for removing results.
 *
 * @param {Mediator} mediator
 *
 */
module.exports = function removeResultSubscriber(mediator) {

  var removeResultTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.REMOVE
  });


  /**
   *
   * Handling the removal of a single result
   *
   * @param {object} parameters
   * @param {string} parameters.id - The ID of the result to remove.
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  function handleRemoveResult(parameters) {
    parameters = parameters || {};
    var resultRemoveErrorTopic = topicGenerators.errorTopic({
      topicName: CONSTANTS.TOPICS.REMOVE,
      topicUid: parameters.topicUid
    });

    var resultRemoveDoneTopic = topicGenerators.doneTopic({
      topicName: CONSTANTS.TOPICS.REMOVE,
      topicUid: parameters.topicUid
    });

    //If there is no ID, then we can't read the result.
    if (!parameters.id) {
      return mediator.publish(resultRemoveErrorTopic, new Error("Expected An ID When Removing A Result"));
    }

    resultClient(mediator).manager.delete({
      id: parameters.id
    })
    .then(function() {
      mediator.publish(resultRemoveDoneTopic);
    }).catch(function(error) {
      mediator.publish(resultRemoveErrorTopic, error);
    });
  }

  return mediator.subscribe(removeResultTopic, handleRemoveResult);
};