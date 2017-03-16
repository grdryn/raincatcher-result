var mediatorSubscribers = require('./mediator-subscribers');

/**
 * Initialisation of the workorder core module.
 * @param {Mediator} mediator
 */
module.exports = function(mediator) {

  //Initialising the subscribers to topics that the module is interested in.
  return mediatorSubscribers.init(mediator);
};