/**
 * Sever-side controllers for Report.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Report
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const Report = require('./ReportModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const report = await Report.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Report", 404);
  });
  if(!report) throw new YoteError("Could not find matching Report", 404);
  res.json(report);
}

exports.createSingle = async (req, res) => {
  const newReport = new Report(req.body);
  const report = await newReport.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating Report", 404);
  });
  res.json(report);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched Report Ids", 403);
  }
  const oldReport = await Report.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Report", 404);
  });
  if(!oldReport) throw new YoteError("Could not find matching Report", 404);
  // apply updates
  Object.assign(oldReport, req.body);
  const report = await oldReport.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update Report", 404);
  });
  res.json(report);
}

exports.deleteSingle = async (req, res) => {
  const oldReport = await Report.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Report", 404);
  });
  if(!oldReport) throw new YoteError("Could not find matching Report", 404);
  const deletedReport = await oldReport.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this Report", 404);
  });
  // console.log('report deleted', deletedReport);
  // return the deleted report
  res.json(deletedReport);
}

exports.getDefault = async (req, res) => {
  const defaultReport = await Report.getDefault();
  if(!defaultReport) throw new YoteError("Could not find default Report", 404);
  res.json(defaultReport);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { reports, totalPages, totalCount } = await utilFetchReportList({ query, pagination, sort, limit });
  res.json({ reports, totalPages, totalCount });
}

// FETCH UTILS
const utilFetchReportList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await Report.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const reports = await Report.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding Report list", 404);
    });
  return { reports, totalPages, totalCount };
}