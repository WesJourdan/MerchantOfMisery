/**
 * CRUD API for ContractRun.
 *
 */

const contractRun = require('./contractRunController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/contract-runs/default', contractRun.getDefault);
  router.get('/api/contract-runs/:id', contractRun.getSingleById);


  router.get('/api/contract-runs', contractRun.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/contract-runs', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   contractRun.getListWithArgs
  // )

  router.post('/api/contract-runs', contractRun.createSingle);
  // router.post('/api/contract-runs', requireLogin, contractRun.createSingle);

  router.put('/api/contract-runs/:id', requireLogin, contractRun.updateSingleById);

  router.delete('/api/contract-runs/:id', requireLogin, contractRun.deleteSingle);

}