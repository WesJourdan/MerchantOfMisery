/**
 * Data Model for Item.
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const AffixSchema = new mongoose.Schema(
  { k: { type: String }, v: { type: Number, default: 0 } },
  { _id: false }
);

const itemSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  _shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },

  // fields (per spec)
  name: { type: String, required: '{PATH} is required!' },
  description: { type: String, required: '{PATH} is required!' },
  slot: { type: String, enum: ['weapon','armor','trinket','consumable'], required: true },
  tier: { type: Number, min: 1, max: 5, required: true },
  baseValue: { type: Number, default: 0 },
  affixes: { type: [AffixSchema], default: [] },
  stock: { type: Number, default: 0 },
  isCursed: { type: Boolean, default: false },
  rarity: { type: String, enum: ['common','uncommon','rare','epic','legendary'], default: 'common' }
});

// hooks
itemSchema.pre('save', function () { this.updated = new Date(); });

// statics
itemSchema.statics.getDefault = () => {
  let defaultObj = {};
  itemSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

itemSchema.index({ _user: 1, slot: 1, tier: 1 });
itemSchema.index({ _user: 1, name: 1 });

module.exports = mongoose.model('Item', itemSchema);