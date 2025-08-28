/**
 * CRUD API for Hero.
 *
 */

const hero = require('./heroController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/heroes/default', hero.getDefault);
  router.get('/api/heroes/:id', hero.getSingleById);


  router.get('/api/heroes', hero.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/heroes', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   hero.getListWithArgs
  // )

  router.post('/api/heroes', hero.createSingle);
  // router.post('/api/heroes', requireLogin, hero.createSingle);

  router.put('/api/heroes/:id', requireLogin, hero.updateSingleById);

  router.delete('/api/heroes/:id', requireLogin, hero.deleteSingle);

}