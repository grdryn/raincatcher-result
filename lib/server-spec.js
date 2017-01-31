var sinon = require('sinon');
var assert = require('assert');
var proxyquire = require('proxyquire');
var express = require('express');
var app = express();
var mockMbaasApi = {};
var mockSync = {
  init: sinon.spy()
};

var mediator = require('fh-wfm-mediator/lib/mediator.js');

/**
 * Set of unit tests for the sync topic subscribers
 */
describe('Result Sync Topic Subscribers', function() {
  var server = proxyquire('./server.js', {
    'fh-wfm-sync/lib/server': mockSync
  });

  //Create
  it('should publish to done create cloud topic when the request to create a result has been completed', function(done) {
    var data = {value: 'test-result-create'};
    var topicId = "testId";

    server(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe("wfm:cloud:data:result:create", function(createdResult) {
      //Publish to done create data topic to fake result creation by storage module
      mediator.publish("done:wfm:cloud:data:result:create:" + createdResult.id, createdResult);
    });

    mediator.request("wfm:cloud:result:create", [data, topicId], {uid: topicId}).then(function(createdResult) {
      assert.equal(data.value, createdResult.value, "Created result should have the same value as initial data passed during request");
      assert(createdResult.id, "Created result should have a generated id field");
      done();
    });

  });

  //List
  it('should publish to done list cloud topic when the request to list a result has been completed', function(done) {
    var listResultArray = [{id: 'test-result-1', value:'test-result'},
      {id: 'test-result-2', value:'test-result'},
      {id: 'test-result-3', value:'test-result'}];

    server(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe("wfm:cloud:data:result:list", function() {
      //Publish to done list data topic to fake getting the list of result by storage module
      mediator.publish("done:wfm:cloud:data:result:list", listResultArray);
    });

    mediator.request("wfm:cloud:result:list").then(function(listResult) {
      assert(listResult, "Should return the list of result");
      assert.deepEqual(listResult, listResultArray, "List of result received should be the same as the list of result passed by the mock storage module");
      done();
    });

  });

  // Update
  it('should publish to done update cloud topic when the request to update a result has been completed', function(done) {
    var resultToUpdate = {id:'testID', value: 'result-updated'};

    server(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe("wfm:cloud:data:result:update", function(resultToUpdate) {
      //Publish to done update data topic to fake getting the update of result by storage module
      mediator.publish("done:wfm:cloud:data:result:update:" + resultToUpdate.id, resultToUpdate);
    });

    mediator.request("wfm:cloud:result:update", resultToUpdate, {uid: resultToUpdate.id}).then(function(updatedResult) {
      assert(updatedResult, "Should return the updated result");
      assert.deepEqual(updatedResult, resultToUpdate, "The result updated should be the same as the result returned by the mock storage module");
      done();
    });
  });

  //Read
  it('should publish to done read cloud topic when the request to read a result has been completed', function(done) {
    var resultRead = {id:'testID', value: 'result-read'};
    var uid = "testID";

    server(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe("wfm:cloud:data:result:read", function(uid) {
      //Publish to done read data topic to fake the reading of result by storage module
      mediator.publish("done:wfm:cloud:data:result:read:" + uid, resultRead);
    });

    mediator.request("wfm:cloud:result:read", uid).then(function(readResult) {
      assert(readResult, "Should return the result read");
      assert.equal(uid, readResult.id, "Result Read should have the same id as the uid given in the request");
      done();
    });
  });

  //Delete
  it('should publish to done delete cloud topic when the request to delete a result has been completed', function(done) {
    var resultToDelete = {id:'testID', value: 'result-deleted'};
    var uid = "testID";

    server(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe("wfm:cloud:data:result:delete", function(uid) {
      //Publish to done delete data topic to fake the deleteing of result by storage module
      mediator.publish("done:wfm:cloud:data:result:delete:" + uid, resultToDelete);
    });

    mediator.request("wfm:cloud:result:delete", uid).then(function(deletedResult) {
      assert(deletedResult, "Should return the deleted result");
      assert.equal(uid, deletedResult.id, "Deleted result should have the same id as the uid given in the request");
      done();
    });
  });

});
