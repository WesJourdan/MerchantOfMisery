/**
 * This set of hooks is how we'll interact with the craftingSessionStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchCraftingSessionList
  , fetchCraftingSessionListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleCraftingSession
  , fetchSingleCraftingSessionAtEndpoint
  , sendCreateCraftingSession
  , sendUpdateCraftingSession
  , sendDeleteCraftingSession
  , invalidateQuery
  // , invalidateQueries
  , addCraftingSessionToList
  , addCraftingSessionsToList
  , removeCraftingSessionsFromList
  , fetchSingleIfNeeded
} from './craftingSessionStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new craftingSession.
 * @param {Object} initialState - The initial state of the craftingSession (optional)
 * @param {Function} handleResponse - The function to call when the craftingSession is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the craftingSession (optional)
 * @param {string} method - The http method to use when creating the craftingSession (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newCraftingSession` as `data`: the new craftingSession object as it currently exists in state, initially the default craftingSession
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default craftingSession
 * const { data: newCraftingSession, handleChange, handleSubmit, ...craftingSessionQuery } = useCreateCraftingSession({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (craftingSession, error) => {
 *     if(error || !craftingSession) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/crafting-sessions/${craftingSession._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={craftingSessionQuery}>
 *     <CraftingSessionForm
 *       craftingSession={craftingSession}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateCraftingSession = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up craftingSession specific stuff to be used by the shared hook
  const defaultCraftingSessionQuery = useGetDefaultCraftingSession();
  const sendMutation = (mutatedCraftingSession) => dispatch(sendCreateCraftingSession({ endpoint, method, ...mutatedCraftingSession }));

  // the hook will return everything the caller needs to create a new craftingSession
  return useMutateResource({ resourceQuery: defaultCraftingSessionQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new craftingSession, try `useCreateCraftingSession`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultCraftingSession (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default craftingSession, but keeps things consistent)
 */
export const useGetDefaultCraftingSession = (forceFetch = false) => {
  // leverage existing hooks to get the default craftingSession (using 'default' as the id will return the default craftingSession from the server)
  return useGetCraftingSessionById('default', forceFetch);
}


/**
 * This hook will check for a fresh craftingSession in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the craftingSession to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the craftingSession (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetCraftingSessionById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up craftingSession specific stuff to be used by the shared hook
  const craftingSessionStore = useSelector(({ craftingSession }) => craftingSession);
  const fetchCraftingSession = forceFetch ? fetchSingleCraftingSession : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchCraftingSession(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now craftingSession specific) hook
  return useGetResourceById({ id, fromStore: craftingSessionStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh craftingSession in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the craftingSession (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetCraftingSession = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up craftingSession specific stuff to be used by the shared hook
  const craftingSessionStore = useSelector(({ craftingSession }) => craftingSession);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchCraftingSession = fetchSingleCraftingSessionAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchCraftingSession));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now craftingSession specific) hook
  return useGetResource({ listArgs, fromStore: craftingSessionStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the craftingSession list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetCraftingSessionList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up craftingSession specific stuff to be used by the shared hook
  const craftingSessionStore = useSelector(({ craftingSession }) => craftingSession);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchCraftingSessions = endpoint ? fetchCraftingSessionListAtEndpoint : fetchCraftingSessionList;
  const fetchCraftingSessionsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchCraftingSessions);
  const sendFetchList = (queryString) => dispatch(fetchCraftingSessionsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, craftingSessionIds) => dispatch(addCraftingSessionsToList({ queryString, ids: craftingSessionIds }))
  const removeFromList = (queryString, craftingSessionIds) => dispatch(removeCraftingSessionsFromList({ queryString, ids: craftingSessionIds }))

  // return the (now craftingSession specific) hook
  return useGetResourceList({ listArgs, fromStore: craftingSessionStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateCraftingSession` action
 * 
 * Useful if you want to update a craftingSession that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableCraftingSession` if you want to fetch and update a craftingSession
 * 
 * @returns the sendUpdateCraftingSession action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateCraftingSession } = useUpdateCraftingSession({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateCraftingSession(updatedCraftingSession);
 */
export const useUpdateCraftingSession = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateCraftingSession: (updatedCraftingSession) => dispatch(sendUpdateCraftingSession({ endpoint, method, ...updatedCraftingSession}))
  }
}

/**
 * Use this hook to handle the update of an existing craftingSession.
 * @param {string} id - the id of the craftingSession to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated craftingSession and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `craftingSession` as `data`: the craftingSession object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the craftingSession has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the craftingSession and access everything needed to handle updating it
 * const { data: craftingSession, handleChange, handleSubmit, ...craftingSessionQuery } = useGetUpdatableCraftingSession(craftingSessionId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedCraftingSession, error) => {
 *     if(error || !updatedCraftingSession) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/crafting-sessions/${craftingSessionId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={craftingSessionQuery}>
 *     <CraftingSessionForm
 *       craftingSession={craftingSession}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableCraftingSession = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up craftingSession specific stuff to be used by the shared hook
  // use the existing hook to get the craftingSessionQuery
  const craftingSessionQuery = useGetCraftingSessionById(id);
  const sendMutation = (mutatedCraftingSession) => dispatch(sendUpdateCraftingSession(mutatedCraftingSession));
  // return the (now craftingSession specific) hook
  return useMutateResource({ resourceQuery: craftingSessionQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteCraftingSession` action
 * 
 * @returns the sendDeleteCraftingSession action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteCraftingSession } = useDeleteCraftingSession();
 * // dispatch the delete action
 * sendDeleteCraftingSession(craftingSessionId);
 */
export const useDeleteCraftingSession = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteCraftingSession: (id) => dispatch(sendDeleteCraftingSession(id))
  }
}

// OTHERS

/**
 * @returns the `addCraftingSessionToList` action wrapped in dispatch
 */
export const useAddCraftingSessionToList = () => {
  const dispatch = useDispatch();
  return {
    addCraftingSessionToList: (craftingSessionId, listArgs) => dispatch(addCraftingSessionToList({ id: craftingSessionId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the craftingSession is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the craftingSession that you want to grab from the store
 * @returns the craftingSession from the store's byId map
 */
export const useCraftingSessionFromMap = (id) => {
  const craftingSession = useSelector(({ craftingSession: craftingSessionStore }) => selectSingleById(craftingSessionStore, id));
  return craftingSession
}
