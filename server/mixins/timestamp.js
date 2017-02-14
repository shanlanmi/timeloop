/*
 * This mixins can creating records with created_at and updated_at
 * Add the code in the modelName.json file

  "mixins": {
    "Timestamp": {}
  },

 */
module.exports = function(Model, options) {

  // Model is the model class
  // options is an object containing the config properties from model definition
  Model.defineProperty('created', { type: Date, default: '$now' });
  Model.defineProperty('updated', { type: Date, default: '$now' });

};
