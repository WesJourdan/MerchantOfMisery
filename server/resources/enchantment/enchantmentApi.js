/**
 * CRUD API for Enchantment.
 *
 */

const enchantment = require('./enchantmentController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/enchantments/default', enchantment.getDefault);
  router.get('/api/enchantments/:id', enchantment.getSingleById);


  router.get('/api/enchantments', enchantment.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/enchantments', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   enchantment.getListWithArgs
  // )

  router.post('/api/enchantments', enchantment.createSingle);
  // router.post('/api/enchantments', requireLogin, enchantment.createSingle);

  router.put('/api/enchantments/:id', requireLogin, enchantment.updateSingleById);

  router.delete('/api/enchantments/:id', requireLogin, enchantment.deleteSingle);

}