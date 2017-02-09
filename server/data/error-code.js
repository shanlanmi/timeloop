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
  "0": {
    "code": "0",
    "client": "Oh! It looks like that you are not login.",
    "resource": "videos/common",
    "message": "This remote method need user login.",
  },
  "0001": {
    "code": "0001",
    "client": "Oh! It looks like that service unavailable.",
    "resource": "videos/common",
    "message": "Service unavailable",
  },
  "0002": {
    "code": "0002",
    "client": "Oh! It looks like that you are not login.",
    "resource": "videos/common",
    "message": "Job expired",
  }
};

module.exports = function(code, param) {
  param = param || {};
  var error = errors[code];
  return Object.assign(error, param);
};
