/*
 * This mixins can read context
 * Add the code in the modelName.json file
 *
 * e.g.
 * "mixins": {
 *   "GetContext": {}
 * },
 *
 */

module.exports = function(Model, options) {

  Model.createOptionsFromRemotingContext = function(ctx) {
    var base = this.base.createOptionsFromRemotingContext(ctx);
    return Object.assign(base, {
      // currentUserId: base.accessToken && base.accessToken.userId,
      headers: ctx.req.headers,
      req: ctx.req
    });
  };

};
