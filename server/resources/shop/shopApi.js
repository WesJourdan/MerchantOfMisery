/**
 * CRUD API for Shop.
 *
 */

const shop = require('./shopController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/shops/default', shop.getDefault);
  router.get('/api/shops/:id', requireLogin, shop.getSingleById);
  router.post('/api/shops/:shopId/advance-day', requireLogin, shop.advanceDay);


  router.get('/api/shops', requireLogin, shop.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/shops', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   shop.getListWithArgs
  // )

  router.post('/api/shops', requireLogin, shop.createSingle);
  // router.post('/api/shops', requireLogin, shop.createSingle);

  router.put('/api/shops/:id', requireLogin, shop.updateSingleById);

  router.delete('/api/shops/:id', requireLogin, shop.deleteSingle);

}