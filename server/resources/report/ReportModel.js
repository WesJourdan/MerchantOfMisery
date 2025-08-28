/**
 * Data Model for Report.
 *
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add properties to the
 * reportSchema below, the create and update controllers
 * will respect the updated model.
 *
 * NOTE: make sure to account for any model changes on the client
 */

const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils')

const reportSchema = mongoose.Schema({
  created: { type: Date, default: Date.now }
  , updated: { type: Date, default: Date.now }

  // specific values for report go below
  , name: { type: String, required: '{PATH} is required!' }
});

// schema hooks
reportSchema.pre('save', function () {
  // set the "updated" field automatically
  this.updated = new Date();
})
// https://mongoosejs.com/docs/middleware.html#types-of-middleware
// NOTE: we can also override some of the default mongo errors here, and replace with more specific YoteErrors

// instance methods go here
// reportSchema.methods.methodName = function() {};

// model static functions go here
// reportSchema.statics.staticFunctionName = function() {};
reportSchema.statics.getDefault = () => {
  let defaultObj = {};
  reportSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
}

// necessary for server-side text search.
// reportSchema.index({
//   name: 'text'
// })

// export the model to be used in the controller
module.exports = mongoose.model('Report', reportSchema);
