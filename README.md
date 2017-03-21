# FeedHenry WFM Result

A result module for WFM, for working with the results of pushing a workorder through a workflow.

## Client-side usage

### Setup
This module can be initialised by 

```javascript
var resultModule = require('fh-wfm-result');

//Initialising the result module with a mediator. This will set up all of the subscribers for the result module.
resultModule(mediator);

//The result mediator topics are now subscribed.
mediator.subscribe("done:wfm:results:list", function(arrayOfResults) {
  ...
  console.log("All Results", arrayOfResults);
  ...
});

mediator.publish("wfm:results:list");
```

#### Integration

### Topic Subscriptions

#### wfm:result:create

##### Description

Creating a new Result

##### Example


```javascript
var parameters = {
  resultToCreate: {
    //A Valid JSON Object
  },
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:result:create", parameters);
```

#### wfm:result:read

##### Description

Read a single Result

##### Example


```javascript
var parameters = {
  id: "resultId",
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:result:read", parameters);
```

#### wfm:result:update

##### Description

Update a single Result

##### Example


```javascript
var parameters = {
  resultToUpdate: {
    ...
    id: "resultId"
    ...
  },
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:result:update", parameters);
```


#### wfm:result:remove

##### Description

Remove a single Result

##### Example


```javascript
var parameters = {
  id: "resultId",
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:result:remove", parameters);
```


#### wfm:result:list

##### Description

List All Results

##### Example


```javascript
var parameters = {
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:result:list", parameters);
```


### Published Topics

The following topics are published by this module. Developers are free to implement these topics subscribers, or use a module that already has these subscribers implement (E.g. the [raincatcher-sync](https://github.com/feedhenry-raincatcher/raincatcher-sync) module).


| Topic         | Description           |
| ------------- |:-------------:| 
| wfm:sync:results:create              |   Create a new item in the sync `results` collection |
| wfm:sync:results:update              |   Update an existing item in the sync `results` collection |
| wfm:sync:results:list              |   List all items in the sync `results` collection |
| wfm:sync:results:remove              |   Remove an existing item from the sync `results` collection |
| wfm:sync:results:read              |   Read a single item from the sync `results` collection |
| wfm:sync:results:start              |   Start the sync process for sync `results` collection |
| wfm:sync:results:stop              |   Stop the sync process for sync `results` collection |
| wfm:sync:results:force_sync        |   Force a sync cycle from client to cloud for sync `results` collection |


### Topic Subscriptions

| Topic         | Description           |
| ------------- |:-------------:| 
| done:wfm:sync:results:create        |   A result was created in the `results` dataset |
| error:wfm:sync:results:create        |   An error occurred when creating an item in the `results` dataset. |
| done:wfm:sync:results:update        |   A result was updated in the `results` dataset |
| error:wfm:sync:results:update        |   An error occurred when updating an item in the `results` dataset. |
| done:wfm:sync:results:list        |   A list of the items in the `results` dataset completed |
| error:wfm:sync:results:list        |   An error occurred when listing items in the `results` dataset. |
| done:wfm:sync:results:remove        |   A result was removed from the `results` dataset |
| error:wfm:sync:results:remove        |   An error occurred when removing an item in the `results` dataset. |
| done:wfm:sync:results:read        |   A item was read correctly from the `results` dataset |
| error:wfm:sync:results:read        |   An error occurred when reading an item in the `results` dataset. |
| done:wfm:sync:results:start        |   The sync process started for the `results` dataset. |
| error:wfm:sync:results:start        |   An error occurred when starting the `results` dataset. |
| done:wfm:sync:results:stop        |   The sync process stopped for the `results` dataset. |
| error:wfm:sync:results:stop        |   An error occurred when stopping the `results` dataset sync process. |
| done:wfm:sync:results:force_sync        |  A force sync process completed for the `results` dataset. |
| error:wfm:sync:results:force_sync        |   An error occurred when forcing the sync process for the `results` dataset. |

### Mediator events
the module broadcasts, and listens for the following events

| Listens for | Responds with |
| ----------- | ------------- |
| `wfm:appform:submission:complete` | `wfm:result:remote-update` |

## Usage in an express backend

### Setup
The server-side component of this WFM module exports a function that takes express and mediator instances as parameters, as in:

```javascript
var express = require('express')
  , app = express()
  , mbaasExpress = mbaasApi.mbaasExpress()
  , mediator = require('fh-wfm-mediator/lib/mediator')
  ;

// configure the express app
...

// setup the wfm result sync server
require('fh-wfm-result/lib/server')(mediator, app, mbaasApi);

```

### Integration

Check this [demo cloud application](https://github.com/feedhenry-staff/wfm-cloud/blob/master/lib/app/workorder.js)
