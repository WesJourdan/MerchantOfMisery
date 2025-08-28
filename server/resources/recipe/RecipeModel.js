/**
 * Data Model for Recipe.
 * Defines a (semi-)deterministic mapping of ingredients (+ optional enchants) → item archetype.
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const AffixSchema = new mongoose.Schema(
  { k: { type: String }, v: { type: Number, default: 0 } },
  { _id: false }
);

const RecipeInputSchema = new mongoose.Schema({
  _ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, min: 1, default: 1 }
}, { _id: false });

const recipeSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // definition
  name: { type: String, required: '{PATH} is required!' },                // e.g., "Frosted Iron Blade"
  requiredTier: { type: Number, min: 1, max: 5, default: 1 },
  outputSlot: { type: String, enum: ['weapon','armor','trinket','consumable'], required: true },
  inputs: { type: [RecipeInputSchema], default: [] },
  allowedFamilies: { type: [String], default: [] },                       // e.g., ['frost','cow']
  baseAffixes: { type: [AffixSchema], default: [] },                      // guarantees baseline stats
  notes: { type: String, default: '' }
});

// hooks
recipeSchema.pre('save', function () { this.updated = new Date(); });

// statics
recipeSchema.statics.getDefault = () => {
  let defaultObj = {};
  recipeSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

recipeSchema.index({ _user: 1, outputSlot: 1, requiredTier: 1 });
recipeSchema.index({ _user: 1, name: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);