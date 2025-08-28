/**
 * CRUD API for ItemBreakdown.
 *
 */

const itemBreakdown = require('./itemBreakdownController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/item-breakdowns/default', itemBreakdown.getDefault);
  router.get('/api/item-breakdowns/:id', itemBreakdown.getSingleById);


  router.get('/api/item-breakdowns', itemBreakdown.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/item-breakdowns', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   itemBreakdown.getListWithArgs
  // )

  router.post('/api/item-breakdowns', itemBreakdown.createSingle);
  // router.post('/api/item-breakdowns', requireLogin, itemBreakdown.createSingle);

  router.put('/api/item-breakdowns/:id', requireLogin, itemBreakdown.updateSingleById);

  router.delete('/api/item-breakdowns/:id', requireLogin, itemBreakdown.deleteSingle);

}