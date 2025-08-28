/**
 * Data Model for Breakdown (Salvage).
 * Dismantle an Item into Ingredients.
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const ReturnedMaterialSchema = new mongoose.Schema({
  _ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, min: 1, default: 1 }
}, { _id: false });

const breakdownSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // source & result
  _sourceItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  materialsReturned: { type: [ReturnedMaterialSchema], default: [] },

  // RNG + meta
  seed: { type: String, default: '' },
  notes: { type: String, default: '' }
});

// hooks
breakdownSchema.pre('save', function () { this.updated = new Date(); });

// statics
breakdownSchema.statics.getDefault = () => {
  let defaultObj = {};
  breakdownSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

breakdownSchema.index({ _user: 1, created: -1 });
breakdownSchema.index({ _user: 1, _sourceItem: 1 });

module.exports = mongoose.model('ItemBreakdown', breakdownSchema);