/**
 * CRUD API for Recipe.
 *
 */

const recipe = require('./recipeController')

// for standard projects
const { requireLogin, requireAccountAccess } = require('../../global/handlers/authHandler')

// "ex of loading additional authentication options from external source"
// const { requireLogin, requireAdmin, requireProfile, requireSupport, requireAccountManagement, requireAuthoring } = require('shared-resources').authUtils;

module.exports = (router) => {

  router.get('/api/recipes/default', recipe.getDefault);
  router.get('/api/recipes/:id', recipe.getSingleById);


  router.get('/api/recipes', recipe.getListWithArgs);

  // // same but with api level restrictions
  // router.get('/api/recipes', 
  //   requireLogin, 
  //   requireAccountAccess, 
  //   recipe.getListWithArgs
  // )

  router.post('/api/recipes', recipe.createSingle);
  // router.post('/api/recipes', requireLogin, recipe.createSingle);

  router.put('/api/recipes/:id', requireLogin, recipe.updateSingleById);

  router.delete('/api/recipes/:id', requireLogin, recipe.deleteSingle);

}