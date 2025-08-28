/**
 * Data Model for Enchantment.
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const AffixSchema = new mongoose.Schema(
  { k: { type: String }, v: { type: Number, default: 0 } },
  { _id: false }
);

const enchantmentSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // catalog fields
  name: { type: String, required: '{PATH} is required!' },                // e.g., "Frost"
  family: { type: String, enum: [
    'fire','frost','poison','holy','shadow','chaos','lightning',
    'cow','greed','misfortune','alcohol','gluten','flatulence','love'
  ], index: true, required: true },
  variants: { type: [String], default: [] },                              // e.g., ["of Chilling","Gelid","Frozen"]
  statModifiers: { type: [AffixSchema], default: [] },                    // affix templates applied on craft
  isCursed: { type: Boolean, default: false }
});

// hooks
enchantmentSchema.pre('save', function () { this.updated = new Date(); });

// statics
enchantmentSchema.statics.getDefault = () => {
  let defaultObj = {};
  enchantmentSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

enchantmentSchema.index({ _user: 1, family: 1, name: 1 }, { unique: false });

module.exports = mongoose.model('Enchantment', enchantmentSchema);