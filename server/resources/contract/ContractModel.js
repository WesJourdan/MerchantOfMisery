/**
 * Data Model for Contract (Offer/Accepted/Resolved).
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const ExpectedRewardSchema = new mongoose.Schema({
  goldMin: { type: Number, default: 0 },
  goldMax: { type: Number, default: 0 },
  lootHint: { type: String, default: '' }
}, { _id: false });

const contractSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  _shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  // fields (per spec)
  dungeonTier: { type: Number, min: 1, max: 5, required: true },
  objective: { type: String, enum: ['retrieve','scout','escort'], required: true },
  baseRisk: { type: Number, min: 0, max: 1, required: true },
  expectedReward: { type: ExpectedRewardSchema, default: () => ({}) },
  etaDays: { type: Number, min: 1, default: 2 },
  state: { type: String, enum: ['offered','accepted','resolved'], default: 'offered', index: true },
  seed: { type: String, required: true }
});

// hooks
contractSchema.pre('save', function () { this.updated = new Date(); });

// statics
contractSchema.statics.getDefault = () => {
  let defaultObj = {};
  contractSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

contractSchema.index({ _user: 1, state: 1 });
contractSchema.index({ _user: 1, dungeonTier: 1 });

module.exports = mongoose.model('Contract', contractSchema);