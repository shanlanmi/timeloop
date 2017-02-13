var psErr = require('../../server/data/error-code.js');

module.exports = function(Message) {
  Message.greet = function(msg, cb) {
    console.dir(err.aaa.aaa);
    if (Number(msg) === 0) {
      var param = {
        message: "yoho!"
      };
      // return cb(psErr("0001", param));
      try {
        console.dir(err.aaa.aaa);
      } catch(err) {
        var err = err;
        console.dir(err);
        var err = { 
          "code": "1",
          "message_dev": err
        };
        return cb(err);
      }
    }
    msg = msg || 'hello';
    return cb(null, 'Sender says ' + msg + ' to receiver');
  };
};
