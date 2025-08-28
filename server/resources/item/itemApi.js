/**
 * CRUD API for Item.
 *
 */

const item = require('./itemController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/items/default', item.getDefault);
  router.get('/api/items/:id', item.getSingleById);


  router.get('/api/items', item.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/items',
  //   requireLogin,
  //   requireAccountAccess,
  //   item.getListWithArgs
  // )
  // TODO: Convert to post?
  router.get('/api/items/seed-random/:shopId', item.seedRandomItems);
  router.post('/api/items', requireLogin, item.createSingle);
  // router.post('/api/items', requireLogin, item.createSingle);

  router.put('/api/items/:id', requireLogin, item.updateSingleById);

  router.delete('/api/items/:id', requireLogin, item.deleteSingle);

}