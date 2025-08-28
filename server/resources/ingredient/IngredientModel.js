/**
 * Data Model for Ingredient.
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const ingredientSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // fields
  name: { type: String, required: '{PATH} is required!' },
  type: { type: String, enum: ['material', 'component', 'randomJunk'], default: 'material', index: true },
  tier: { type: Number, min: 1, max: 5, default: 1 },
  rarity: { type: String, enum: ['common','uncommon','rare','epic','legendary'], default: 'common' },
  quantity: { type: Number, min: 0, default: 0 },
  source: { type: String, enum: ['scavenge','breakdown','purchased','quest'], default: 'breakdown' }
});

// hooks
ingredientSchema.pre('save', function () { this.updated = new Date(); });

// statics
ingredientSchema.statics.getDefault = () => {
  let defaultObj = {};
  ingredientSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

// indexes you might want for stock queries
ingredientSchema.index({ _user: 1, name: 1 });
ingredientSchema.index({ _user: 1, type: 1, tier: 1 });

module.exports = mongoose.model('Ingredient', ingredientSchema);