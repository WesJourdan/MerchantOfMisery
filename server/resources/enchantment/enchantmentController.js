/**
 * Sever-side controllers for Enchantment.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Enchantment
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const Enchantment = require('./EnchantmentModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const enchantment = await Enchantment.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Enchantment", 404);
  });
  if(!enchantment) throw new YoteError("Could not find matching Enchantment", 404);
  res.json(enchantment);
}

exports.createSingle = async (req, res) => {
  const newEnchantment = new Enchantment(req.body);
  const enchantment = await newEnchantment.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating Enchantment", 404);
  });
  res.json(enchantment);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched Enchantment Ids", 403);
  }
  const oldEnchantment = await Enchantment.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Enchantment", 404);
  });
  if(!oldEnchantment) throw new YoteError("Could not find matching Enchantment", 404);
  // apply updates
  Object.assign(oldEnchantment, req.body);
  const enchantment = await oldEnchantment.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update Enchantment", 404);
  });
  res.json(enchantment);
}

exports.deleteSingle = async (req, res) => {
  const oldEnchantment = await Enchantment.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Enchantment", 404);
  });
  if(!oldEnchantment) throw new YoteError("Could not find matching Enchantment", 404);
  const deletedEnchantment = await oldEnchantment.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this Enchantment", 404);
  });
  // console.log('enchantment deleted', deletedEnchantment);
  // return the deleted enchantment
  res.json(deletedEnchantment);
}

exports.getDefault = async (req, res) => {
  const defaultEnchantment = await Enchantment.getDefault();
  if(!defaultEnchantment) throw new YoteError("Could not find default Enchantment", 404);
  res.json(defaultEnchantment);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { enchantments, totalPages, totalCount } = await utilFetchEnchantmentList({ query, pagination, sort, limit });
  res.json({ enchantments, totalPages, totalCount });
}

// FETCH UTILS
const utilFetchEnchantmentList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await Enchantment.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const enchantments = await Enchantment.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding Enchantment list", 404);
    });
  return { enchantments, totalPages, totalCount };
}