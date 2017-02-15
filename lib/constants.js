module.exports = {
  TOPIC_PREFIX: "wfm",
  RESULT_TOPIC_TEMPLATE: "wfm:results:{topicName}",
  RESULT_DONE_TOPIC_TEMPLATE: "done:wfm:results:{topicName}",
  RESULT_ERROR_TOPIC_TEMPLATE: "error:wfm:results:{topicName}",
  SYNC_TOPIC_TEMPLATE: "wfm:sync:{topicName}:{datasetId}",
  SYNC_DONE_TOPIC_TEMPLATE: "done:wfm:sync:{topicName}:{datasetId}",
  SYNC_ERROR_TOPIC_TEMPLATE: "error:wfm:sync:{topicName}:{datasetId}",
  TOPIC_SEPARATOR: ":",
  ERROR_PREFIX: "error",
  DONE_PREFIX: "done",
  TOPICS: {
    CREATE: "create",
    UPDATE: "update",
    LIST: "list",
    REMOVE: "remove",
    READ: "read",
    START: "start",
    STOP: "stop",
    FORCE_SYNC: "force_sync"
  }
};