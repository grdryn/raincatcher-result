var express = require('express');
var chai = require('chai');
var expect = chai.expect;
var app = express();
var mockMbaasApi = {};

var CLOUD_TOPICS = {
  create: "wfm:cloud:result:create",
  list: "wfm:cloud:result:list",
  update: "wfm:cloud:result:update",
  read: "wfm:cloud:result:read",
  delete: "wfm:cloud:result:delete"
};
var CLOUD_DATA_TOPICS = {
  create: "wfm:cloud:data:result:create",
  list: "wfm:cloud:data:result:list",
  update: "wfm:cloud:data:result:update",
  read: "wfm:cloud:data:result:read",
  delete: "wfm:cloud:data:result:delete"
};
var DONE = 'done:';
var mediator = require('fh-wfm-mediator/lib/mediator.js');

/**
 * Set of unit tests for the sync topic subscribers
 */
describe('Result Sync', function() {
  var resultServer = require('./index.js');

  //Create
  it('should publish to done create cloud topic when the request to create a result has been completed', function() {
    var mockResultCreate = {value: 'test-result-create'};
    var expectedResultVal = 'test-result-create';
    var topicId = "testId";

    resultServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.create, function(createdResult) {
      //Publish to done create data topic to fake result creation by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.create + ':' + createdResult.id, createdResult);
    });

    return mediator.request(CLOUD_TOPICS.create, [mockResultCreate, topicId], {uid: topicId}).then(function(createdResult) {
      expect(createdResult, 'Created result received should not be null or undefined').to.exist;
      expect(createdResult, 'Created result received should be an object').to.be.an('object');
      expect(createdResult.value, 'Created result received should have the same value as the original object passed').to.equal(expectedResultVal);
      expect(createdResult.id, 'Created result received should have a generated string ID').to.be.a('string');
    });

  });

  //List
  it('should publish to done list cloud topic when the request to list a result has been completed', function() {
    var mockResultArray = [{id: 'test-result-1', value:'test-result'},
      {id: 'test-result-2', value:'test-result'},
      {id: 'test-result-3', value:'test-result'}];
    var expectedResultArray = [{id: 'test-result-1', value:'test-result'},
      {id: 'test-result-2', value:'test-result'},
      {id: 'test-result-3', value:'test-result'}];

    resultServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.list, function() {
      //Publish to done list data topic to fake getting the list of results by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.list, mockResultArray);
    });

    return mediator.request(CLOUD_TOPICS.list).then(function(listResult) {
      expect(listResult, 'List of results received should not be null or undefined').to.exist;
      expect(listResult, 'List of results received should be an array').to.be.an('array');
      expect(listResult, 'List of results received should have the same value as the list of results sent by the mock storage module').to.deep.equal(expectedResultArray);
    });

  });

  // Update
  it('should publish to done update cloud topic when the request to update a result has been completed', function() {
    var mockResultUpdate = {id:'testID', value: 'result-updated'};
    var expectedResultUpdated = {id:'testID', value: 'result-updated'};

    resultServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.update, function(resultToUpdate) {
      //Publish to done update data topic to fake getting the update of results by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.update + ':' + resultToUpdate.id, resultToUpdate);
    });

    return mediator.request(CLOUD_TOPICS.update, mockResultUpdate, {uid: mockResultUpdate.id}).then(function(updatedResult) {
      expect(updatedResult, 'Updated result received should not be null or undefined').to.exist;
      expect(updatedResult, 'Updated result received should be an object').to.be.an('object');
      expect(updatedResult, 'Updated result received should have the same value as the updated result sent by the mock storage module').to.deep.equal(expectedResultUpdated);
    });
  });

  //Read
  it('should publish to done read cloud topic when the request to read a result has been completed', function() {
    var mockResultRead = {id:'testID', value: 'result-read'};
    var expectedResultRead = {id:'testID', value: 'result-read'};
    var uid = "testID";

    resultServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.read, function(uid) {
      //Publish to done read data topic to fake the reading of results by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.read + ':' + uid, mockResultRead);
    });

    return mediator.request(CLOUD_TOPICS.read, uid).then(function(readResult) {
      expect(readResult, 'Read result received should not be null or undefined').to.exist;
      expect(readResult, 'Read result received should be an object').to.be.an('object');
      expect(readResult, 'Read result received should have the same value as the read result sent by the mock storage module').to.deep.equal(expectedResultRead);

    });
  });

  //Delete
  it('should publish to done delete cloud topic when the request to delete a result has been completed', function() {
    var mockResultDelete = {id:'testID', value: 'result-deleted'};
    var expectedResultDeleted = {id:'testID', value: 'result-deleted'};
    var uid = "testID";

    resultServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.delete, function(uid) {
      //Publish to done delete data topic to fake the deleteing of results by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.delete + ':' + uid, mockResultDelete);
    });

    return mediator.request(CLOUD_TOPICS.delete, uid).then(function(deletedResult) {
      expect(deletedResult, 'Deleted result received should not be null or undefined').to.exist;
      expect(deletedResult, 'Deleted result received should be an object').to.be.an('object');
      expect(deletedResult, 'Deleted result received should have the same value as the read result sent by the mock storage module').to.deep.equal(expectedResultDeleted);
    });
  });

});

