/**
 * CRUD API for Contract.
 *
 */

const contract = require('./contractController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/contracts/default', contract.getDefault);
  router.get('/api/contracts/:id', contract.getSingleById);


  router.get('/api/contracts', contract.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/contracts', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   contract.getListWithArgs
  // )

  router.post('/api/contracts', contract.createSingle);
  // router.post('/api/contracts', requireLogin, contract.createSingle);

  router.put('/api/contracts/:id', requireLogin, contract.updateSingleById);

  router.delete('/api/contracts/:id', requireLogin, contract.deleteSingle);

}