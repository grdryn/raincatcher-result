var sinon = require('sinon');
require('sinon-as-promised');

var mockCreatedResult = {id: 'testId'},
  mockListResult = [],
  mockUpdatedResult = {id: 'testId'},
  mockReadResult = {id: 'testId', value: 'test-workflow-read'},
  mockDeletedResult = {id:'testId', value: 'test-workflow-delete'},
  mockTopicId = "testId",
  mockUID = "testId";

/**
 * Function which mocks the subscribe functionality of mediator.
 * @returns {stub}
 */
function subscribe() {
  var subscribeStub = sinon.stub();

  subscribeStub.withArgs("wfm:cloud:result:create", sinon.match.func)
    .callsArgWith(1, mockCreatedResult, mockTopicId);

  subscribeStub.withArgs("wfm:cloud:result:list", sinon.match.func)
    .callsArg(1);

  subscribeStub.withArgs("wfm:cloud:result:update", sinon.match.func)
    .callsArgWith(1, mockCreatedResult);

  subscribeStub.withArgs("wfm:cloud:result:read", sinon.match.func)
    .callsArgWith(1, mockUID);

  subscribeStub.withArgs("wfm:cloud:result:delete", sinon.match.func)
    .callsArgWith(1, mockUID);


  subscribeStub.throws("Invalid Argument");

  return subscribeStub;
}

/**
 * Function which mocks the request functionality of mediator.
 * @returns {stub}
 */
function request() {
  var requestStub = sinon.stub();

  requestStub.withArgs("wfm:cloud:data:result:create", sinon.match.object, sinon.match.object)
    .resolves(mockCreatedResult);

  requestStub.withArgs("wfm:cloud:data:result:list")
    .resolves(mockListResult);

  requestStub.withArgs("wfm:cloud:data:result:update", sinon.match.object, sinon.match.object)
    .resolves(mockUpdatedResult);

  requestStub.withArgs("wfm:cloud:data:result:read", sinon.match.string)
    .resolves(mockReadResult);

  requestStub.withArgs("wfm:cloud:data:result:delete", sinon.match.string)
    .resolves(mockDeletedResult);

  requestStub.throws("Invalid Argument");
  return requestStub;
}

/**
 * Function which mocks the publish functionality of mediator.
 * @returns {stub}
 */
function publish() {
  var publishStub = sinon.stub();
  var doneTopic = "done:wfm:cloud:result:";

  publishStub.withArgs(doneTopic + "create:" + mockTopicId, sinon.match.object);
  publishStub.withArgs(doneTopic + "list", sinon.match.object);
  publishStub.withArgs(doneTopic + "update:" + mockTopicId, sinon.match.object);
  publishStub.withArgs(doneTopic + "read:" + mockTopicId, sinon.match.object);
  publishStub.withArgs(doneTopic + "delete:" + mockTopicId, sinon.match.object);

  publishStub.throws("Invalid Argument");
  return publishStub;
}

module.exports = {
  subscribe: subscribe(),
  request: request(),
  publish: publish()
};