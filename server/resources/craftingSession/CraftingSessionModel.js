/**
 * Data Model for CraftingSession.
 * Log of a single craft attempt for reproducibility and reports.
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const UsedIngredientSchema = new mongoose.Schema({
  _ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, min: 1, default: 1 }
}, { _id: false });

const AppliedEnchantmentSchema = new mongoose.Schema({
  _enchantment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enchantment', required: true }
}, { _id: false });

const craftingSessionSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // optional linkage to a recipe used (if any)
  _recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },

  // IO
  ingredientsUsed: { type: [UsedIngredientSchema], default: [] },
  enchantmentsApplied: { type: [AppliedEnchantmentSchema], default: [] },

  // RNG + outcome
  seed: { type: String, default: '' },
  forgeNotes: { type: String, default: '' },         // e.g., “the crafter was dripping blood…”
  _resultItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },

  // times
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// hooks
craftingSessionSchema.pre('save', function () { this.updated = new Date(); });

// statics
craftingSessionSchema.statics.getDefault = () => {
  let defaultObj = {};
  craftingSessionSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

craftingSessionSchema.index({ _user: 1, created: -1 });
craftingSessionSchema.index({ _user: 1, _resultItem: 1 });

module.exports = mongoose.model('CraftingSession', craftingSessionSchema);