/**
 * Data Model for Run (execution of a contract by heroes).
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const runResultSchema = new mongoose.Schema({
  outcome: { type: String, enum: ['success','partial','fail','betrayal'] },
  _casualties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hero' }],
  _loot: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  gold: { type: Number, default: 0 },
  report: { type: String, default: '' },
  seed: { type: String, default: '' }
}, { _id: false });

const runSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  _shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },

  // links
  _contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  _heroes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hero', required: true }],

  // timing
  startDay: { type: Number },
  resolveDay: { type: Number },

  // outcome + reproducibility
  result: { type: runResultSchema, default: undefined },
  seed: { type: String, required: true }
});

// hooks
runSchema.pre('save', function () { this.updated = new Date(); });

// statics
runSchema.statics.getDefault = () => {
  let defaultObj = {};
  runSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

runSchema.index({ _user: 1, resolveDay: 1 });
runSchema.index({ _user: 1, _contract: 1 });

module.exports = mongoose.model('ContractRun', runSchema);