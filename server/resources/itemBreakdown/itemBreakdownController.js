/**
 * Sever-side controllers for ItemBreakdown.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the ItemBreakdown
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const ItemBreakdown = require('./ItemBreakdownModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const itemBreakdown = await ItemBreakdown.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding ItemBreakdown", 404);
  });
  if(!itemBreakdown) throw new YoteError("Could not find matching ItemBreakdown", 404);
  res.json(itemBreakdown);
}

exports.createSingle = async (req, res) => {
  const newItemBreakdown = new ItemBreakdown(req.body);
  const itemBreakdown = await newItemBreakdown.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating ItemBreakdown", 404);
  });
  res.json(itemBreakdown);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched ItemBreakdown Ids", 403);
  }
  const oldItemBreakdown = await ItemBreakdown.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding ItemBreakdown", 404);
  });
  if(!oldItemBreakdown) throw new YoteError("Could not find matching ItemBreakdown", 404);
  // apply updates
  Object.assign(oldItemBreakdown, req.body);
  const itemBreakdown = await oldItemBreakdown.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update ItemBreakdown", 404);
  });
  res.json(itemBreakdown);
}

exports.deleteSingle = async (req, res) => {
  const oldItemBreakdown = await ItemBreakdown.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding ItemBreakdown", 404);
  });
  if(!oldItemBreakdown) throw new YoteError("Could not find matching ItemBreakdown", 404);
  const deletedItemBreakdown = await oldItemBreakdown.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this ItemBreakdown", 404);
  });
  // console.log('itemBreakdown deleted', deletedItemBreakdown);
  // return the deleted itemBreakdown
  res.json(deletedItemBreakdown);
}

exports.getDefault = async (req, res) => {
  const defaultItemBreakdown = await ItemBreakdown.getDefault();
  if(!defaultItemBreakdown) throw new YoteError("Could not find default ItemBreakdown", 404);
  res.json(defaultItemBreakdown);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { itemBreakdowns, totalPages, totalCount } = await utilFetchItemBreakdownList({ query, pagination, sort, limit });
  res.json({ itemBreakdowns, totalPages, totalCount });
}

// FETCH UTILS
const utilFetchItemBreakdownList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await ItemBreakdown.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const itemBreakdowns = await ItemBreakdown.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding ItemBreakdown list", 404);
    });
  return { itemBreakdowns, totalPages, totalCount };
}