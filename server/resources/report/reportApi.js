/**
 * CRUD API for Report.
 *
 */

const report = require('./reportController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/reports/default', report.getDefault);
  router.get('/api/reports/:id', report.getSingleById);


  router.get('/api/reports', report.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/reports', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   report.getListWithArgs
  // )

  router.post('/api/reports', report.createSingle);
  // router.post('/api/reports', requireLogin, report.createSingle);

  router.put('/api/reports/:id', requireLogin, report.updateSingleById);

  router.delete('/api/reports/:id', requireLogin, report.deleteSingle);

}