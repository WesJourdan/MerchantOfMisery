/**
 * This set of hooks is how we'll interact with the enchantmentStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchEnchantmentList
  , fetchEnchantmentListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleEnchantment
  , fetchSingleEnchantmentAtEndpoint
  , sendCreateEnchantment
  , sendUpdateEnchantment
  , sendDeleteEnchantment
  , invalidateQuery
  // , invalidateQueries
  , addEnchantmentToList
  , addEnchantmentsToList
  , removeEnchantmentsFromList
  , fetchSingleIfNeeded
} from './enchantmentStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new enchantment.
 * @param {Object} initialState - The initial state of the enchantment (optional)
 * @param {Function} handleResponse - The function to call when the enchantment is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the enchantment (optional)
 * @param {string} method - The http method to use when creating the enchantment (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newEnchantment` as `data`: the new enchantment object as it currently exists in state, initially the default enchantment
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default enchantment
 * const { data: newEnchantment, handleChange, handleSubmit, ...enchantmentQuery } = useCreateEnchantment({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (enchantment, error) => {
 *     if(error || !enchantment) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/enchantments/${enchantment._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={enchantmentQuery}>
 *     <EnchantmentForm
 *       enchantment={enchantment}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateEnchantment = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up enchantment specific stuff to be used by the shared hook
  const defaultEnchantmentQuery = useGetDefaultEnchantment();
  const sendMutation = (mutatedEnchantment) => dispatch(sendCreateEnchantment({ endpoint, method, ...mutatedEnchantment }));

  // the hook will return everything the caller needs to create a new enchantment
  return useMutateResource({ resourceQuery: defaultEnchantmentQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new enchantment, try `useCreateEnchantment`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultEnchantment (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default enchantment, but keeps things consistent)
 */
export const useGetDefaultEnchantment = (forceFetch = false) => {
  // leverage existing hooks to get the default enchantment (using 'default' as the id will return the default enchantment from the server)
  return useGetEnchantmentById('default', forceFetch);
}


/**
 * This hook will check for a fresh enchantment in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the enchantment to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the enchantment (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetEnchantmentById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up enchantment specific stuff to be used by the shared hook
  const enchantmentStore = useSelector(({ enchantment }) => enchantment);
  const fetchEnchantment = forceFetch ? fetchSingleEnchantment : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchEnchantment(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now enchantment specific) hook
  return useGetResourceById({ id, fromStore: enchantmentStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh enchantment in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the enchantment (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetEnchantment = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up enchantment specific stuff to be used by the shared hook
  const enchantmentStore = useSelector(({ enchantment }) => enchantment);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchEnchantment = fetchSingleEnchantmentAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchEnchantment));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now enchantment specific) hook
  return useGetResource({ listArgs, fromStore: enchantmentStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the enchantment list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetEnchantmentList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up enchantment specific stuff to be used by the shared hook
  const enchantmentStore = useSelector(({ enchantment }) => enchantment);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchEnchantments = endpoint ? fetchEnchantmentListAtEndpoint : fetchEnchantmentList;
  const fetchEnchantmentsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchEnchantments);
  const sendFetchList = (queryString) => dispatch(fetchEnchantmentsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, enchantmentIds) => dispatch(addEnchantmentsToList({ queryString, ids: enchantmentIds }))
  const removeFromList = (queryString, enchantmentIds) => dispatch(removeEnchantmentsFromList({ queryString, ids: enchantmentIds }))

  // return the (now enchantment specific) hook
  return useGetResourceList({ listArgs, fromStore: enchantmentStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateEnchantment` action
 * 
 * Useful if you want to update a enchantment that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableEnchantment` if you want to fetch and update a enchantment
 * 
 * @returns the sendUpdateEnchantment action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateEnchantment } = useUpdateEnchantment({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateEnchantment(updatedEnchantment);
 */
export const useUpdateEnchantment = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateEnchantment: (updatedEnchantment) => dispatch(sendUpdateEnchantment({ endpoint, method, ...updatedEnchantment}))
  }
}

/**
 * Use this hook to handle the update of an existing enchantment.
 * @param {string} id - the id of the enchantment to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated enchantment and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `enchantment` as `data`: the enchantment object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the enchantment has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the enchantment and access everything needed to handle updating it
 * const { data: enchantment, handleChange, handleSubmit, ...enchantmentQuery } = useGetUpdatableEnchantment(enchantmentId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedEnchantment, error) => {
 *     if(error || !updatedEnchantment) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/enchantments/${enchantmentId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={enchantmentQuery}>
 *     <EnchantmentForm
 *       enchantment={enchantment}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableEnchantment = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up enchantment specific stuff to be used by the shared hook
  // use the existing hook to get the enchantmentQuery
  const enchantmentQuery = useGetEnchantmentById(id);
  const sendMutation = (mutatedEnchantment) => dispatch(sendUpdateEnchantment(mutatedEnchantment));
  // return the (now enchantment specific) hook
  return useMutateResource({ resourceQuery: enchantmentQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteEnchantment` action
 * 
 * @returns the sendDeleteEnchantment action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteEnchantment } = useDeleteEnchantment();
 * // dispatch the delete action
 * sendDeleteEnchantment(enchantmentId);
 */
export const useDeleteEnchantment = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteEnchantment: (id) => dispatch(sendDeleteEnchantment(id))
  }
}

// OTHERS

/**
 * @returns the `addEnchantmentToList` action wrapped in dispatch
 */
export const useAddEnchantmentToList = () => {
  const dispatch = useDispatch();
  return {
    addEnchantmentToList: (enchantmentId, listArgs) => dispatch(addEnchantmentToList({ id: enchantmentId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the enchantment is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the enchantment that you want to grab from the store
 * @returns the enchantment from the store's byId map
 */
export const useEnchantmentFromMap = (id) => {
  const enchantment = useSelector(({ enchantment: enchantmentStore }) => selectSingleById(enchantmentStore, id));
  return enchantment
}
