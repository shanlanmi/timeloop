/**
 * error handle
 * - Default error code is 1
 * - Default success code is 0
 */
'use strict';
module.exports = function(options) {
  return function logError(err, req, res, next) {
    // console.dir(Object.keys(res));
    var errHanlde = {
      code: 0,
    };
    if (err.code)  errHanlde.code = err.code;
    if (err.client)  errHanlde.message = err.client;
    if (err.message)  errHanlde.devMessage = err.message;
    if (err.stack) errHanlde.stack = err.stack.split("\n    ");
    if (err.resource) errHanlde.resource = err.resource;
    next(errHanlde);
  };
};
