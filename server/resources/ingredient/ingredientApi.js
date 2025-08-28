/**
 * CRUD API for Ingredient.
 *
 */

const ingredient = require('./ingredientController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/ingredients/default', ingredient.getDefault);
  router.get('/api/ingredients/:id', ingredient.getSingleById);


  router.get('/api/ingredients', ingredient.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/ingredients', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   ingredient.getListWithArgs
  // )

  router.post('/api/ingredients', ingredient.createSingle);
  // router.post('/api/ingredients', requireLogin, ingredient.createSingle);

  router.put('/api/ingredients/:id', requireLogin, ingredient.updateSingleById);

  router.delete('/api/ingredients/:id', requireLogin, ingredient.deleteSingle);

}