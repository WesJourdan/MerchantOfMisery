/**
 * This set of hooks is how we'll interact with the itemBreakdownStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchItemBreakdownList
  , fetchItemBreakdownListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleItemBreakdown
  , fetchSingleItemBreakdownAtEndpoint
  , sendCreateItemBreakdown
  , sendUpdateItemBreakdown
  , sendDeleteItemBreakdown
  , invalidateQuery
  // , invalidateQueries
  , addItemBreakdownToList
  , addItemBreakdownsToList
  , removeItemBreakdownsFromList
  , fetchSingleIfNeeded
} from './itemBreakdownStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new itemBreakdown.
 * @param {Object} initialState - The initial state of the itemBreakdown (optional)
 * @param {Function} handleResponse - The function to call when the itemBreakdown is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the itemBreakdown (optional)
 * @param {string} method - The http method to use when creating the itemBreakdown (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newItemBreakdown` as `data`: the new itemBreakdown object as it currently exists in state, initially the default itemBreakdown
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default itemBreakdown
 * const { data: newItemBreakdown, handleChange, handleSubmit, ...itemBreakdownQuery } = useCreateItemBreakdown({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (itemBreakdown, error) => {
 *     if(error || !itemBreakdown) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/item-breakdowns/${itemBreakdown._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={itemBreakdownQuery}>
 *     <ItemBreakdownForm
 *       itemBreakdown={itemBreakdown}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateItemBreakdown = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up itemBreakdown specific stuff to be used by the shared hook
  const defaultItemBreakdownQuery = useGetDefaultItemBreakdown();
  const sendMutation = (mutatedItemBreakdown) => dispatch(sendCreateItemBreakdown({ endpoint, method, ...mutatedItemBreakdown }));

  // the hook will return everything the caller needs to create a new itemBreakdown
  return useMutateResource({ resourceQuery: defaultItemBreakdownQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new itemBreakdown, try `useCreateItemBreakdown`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultItemBreakdown (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default itemBreakdown, but keeps things consistent)
 */
export const useGetDefaultItemBreakdown = (forceFetch = false) => {
  // leverage existing hooks to get the default itemBreakdown (using 'default' as the id will return the default itemBreakdown from the server)
  return useGetItemBreakdownById('default', forceFetch);
}


/**
 * This hook will check for a fresh itemBreakdown in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the itemBreakdown to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the itemBreakdown (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetItemBreakdownById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up itemBreakdown specific stuff to be used by the shared hook
  const itemBreakdownStore = useSelector(({ itemBreakdown }) => itemBreakdown);
  const fetchItemBreakdown = forceFetch ? fetchSingleItemBreakdown : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchItemBreakdown(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now itemBreakdown specific) hook
  return useGetResourceById({ id, fromStore: itemBreakdownStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh itemBreakdown in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the itemBreakdown (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetItemBreakdown = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up itemBreakdown specific stuff to be used by the shared hook
  const itemBreakdownStore = useSelector(({ itemBreakdown }) => itemBreakdown);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchItemBreakdown = fetchSingleItemBreakdownAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchItemBreakdown));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now itemBreakdown specific) hook
  return useGetResource({ listArgs, fromStore: itemBreakdownStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the itemBreakdown list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetItemBreakdownList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up itemBreakdown specific stuff to be used by the shared hook
  const itemBreakdownStore = useSelector(({ itemBreakdown }) => itemBreakdown);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchItemBreakdowns = endpoint ? fetchItemBreakdownListAtEndpoint : fetchItemBreakdownList;
  const fetchItemBreakdownsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchItemBreakdowns);
  const sendFetchList = (queryString) => dispatch(fetchItemBreakdownsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, itemBreakdownIds) => dispatch(addItemBreakdownsToList({ queryString, ids: itemBreakdownIds }))
  const removeFromList = (queryString, itemBreakdownIds) => dispatch(removeItemBreakdownsFromList({ queryString, ids: itemBreakdownIds }))

  // return the (now itemBreakdown specific) hook
  return useGetResourceList({ listArgs, fromStore: itemBreakdownStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateItemBreakdown` action
 * 
 * Useful if you want to update a itemBreakdown that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableItemBreakdown` if you want to fetch and update a itemBreakdown
 * 
 * @returns the sendUpdateItemBreakdown action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateItemBreakdown } = useUpdateItemBreakdown({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateItemBreakdown(updatedItemBreakdown);
 */
export const useUpdateItemBreakdown = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateItemBreakdown: (updatedItemBreakdown) => dispatch(sendUpdateItemBreakdown({ endpoint, method, ...updatedItemBreakdown}))
  }
}

/**
 * Use this hook to handle the update of an existing itemBreakdown.
 * @param {string} id - the id of the itemBreakdown to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated itemBreakdown and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `itemBreakdown` as `data`: the itemBreakdown object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the itemBreakdown has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the itemBreakdown and access everything needed to handle updating it
 * const { data: itemBreakdown, handleChange, handleSubmit, ...itemBreakdownQuery } = useGetUpdatableItemBreakdown(itemBreakdownId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedItemBreakdown, error) => {
 *     if(error || !updatedItemBreakdown) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/item-breakdowns/${itemBreakdownId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={itemBreakdownQuery}>
 *     <ItemBreakdownForm
 *       itemBreakdown={itemBreakdown}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableItemBreakdown = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up itemBreakdown specific stuff to be used by the shared hook
  // use the existing hook to get the itemBreakdownQuery
  const itemBreakdownQuery = useGetItemBreakdownById(id);
  const sendMutation = (mutatedItemBreakdown) => dispatch(sendUpdateItemBreakdown(mutatedItemBreakdown));
  // return the (now itemBreakdown specific) hook
  return useMutateResource({ resourceQuery: itemBreakdownQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteItemBreakdown` action
 * 
 * @returns the sendDeleteItemBreakdown action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteItemBreakdown } = useDeleteItemBreakdown();
 * // dispatch the delete action
 * sendDeleteItemBreakdown(itemBreakdownId);
 */
export const useDeleteItemBreakdown = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteItemBreakdown: (id) => dispatch(sendDeleteItemBreakdown(id))
  }
}

// OTHERS

/**
 * @returns the `addItemBreakdownToList` action wrapped in dispatch
 */
export const useAddItemBreakdownToList = () => {
  const dispatch = useDispatch();
  return {
    addItemBreakdownToList: (itemBreakdownId, listArgs) => dispatch(addItemBreakdownToList({ id: itemBreakdownId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the itemBreakdown is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the itemBreakdown that you want to grab from the store
 * @returns the itemBreakdown from the store's byId map
 */
export const useItemBreakdownFromMap = (id) => {
  const itemBreakdown = useSelector(({ itemBreakdown: itemBreakdownStore }) => selectSingleById(itemBreakdownStore, id));
  return itemBreakdown
}
