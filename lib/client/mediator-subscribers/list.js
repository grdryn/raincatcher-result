var topicGenerators = require('../../topic-generators');
var CONSTANTS = require('../../constants');
var resultClient = require('../result-client');

/**
 * Initialsing a subscriber for Listing results.
 *
 * @param {Mediator} mediator
 *
 */
module.exports = function listResultSubscriber(mediator) {

  var listResultsTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.LIST
  });


  /**
   *
   * Handling the listing of results
   *
   * @param {object} parameters
   * @param {string/number} parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  function handleListResultsTopic(parameters) {
    parameters = parameters || {};
    var resultListErrorTopic = topicGenerators.errorTopic({
      topicName: CONSTANTS.TOPICS.LIST,
      topicUid: parameters.topicUid
    });

    var resultListDoneTopic = topicGenerators.doneTopic({
      topicName: CONSTANTS.TOPICS.LIST,
      topicUid: parameters.topicUid
    });

    resultClient(mediator).manager.list()
    .then(function(arrayOfResults) {
      mediator.publish(resultListDoneTopic, arrayOfResults);
    }).catch(function(error) {
      mediator.publish(resultListErrorTopic, error);
    });
  }

  return mediator.subscribe(listResultsTopic, handleListResultsTopic);
};