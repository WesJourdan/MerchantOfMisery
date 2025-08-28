/**
 * Sever-side controllers for Ingredient.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Ingredient
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const Ingredient = require('./IngredientModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const ingredient = await Ingredient.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Ingredient", 404);
  });
  if(!ingredient) throw new YoteError("Could not find matching Ingredient", 404);
  res.json(ingredient);
}

exports.createSingle = async (req, res) => {
  const newIngredient = new Ingredient(req.body);
  const ingredient = await newIngredient.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating Ingredient", 404);
  });
  res.json(ingredient);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched Ingredient Ids", 403);
  }
  const oldIngredient = await Ingredient.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Ingredient", 404);
  });
  if(!oldIngredient) throw new YoteError("Could not find matching Ingredient", 404);
  // apply updates
  Object.assign(oldIngredient, req.body);
  const ingredient = await oldIngredient.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update Ingredient", 404);
  });
  res.json(ingredient);
}

exports.deleteSingle = async (req, res) => {
  const oldIngredient = await Ingredient.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Ingredient", 404);
  });
  if(!oldIngredient) throw new YoteError("Could not find matching Ingredient", 404);
  const deletedIngredient = await oldIngredient.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this Ingredient", 404);
  });
  // console.log('ingredient deleted', deletedIngredient);
  // return the deleted ingredient
  res.json(deletedIngredient);
}

exports.getDefault = async (req, res) => {
  const defaultIngredient = await Ingredient.getDefault();
  if(!defaultIngredient) throw new YoteError("Could not find default Ingredient", 404);
  res.json(defaultIngredient);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { ingredients, totalPages, totalCount } = await utilFetchIngredientList({ query, pagination, sort, limit });
  res.json({ ingredients, totalPages, totalCount });
}

// FETCH UTILS
const utilFetchIngredientList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await Ingredient.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const ingredients = await Ingredient.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding Ingredient list", 404);
    });
  return { ingredients, totalPages, totalCount };
}