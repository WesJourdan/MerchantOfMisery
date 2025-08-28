/**
 * This set of hooks is how we'll interact with the ingredientStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchIngredientList
  , fetchIngredientListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleIngredient
  , fetchSingleIngredientAtEndpoint
  , sendCreateIngredient
  , sendUpdateIngredient
  , sendDeleteIngredient
  , invalidateQuery
  // , invalidateQueries
  , addIngredientToList
  , addIngredientsToList
  , removeIngredientsFromList
  , fetchSingleIfNeeded
} from './ingredientStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new ingredient.
 * @param {Object} initialState - The initial state of the ingredient (optional)
 * @param {Function} handleResponse - The function to call when the ingredient is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the ingredient (optional)
 * @param {string} method - The http method to use when creating the ingredient (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newIngredient` as `data`: the new ingredient object as it currently exists in state, initially the default ingredient
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default ingredient
 * const { data: newIngredient, handleChange, handleSubmit, ...ingredientQuery } = useCreateIngredient({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (ingredient, error) => {
 *     if(error || !ingredient) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/ingredients/${ingredient._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={ingredientQuery}>
 *     <IngredientForm
 *       ingredient={ingredient}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateIngredient = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up ingredient specific stuff to be used by the shared hook
  const defaultIngredientQuery = useGetDefaultIngredient();
  const sendMutation = (mutatedIngredient) => dispatch(sendCreateIngredient({ endpoint, method, ...mutatedIngredient }));

  // the hook will return everything the caller needs to create a new ingredient
  return useMutateResource({ resourceQuery: defaultIngredientQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new ingredient, try `useCreateIngredient`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultIngredient (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default ingredient, but keeps things consistent)
 */
export const useGetDefaultIngredient = (forceFetch = false) => {
  // leverage existing hooks to get the default ingredient (using 'default' as the id will return the default ingredient from the server)
  return useGetIngredientById('default', forceFetch);
}


/**
 * This hook will check for a fresh ingredient in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the ingredient to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the ingredient (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetIngredientById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up ingredient specific stuff to be used by the shared hook
  const ingredientStore = useSelector(({ ingredient }) => ingredient);
  const fetchIngredient = forceFetch ? fetchSingleIngredient : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchIngredient(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now ingredient specific) hook
  return useGetResourceById({ id, fromStore: ingredientStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh ingredient in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the ingredient (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetIngredient = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up ingredient specific stuff to be used by the shared hook
  const ingredientStore = useSelector(({ ingredient }) => ingredient);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchIngredient = fetchSingleIngredientAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchIngredient));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now ingredient specific) hook
  return useGetResource({ listArgs, fromStore: ingredientStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the ingredient list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetIngredientList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up ingredient specific stuff to be used by the shared hook
  const ingredientStore = useSelector(({ ingredient }) => ingredient);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchIngredients = endpoint ? fetchIngredientListAtEndpoint : fetchIngredientList;
  const fetchIngredientsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchIngredients);
  const sendFetchList = (queryString) => dispatch(fetchIngredientsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, ingredientIds) => dispatch(addIngredientsToList({ queryString, ids: ingredientIds }))
  const removeFromList = (queryString, ingredientIds) => dispatch(removeIngredientsFromList({ queryString, ids: ingredientIds }))

  // return the (now ingredient specific) hook
  return useGetResourceList({ listArgs, fromStore: ingredientStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateIngredient` action
 * 
 * Useful if you want to update a ingredient that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableIngredient` if you want to fetch and update a ingredient
 * 
 * @returns the sendUpdateIngredient action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateIngredient } = useUpdateIngredient({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateIngredient(updatedIngredient);
 */
export const useUpdateIngredient = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateIngredient: (updatedIngredient) => dispatch(sendUpdateIngredient({ endpoint, method, ...updatedIngredient}))
  }
}

/**
 * Use this hook to handle the update of an existing ingredient.
 * @param {string} id - the id of the ingredient to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated ingredient and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `ingredient` as `data`: the ingredient object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the ingredient has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the ingredient and access everything needed to handle updating it
 * const { data: ingredient, handleChange, handleSubmit, ...ingredientQuery } = useGetUpdatableIngredient(ingredientId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedIngredient, error) => {
 *     if(error || !updatedIngredient) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/ingredients/${ingredientId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={ingredientQuery}>
 *     <IngredientForm
 *       ingredient={ingredient}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableIngredient = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up ingredient specific stuff to be used by the shared hook
  // use the existing hook to get the ingredientQuery
  const ingredientQuery = useGetIngredientById(id);
  const sendMutation = (mutatedIngredient) => dispatch(sendUpdateIngredient(mutatedIngredient));
  // return the (now ingredient specific) hook
  return useMutateResource({ resourceQuery: ingredientQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteIngredient` action
 * 
 * @returns the sendDeleteIngredient action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteIngredient } = useDeleteIngredient();
 * // dispatch the delete action
 * sendDeleteIngredient(ingredientId);
 */
export const useDeleteIngredient = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteIngredient: (id) => dispatch(sendDeleteIngredient(id))
  }
}

// OTHERS

/**
 * @returns the `addIngredientToList` action wrapped in dispatch
 */
export const useAddIngredientToList = () => {
  const dispatch = useDispatch();
  return {
    addIngredientToList: (ingredientId, listArgs) => dispatch(addIngredientToList({ id: ingredientId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the ingredient is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the ingredient that you want to grab from the store
 * @returns the ingredient from the store's byId map
 */
export const useIngredientFromMap = (id) => {
  const ingredient = useSelector(({ ingredient: ingredientStore }) => selectSingleById(ingredientStore, id));
  return ingredient
}
