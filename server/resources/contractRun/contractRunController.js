/**
 * Sever-side controllers for ContractRun.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the ContractRun
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const ContractRun = require('./ContractRunModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const contractRun = await ContractRun.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding ContractRun", 404);
  });
  if(!contractRun) throw new YoteError("Could not find matching ContractRun", 404);
  res.json(contractRun);
}

exports.createSingle = async (req, res) => {
  const newContractRun = new ContractRun(req.body);
  const contractRun = await newContractRun.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating ContractRun", 404);
  });
  res.json(contractRun);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched ContractRun Ids", 403);
  }
  const oldContractRun = await ContractRun.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding ContractRun", 404);
  });
  if(!oldContractRun) throw new YoteError("Could not find matching ContractRun", 404);
  // apply updates
  Object.assign(oldContractRun, req.body);
  const contractRun = await oldContractRun.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update ContractRun", 404);
  });
  res.json(contractRun);
}

exports.deleteSingle = async (req, res) => {
  const oldContractRun = await ContractRun.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding ContractRun", 404);
  });
  if(!oldContractRun) throw new YoteError("Could not find matching ContractRun", 404);
  const deletedContractRun = await oldContractRun.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this ContractRun", 404);
  });
  // console.log('contractRun deleted', deletedContractRun);
  // return the deleted contractRun
  res.json(deletedContractRun);
}

exports.getDefault = async (req, res) => {
  const defaultContractRun = await ContractRun.getDefault();
  if(!defaultContractRun) throw new YoteError("Could not find default ContractRun", 404);
  res.json(defaultContractRun);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { contractRuns, totalPages, totalCount } = await utilFetchContractRunList({ query, pagination, sort, limit });
  res.json({ contractRuns, totalPages, totalCount });
}

// FETCH UTILS
const utilFetchContractRunList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await ContractRun.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const contractRuns = await ContractRun.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding ContractRun list", 404);
    });
  return { contractRuns, totalPages, totalCount };
}