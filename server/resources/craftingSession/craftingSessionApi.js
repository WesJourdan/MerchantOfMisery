/**
 * CRUD API for CraftingSession.
 *
 */

const craftingSession = require('./craftingSessionController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/crafting-sessions/default', craftingSession.getDefault);
  router.get('/api/crafting-sessions/:id', craftingSession.getSingleById);


  router.get('/api/crafting-sessions', craftingSession.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/crafting-sessions', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   craftingSession.getListWithArgs
  // )

  router.post('/api/crafting-sessions', craftingSession.createSingle);
  // router.post('/api/crafting-sessions', requireLogin, craftingSession.createSingle);

  router.put('/api/crafting-sessions/:id', requireLogin, craftingSession.updateSingleById);

  router.delete('/api/crafting-sessions/:id', requireLogin, craftingSession.deleteSingle);

}