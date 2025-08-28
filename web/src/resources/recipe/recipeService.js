/**
 * This set of hooks is how we'll interact with the recipeStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchRecipeList
  , fetchRecipeListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleRecipe
  , fetchSingleRecipeAtEndpoint
  , sendCreateRecipe
  , sendUpdateRecipe
  , sendDeleteRecipe
  , invalidateQuery
  // , invalidateQueries
  , addRecipeToList
  , addRecipesToList
  , removeRecipesFromList
  , fetchSingleIfNeeded
} from './recipeStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new recipe.
 * @param {Object} initialState - The initial state of the recipe (optional)
 * @param {Function} handleResponse - The function to call when the recipe is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the recipe (optional)
 * @param {string} method - The http method to use when creating the recipe (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newRecipe` as `data`: the new recipe object as it currently exists in state, initially the default recipe
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default recipe
 * const { data: newRecipe, handleChange, handleSubmit, ...recipeQuery } = useCreateRecipe({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (recipe, error) => {
 *     if(error || !recipe) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/recipes/${recipe._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={recipeQuery}>
 *     <RecipeForm
 *       recipe={recipe}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateRecipe = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up recipe specific stuff to be used by the shared hook
  const defaultRecipeQuery = useGetDefaultRecipe();
  const sendMutation = (mutatedRecipe) => dispatch(sendCreateRecipe({ endpoint, method, ...mutatedRecipe }));

  // the hook will return everything the caller needs to create a new recipe
  return useMutateResource({ resourceQuery: defaultRecipeQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new recipe, try `useCreateRecipe`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultRecipe (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default recipe, but keeps things consistent)
 */
export const useGetDefaultRecipe = (forceFetch = false) => {
  // leverage existing hooks to get the default recipe (using 'default' as the id will return the default recipe from the server)
  return useGetRecipeById('default', forceFetch);
}


/**
 * This hook will check for a fresh recipe in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the recipe to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the recipe (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetRecipeById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up recipe specific stuff to be used by the shared hook
  const recipeStore = useSelector(({ recipe }) => recipe);
  const fetchRecipe = forceFetch ? fetchSingleRecipe : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchRecipe(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now recipe specific) hook
  return useGetResourceById({ id, fromStore: recipeStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh recipe in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the recipe (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetRecipe = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up recipe specific stuff to be used by the shared hook
  const recipeStore = useSelector(({ recipe }) => recipe);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchRecipe = fetchSingleRecipeAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchRecipe));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now recipe specific) hook
  return useGetResource({ listArgs, fromStore: recipeStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the recipe list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetRecipeList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up recipe specific stuff to be used by the shared hook
  const recipeStore = useSelector(({ recipe }) => recipe);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchRecipes = endpoint ? fetchRecipeListAtEndpoint : fetchRecipeList;
  const fetchRecipesIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchRecipes);
  const sendFetchList = (queryString) => dispatch(fetchRecipesIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, recipeIds) => dispatch(addRecipesToList({ queryString, ids: recipeIds }))
  const removeFromList = (queryString, recipeIds) => dispatch(removeRecipesFromList({ queryString, ids: recipeIds }))

  // return the (now recipe specific) hook
  return useGetResourceList({ listArgs, fromStore: recipeStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateRecipe` action
 * 
 * Useful if you want to update a recipe that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableRecipe` if you want to fetch and update a recipe
 * 
 * @returns the sendUpdateRecipe action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateRecipe } = useUpdateRecipe({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateRecipe(updatedRecipe);
 */
export const useUpdateRecipe = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateRecipe: (updatedRecipe) => dispatch(sendUpdateRecipe({ endpoint, method, ...updatedRecipe}))
  }
}

/**
 * Use this hook to handle the update of an existing recipe.
 * @param {string} id - the id of the recipe to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated recipe and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `recipe` as `data`: the recipe object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the recipe has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the recipe and access everything needed to handle updating it
 * const { data: recipe, handleChange, handleSubmit, ...recipeQuery } = useGetUpdatableRecipe(recipeId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedRecipe, error) => {
 *     if(error || !updatedRecipe) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/recipes/${recipeId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={recipeQuery}>
 *     <RecipeForm
 *       recipe={recipe}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableRecipe = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up recipe specific stuff to be used by the shared hook
  // use the existing hook to get the recipeQuery
  const recipeQuery = useGetRecipeById(id);
  const sendMutation = (mutatedRecipe) => dispatch(sendUpdateRecipe(mutatedRecipe));
  // return the (now recipe specific) hook
  return useMutateResource({ resourceQuery: recipeQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteRecipe` action
 * 
 * @returns the sendDeleteRecipe action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteRecipe } = useDeleteRecipe();
 * // dispatch the delete action
 * sendDeleteRecipe(recipeId);
 */
export const useDeleteRecipe = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteRecipe: (id) => dispatch(sendDeleteRecipe(id))
  }
}

// OTHERS

/**
 * @returns the `addRecipeToList` action wrapped in dispatch
 */
export const useAddRecipeToList = () => {
  const dispatch = useDispatch();
  return {
    addRecipeToList: (recipeId, listArgs) => dispatch(addRecipeToList({ id: recipeId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the recipe is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the recipe that you want to grab from the store
 * @returns the recipe from the store's byId map
 */
export const useRecipeFromMap = (id) => {
  const recipe = useSelector(({ recipe: recipeStore }) => selectSingleById(recipeStore, id));
  return recipe
}
