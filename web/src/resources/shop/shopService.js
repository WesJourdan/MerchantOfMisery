/**
 * This set of hooks is how we'll interact with the shopStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { createEndpoint, parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchShopList
  , fetchShopListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleShop
  , fetchSingleShopAtEndpoint
  , sendCreateShop
  , sendUpdateShop
  , sendDeleteShop
  , invalidateQuery
  // , invalidateQueries
  , addShopToList
  , addShopsToList
  , removeShopsFromList
  , fetchSingleIfNeeded
} from './shopStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

const advanceDayEndpoint = createEndpoint(':shopId/advance-day')
export const useAdvanceDay = (shopId) => {
  const endpoint = advanceDayEndpoint({ shopId })
  const { sendUpdateShop } = useUpdateShop({ endpoint, method: 'POST' });
  return sendUpdateShop;
}

// CREATE

/**
 * Use this hook to handle the creation of a new shop.
 * @param {Object} initialState - The initial state of the shop (optional)
 * @param {Function} handleResponse - The function to call when the shop is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the shop (optional)
 * @param {string} method - The http method to use when creating the shop (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newShop` as `data`: the new shop object as it currently exists in state, initially the default shop
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default shop
 * const { data: newShop, handleChange, handleSubmit, ...shopQuery } = useCreateShop({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (shop, error) => {
 *     if(error || !shop) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/shops/${shop._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={shopQuery}>
 *     <ShopForm
 *       shop={shop}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateShop = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up shop specific stuff to be used by the shared hook
  const defaultShopQuery = useGetDefaultShop();
  const sendMutation = (mutatedShop) => dispatch(sendCreateShop({ endpoint, method, ...mutatedShop }));

  // the hook will return everything the caller needs to create a new shop
  return useMutateResource({ resourceQuery: defaultShopQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new shop, try `useCreateShop`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultShop (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default shop, but keeps things consistent)
 */
export const useGetDefaultShop = (forceFetch = false) => {
  // leverage existing hooks to get the default shop (using 'default' as the id will return the default shop from the server)
  return useGetShopById('default', forceFetch);
}


/**
 * This hook will check for a fresh shop in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the shop to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the shop (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetShopById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up shop specific stuff to be used by the shared hook
  const shopStore = useSelector(({ shop }) => shop);
  const fetchShop = forceFetch ? fetchSingleShop : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchShop(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now shop specific) hook
  return useGetResourceById({ id, fromStore: shopStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh shop in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the shop (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetShop = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up shop specific stuff to be used by the shared hook
  const shopStore = useSelector(({ shop }) => shop);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchShop = fetchSingleShopAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchShop));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now shop specific) hook
  return useGetResource({ listArgs, fromStore: shopStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the shop list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetShopList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up shop specific stuff to be used by the shared hook
  const shopStore = useSelector(({ shop }) => shop);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchShops = endpoint ? fetchShopListAtEndpoint : fetchShopList;
  const fetchShopsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchShops);
  const sendFetchList = (queryString) => dispatch(fetchShopsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, shopIds) => dispatch(addShopsToList({ queryString, ids: shopIds }))
  const removeFromList = (queryString, shopIds) => dispatch(removeShopsFromList({ queryString, ids: shopIds }))

  // return the (now shop specific) hook
  return useGetResourceList({ listArgs, fromStore: shopStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateShop` action
 * 
 * Useful if you want to update a shop that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableShop` if you want to fetch and update a shop
 * 
 * @returns the sendUpdateShop action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateShop } = useUpdateShop({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateShop(updatedShop);
 */
export const useUpdateShop = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateShop: (updatedShop = {}) => dispatch(sendUpdateShop({ endpoint, method, ...updatedShop}))
  }
}

/**
 * Use this hook to handle the update of an existing shop.
 * @param {string} id - the id of the shop to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated shop and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `shop` as `data`: the shop object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the shop has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the shop and access everything needed to handle updating it
 * const { data: shop, handleChange, handleSubmit, ...shopQuery } = useGetUpdatableShop(shopId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedShop, error) => {
 *     if(error || !updatedShop) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/shops/${shopId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={shopQuery}>
 *     <ShopForm
 *       shop={shop}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableShop = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up shop specific stuff to be used by the shared hook
  // use the existing hook to get the shopQuery
  const shopQuery = useGetShopById(id);
  const sendMutation = (mutatedShop) => dispatch(sendUpdateShop(mutatedShop));
  // return the (now shop specific) hook
  return useMutateResource({ resourceQuery: shopQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteShop` action
 * 
 * @returns the sendDeleteShop action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteShop } = useDeleteShop();
 * // dispatch the delete action
 * sendDeleteShop(shopId);
 */
export const useDeleteShop = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteShop: (id) => dispatch(sendDeleteShop(id))
  }
}

// OTHERS

/**
 * @returns the `addShopToList` action wrapped in dispatch
 */
export const useAddShopToList = () => {
  const dispatch = useDispatch();
  return {
    addShopToList: (shopId, listArgs) => dispatch(addShopToList({ id: shopId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the shop is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the shop that you want to grab from the store
 * @returns the shop from the store's byId map
 */
export const useShopFromMap = (id) => {
  const shop = useSelector(({ shop: shopStore }) => selectSingleById(shopStore, id));
  return shop
}
