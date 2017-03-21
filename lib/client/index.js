var mediatorSubscribers = require('./mediator-subscribers');
var ResultClient = require('./result-client');

/**
 * Initialisation of the workorder core module.
 * @param {Mediator} mediator
 */
module.exports = function(mediator) {

  //Initialising the subscribers to topics that the module is interested in.
  var resultClient = ResultClient(mediator);
  return mediatorSubscribers.init(mediator, resultClient);
};