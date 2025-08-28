/**
 * Data Model for Hero.
 */
const mongoose = require('mongoose');
const apiUtils = require('../../global/api/apiUtils');

const heroSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },

  // owner
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // fields (per spec)
  name: { type: String, required: '{PATH} is required!' },
  class: { type: String, enum: ['soldier','rogue','acolyte','ranger'], required: true },
  level: { type: Number, default: 1 },
  quirks: { type: [String], default: [] },
  loyalty: { type: Number, min: 0, max: 100, default: 50 },
  greed: { type: Number, min: 0, max: 100, default: 50 },
  riskTolerance: { type: Number, min: 0, max: 100, default: 50 },

  // underscore-prefixed refs
  _equipment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],

  status: { type: String, enum: ['idle','on_contract','dead','missing'], default: 'idle' }
});

// hooks
heroSchema.pre('save', function () { this.updated = new Date(); });

// statics
heroSchema.statics.getDefault = () => {
  let defaultObj = {};
  heroSchema.eachPath((path, schemaType) => {
    defaultObj[path] = apiUtils.defaultValueFromSchema(schemaType);
  });
  return defaultObj;
};

heroSchema.index({ _user: 1, status: 1 });
heroSchema.index({ _user: 1, class: 1, level: 1 });

module.exports = mongoose.model('Hero', heroSchema);