/**
 * Query the error code and return the specify error object.
 * team document: <https://github.com/pathsource/frigate_bird/wiki/Error-code-%E8%AE%BE%E8%AE%A1>
 * @code {string} error code
 * @param {object} defind custom error infomation in param object
 *   @code {string} error code
 *   @client {string} the message that display at client
 *   @resource {string} the js file that throw error
 *   @message {string} the debug message
 *
 * e.g.
 * var psErr = require('../../server/data/error-code.js');
 * var param = {
 *  "code": "0002",
 *  "client": "Oh! It looks like that you are not login.",
 *  "resource": "videos/common",
 *  "message": "This remote method need user login.",
 *   message: "custom message"
 * };
 * return cb(psErr("0001", param));
 */

var errors = {

  /**
   * System error code
   */
  "0": {
    "code": "0",
    "client": "Unhandle error"
  },
  "1": {
    "code": "1",
    "client": "Success"
  },
  "0001": {
    "code": "0001",
    "client": "Service unavailable",
    "message": "Service unavailable"
  },
  "0002": {
    "code": "0002",
    "client": "Job expired",
    "message": "Job expired"
  },
  "0003": {
    "code": "0003",
    "client": "System is busy",
    "message": "System is busy"
  },

  /**
   * Server side error code
   */
  "0101": {
    "code": "0101",
    "client": "Permission denied",
    "message": "Permission denied"
  },
  "0102": {
    "code": "0102",
    "client": "App Call Limited",
    "message": "App Call Limited"
  },
  "0103": {
    "code": "0103",
    "client": "IP limit",
    "message": "IP limit"
  },
  "0104": {
    "code": "0104",
    "client": "Elasticsearch unavailable",
    "message": "Elasticsearch unavailable"
  },
  "0105": {
    "code": "0105",
    "client": "Redis unavailable",
    "message": "Redis unavailable"
  },
  "0106": {
    "code": "0106",
    "client": "Memcached unavailable",
    "message": "Memcached unavailable"
  },
  "0107": {
    "code": "0107",
    "client": "Database connection unavailable",
    "message": "Database connection unavailable"
  },

  /**
   * Client common error code
   */
  "0201": {
    "code": "0201",
    "client": "Request api not found",
    "message": "Request api not found"
  },
  "0202": {
    "code": "0202",
    "client": "HTTP Action Not Allowed",
    "message": "HTTP Action Not Allowed"
  },
  "0203": {
    "code": "0203",
    "client": "Request body length over limit",
    "message": "Request body length over limit"
  },
  "0204": {
    "code": "0204",
    "client": "Upload Fail",
    "message": "Upload Fail"
  },
  "0205": {
    "code": "0205",
    "client": "Invalid Version",
    "message": "Invalid Version"
  },
  "0206": {
    "code": "0206",
    "client": "Invalid Arguments",
    "message": "Invalid Arguments"
  },
  "0207": {
    "code": "0207",
    "client": "Missing Required Arguments",
    "message": "Missing Required Arguments"
  },
  "0208": {
    "code": "0208",
    "client": "Invalid Format",
    "message": "Invalid Format"
  },

  /**
   * User error code
   */
  "1001": {
    "code": "1001",
    "client": "Missing Token",
    "message": "Missing Token"
  },
  "1002": {
    "code": "1002",
    "client": "Token used",
    "message": "Token used"
  },
  "1003": {
    "code": "1003",
    "client": "Token expired",
    "message": "Token expired"
  },
  "1004": {
    "code": "1004",
    "client": "Token revoked",
    "message": "Token revoked"
  },
  "1005": {
    "code": "1005",
    "client": "Need login",
    "message": "Need login"
  },
  "1006": {
    "code": "1006",
    "client": "Uuid parameter is null",
    "message": "Uuid parameter is null"
  },
  "1007": {
    "code": "1007",
    "client": "User does not exists",
    "message": "User does not exists"
  },
  "1008": {
    "code": "1008",
    "client": "Username or password error",
    "message": "Username or password error"
  },

  /**
   * Video error code
   */
  "1101": {
    "code": "1101",
    "client": "Invalid video id",
    "message": "Invalid video id"
  }
};

module.exports = function(code, param) {
  param = param || {};
  var error = errors[code];
  return Object.assign(error, param);
};
