/**
 * This set of hooks is how we'll interact with the itemStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchItemList
  , fetchItemListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleItem
  , fetchSingleItemAtEndpoint
  , sendCreateItem
  , sendUpdateItem
  , sendDeleteItem
  , invalidateQuery
  // , invalidateQueries
  , addItemToList
  , addItemsToList
  , removeItemsFromList
  , fetchSingleIfNeeded
} from './itemStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';

export const useGetShopInventory = (shopId) => {
  return useGetItemList({ _shop: shopId });
};


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new item.
 * @param {Object} initialState - The initial state of the item (optional)
 * @param {Function} handleResponse - The function to call when the item is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the item (optional)
 * @param {string} method - The http method to use when creating the item (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newItem` as `data`: the new item object as it currently exists in state, initially the default item
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default item
 * const { data: newItem, handleChange, handleSubmit, ...itemQuery } = useCreateItem({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (item, error) => {
 *     if(error || !item) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/items/${item._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={itemQuery}>
 *     <ItemForm
 *       item={item}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateItem = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up item specific stuff to be used by the shared hook
  const defaultItemQuery = useGetDefaultItem();
  const sendMutation = (mutatedItem) => dispatch(sendCreateItem({ endpoint, method, ...mutatedItem }));

  // the hook will return everything the caller needs to create a new item
  return useMutateResource({ resourceQuery: defaultItemQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new item, try `useCreateItem`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultItem (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default item, but keeps things consistent)
 */
export const useGetDefaultItem = (forceFetch = false) => {
  // leverage existing hooks to get the default item (using 'default' as the id will return the default item from the server)
  return useGetItemById('default', forceFetch);
}


/**
 * This hook will check for a fresh item in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the item to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the item (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetItemById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up item specific stuff to be used by the shared hook
  const itemStore = useSelector(({ item }) => item);
  const fetchItem = forceFetch ? fetchSingleItem : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchItem(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now item specific) hook
  return useGetResourceById({ id, fromStore: itemStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh item in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the item (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetItem = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up item specific stuff to be used by the shared hook
  const itemStore = useSelector(({ item }) => item);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchItem = fetchSingleItemAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchItem));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now item specific) hook
  return useGetResource({ listArgs, fromStore: itemStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the item list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetItemList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up item specific stuff to be used by the shared hook
  const itemStore = useSelector(({ item }) => item);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchItems = endpoint ? fetchItemListAtEndpoint : fetchItemList;
  const fetchItemsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchItems);
  const sendFetchList = (queryString) => dispatch(fetchItemsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, itemIds) => dispatch(addItemsToList({ queryString, ids: itemIds }))
  const removeFromList = (queryString, itemIds) => dispatch(removeItemsFromList({ queryString, ids: itemIds }))

  // return the (now item specific) hook
  return useGetResourceList({ listArgs, fromStore: itemStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateItem` action
 * 
 * Useful if you want to update a item that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableItem` if you want to fetch and update a item
 * 
 * @returns the sendUpdateItem action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateItem } = useUpdateItem({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateItem(updatedItem);
 */
export const useUpdateItem = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateItem: (updatedItem) => dispatch(sendUpdateItem({ endpoint, method, ...updatedItem}))
  }
}

/**
 * Use this hook to handle the update of an existing item.
 * @param {string} id - the id of the item to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated item and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `item` as `data`: the item object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the item has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the item and access everything needed to handle updating it
 * const { data: item, handleChange, handleSubmit, ...itemQuery } = useGetUpdatableItem(itemId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedItem, error) => {
 *     if(error || !updatedItem) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/items/${itemId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={itemQuery}>
 *     <ItemForm
 *       item={item}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableItem = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up item specific stuff to be used by the shared hook
  // use the existing hook to get the itemQuery
  const itemQuery = useGetItemById(id);
  const sendMutation = (mutatedItem) => dispatch(sendUpdateItem(mutatedItem));
  // return the (now item specific) hook
  return useMutateResource({ resourceQuery: itemQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteItem` action
 * 
 * @returns the sendDeleteItem action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteItem } = useDeleteItem();
 * // dispatch the delete action
 * sendDeleteItem(itemId);
 */
export const useDeleteItem = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteItem: (id) => dispatch(sendDeleteItem(id))
  }
}

// OTHERS

/**
 * @returns the `addItemToList` action wrapped in dispatch
 */
export const useAddItemToList = () => {
  const dispatch = useDispatch();
  return {
    addItemToList: (itemId, listArgs) => dispatch(addItemToList({ id: itemId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the item is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the item that you want to grab from the store
 * @returns the item from the store's byId map
 */
export const useItemFromMap = (id) => {
  const item = useSelector(({ item: itemStore }) => selectSingleById(itemStore, id));
  return item
}
