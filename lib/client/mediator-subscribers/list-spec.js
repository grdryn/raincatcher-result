var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;

describe("Result List Mediator Topic", function() {

  var mockResult = {
    id: "resultid",
    name: "This is a mock Work Order"
  };

  var results = [_.clone(mockResult), _.clone(mockResult)];

  var listTopic = "wfm:results:list";
  var doneListTopic = "done:wfm:results:list";
  var errorListTopic = "error:wfm:results:list";

  var syncListTopic = "wfm:sync:list:result";
  var doneSyncListTopic = "done:wfm:sync:list:result";
  var errorSyncListTopic = "error:wfm:sync:list:result";

  beforeEach(function() {
    this.subscribers = {};
    this.subscribers[listTopic] = require('./list')(mediator);
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });
  });

  it('should use the sync topics to list results', function() {
    this.subscribers[syncListTopic] = mediator.subscribe(syncListTopic, function() {
      mediator.publish(doneSyncListTopic, results);
    });

    var donePromise = mediator.promise(doneListTopic);

    mediator.publish(listTopic);

    return donePromise.then(function(arrayOfResults) {
      expect(arrayOfResults).to.deep.equal(results);
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncListTopic] = mediator.subscribe(syncListTopic, function() {
      mediator.publish(errorSyncListTopic, expectedError);
    });

    var errorPromise = mediator.promise(errorListTopic);

    mediator.publish(listTopic);

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});