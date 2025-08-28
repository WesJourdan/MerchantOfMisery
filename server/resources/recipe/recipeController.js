/**
 * Sever-side controllers for Recipe.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Recipe
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const Recipe = require('./RecipeModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Recipe", 404);
  });
  if(!recipe) throw new YoteError("Could not find matching Recipe", 404);
  res.json(recipe);
}

exports.createSingle = async (req, res) => {
  const newRecipe = new Recipe(req.body);
  const recipe = await newRecipe.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating Recipe", 404);
  });
  res.json(recipe);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched Recipe Ids", 403);
  }
  const oldRecipe = await Recipe.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Recipe", 404);
  });
  if(!oldRecipe) throw new YoteError("Could not find matching Recipe", 404);
  // apply updates
  Object.assign(oldRecipe, req.body);
  const recipe = await oldRecipe.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update Recipe", 404);
  });
  res.json(recipe);
}

exports.deleteSingle = async (req, res) => {
  const oldRecipe = await Recipe.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Recipe", 404);
  });
  if(!oldRecipe) throw new YoteError("Could not find matching Recipe", 404);
  const deletedRecipe = await oldRecipe.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this Recipe", 404);
  });
  // console.log('recipe deleted', deletedRecipe);
  // return the deleted recipe
  res.json(deletedRecipe);
}

exports.getDefault = async (req, res) => {
  const defaultRecipe = await Recipe.getDefault();
  if(!defaultRecipe) throw new YoteError("Could not find default Recipe", 404);
  res.json(defaultRecipe);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { recipes, totalPages, totalCount } = await utilFetchRecipeList({ query, pagination, sort, limit });
  res.json({ recipes, totalPages, totalCount });
}

// FETCH UTILS
const utilFetchRecipeList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await Recipe.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const recipes = await Recipe.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding Recipe list", 404);
    });
  return { recipes, totalPages, totalCount };
}