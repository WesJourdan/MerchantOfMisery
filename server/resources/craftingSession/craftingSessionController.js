/**
 * Sever-side controllers for CraftingSession.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the CraftingSession
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const CraftingSession = require('./CraftingSessionModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const craftingSession = await CraftingSession.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding CraftingSession", 404);
  });
  if(!craftingSession) throw new YoteError("Could not find matching CraftingSession", 404);
  res.json(craftingSession);
}

exports.createSingle = async (req, res) => {
  const newCraftingSession = new CraftingSession(req.body);
  const craftingSession = await newCraftingSession.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating CraftingSession", 404);
  });
  res.json(craftingSession);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched CraftingSession Ids", 403);
  }
  const oldCraftingSession = await CraftingSession.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding CraftingSession", 404);
  });
  if(!oldCraftingSession) throw new YoteError("Could not find matching CraftingSession", 404);
  // apply updates
  Object.assign(oldCraftingSession, req.body);
  const craftingSession = await oldCraftingSession.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update CraftingSession", 404);
  });
  res.json(craftingSession);
}

exports.deleteSingle = async (req, res) => {
  const oldCraftingSession = await CraftingSession.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding CraftingSession", 404);
  });
  if(!oldCraftingSession) throw new YoteError("Could not find matching CraftingSession", 404);
  const deletedCraftingSession = await oldCraftingSession.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this CraftingSession", 404);
  });
  // console.log('craftingSession deleted', deletedCraftingSession);
  // return the deleted craftingSession
  res.json(deletedCraftingSession);
}

exports.getDefault = async (req, res) => {
  const defaultCraftingSession = await CraftingSession.getDefault();
  if(!defaultCraftingSession) throw new YoteError("Could not find default CraftingSession", 404);
  res.json(defaultCraftingSession);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { craftingSessions, totalPages, totalCount } = await utilFetchCraftingSessionList({ query, pagination, sort, limit });
  res.json({ craftingSessions, totalPages, totalCount });
}

// FETCH UTILS
const utilFetchCraftingSessionList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await CraftingSession.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const craftingSessions = await CraftingSession.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding CraftingSession list", 404);
    });
  return { craftingSessions, totalPages, totalCount };
}