/**
 * Data Model for Shop.
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const shopSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // fields
  name: { type: String, required: true },
  description: { type: String, default: '' },
  gold: { type: Number, default: 500 },
  reputation: { type: Number, min: -100, max: 100, default: 0 },
  priceStrategy: { type: String, enum: ['greedy','fair','altruist'], default: 'fair' },
  // priceModifiers: { type: Map, of: Number, default: {} }, // e.g. "slot:armor:tier:2" -> 0.15
  day: { type: Number, default: 0 },
  worldSeed: { type: String, required: true }
});

// hooks
shopSchema.pre('save', function () { this.updated = new Date(); });

// statics
shopSchema.statics.getDefault = () => {
  let defaultObj = {};
  shopSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

shopSchema.index({ _user: 1 });
shopSchema.index({ _user: 1, day: 1 });

module.exports = mongoose.model('Shop', shopSchema);