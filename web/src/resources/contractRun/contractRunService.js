/**
 * This set of hooks is how we'll interact with the contractRunStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchContractRunList
  , fetchContractRunListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleContractRun
  , fetchSingleContractRunAtEndpoint
  , sendCreateContractRun
  , sendUpdateContractRun
  , sendDeleteContractRun
  , invalidateQuery
  // , invalidateQueries
  , addContractRunToList
  , addContractRunsToList
  , removeContractRunsFromList
  , fetchSingleIfNeeded
} from './contractRunStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new contractRun.
 * @param {Object} initialState - The initial state of the contractRun (optional)
 * @param {Function} handleResponse - The function to call when the contractRun is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the contractRun (optional)
 * @param {string} method - The http method to use when creating the contractRun (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newContractRun` as `data`: the new contractRun object as it currently exists in state, initially the default contractRun
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default contractRun
 * const { data: newContractRun, handleChange, handleSubmit, ...contractRunQuery } = useCreateContractRun({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (contractRun, error) => {
 *     if(error || !contractRun) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/contract-runs/${contractRun._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={contractRunQuery}>
 *     <ContractRunForm
 *       contractRun={contractRun}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateContractRun = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up contractRun specific stuff to be used by the shared hook
  const defaultContractRunQuery = useGetDefaultContractRun();
  const sendMutation = (mutatedContractRun) => dispatch(sendCreateContractRun({ endpoint, method, ...mutatedContractRun }));

  // the hook will return everything the caller needs to create a new contractRun
  return useMutateResource({ resourceQuery: defaultContractRunQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new contractRun, try `useCreateContractRun`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultContractRun (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default contractRun, but keeps things consistent)
 */
export const useGetDefaultContractRun = (forceFetch = false) => {
  // leverage existing hooks to get the default contractRun (using 'default' as the id will return the default contractRun from the server)
  return useGetContractRunById('default', forceFetch);
}


/**
 * This hook will check for a fresh contractRun in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the contractRun to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the contractRun (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetContractRunById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up contractRun specific stuff to be used by the shared hook
  const contractRunStore = useSelector(({ contractRun }) => contractRun);
  const fetchContractRun = forceFetch ? fetchSingleContractRun : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchContractRun(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now contractRun specific) hook
  return useGetResourceById({ id, fromStore: contractRunStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh contractRun in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the contractRun (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetContractRun = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up contractRun specific stuff to be used by the shared hook
  const contractRunStore = useSelector(({ contractRun }) => contractRun);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchContractRun = fetchSingleContractRunAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchContractRun));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now contractRun specific) hook
  return useGetResource({ listArgs, fromStore: contractRunStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the contractRun list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetContractRunList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up contractRun specific stuff to be used by the shared hook
  const contractRunStore = useSelector(({ contractRun }) => contractRun);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchContractRuns = endpoint ? fetchContractRunListAtEndpoint : fetchContractRunList;
  const fetchContractRunsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchContractRuns);
  const sendFetchList = (queryString) => dispatch(fetchContractRunsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, contractRunIds) => dispatch(addContractRunsToList({ queryString, ids: contractRunIds }))
  const removeFromList = (queryString, contractRunIds) => dispatch(removeContractRunsFromList({ queryString, ids: contractRunIds }))

  // return the (now contractRun specific) hook
  return useGetResourceList({ listArgs, fromStore: contractRunStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateContractRun` action
 * 
 * Useful if you want to update a contractRun that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableContractRun` if you want to fetch and update a contractRun
 * 
 * @returns the sendUpdateContractRun action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateContractRun } = useUpdateContractRun({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateContractRun(updatedContractRun);
 */
export const useUpdateContractRun = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateContractRun: (updatedContractRun) => dispatch(sendUpdateContractRun({ endpoint, method, ...updatedContractRun}))
  }
}

/**
 * Use this hook to handle the update of an existing contractRun.
 * @param {string} id - the id of the contractRun to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated contractRun and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `contractRun` as `data`: the contractRun object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the contractRun has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the contractRun and access everything needed to handle updating it
 * const { data: contractRun, handleChange, handleSubmit, ...contractRunQuery } = useGetUpdatableContractRun(contractRunId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedContractRun, error) => {
 *     if(error || !updatedContractRun) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/contract-runs/${contractRunId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={contractRunQuery}>
 *     <ContractRunForm
 *       contractRun={contractRun}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableContractRun = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up contractRun specific stuff to be used by the shared hook
  // use the existing hook to get the contractRunQuery
  const contractRunQuery = useGetContractRunById(id);
  const sendMutation = (mutatedContractRun) => dispatch(sendUpdateContractRun(mutatedContractRun));
  // return the (now contractRun specific) hook
  return useMutateResource({ resourceQuery: contractRunQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteContractRun` action
 * 
 * @returns the sendDeleteContractRun action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteContractRun } = useDeleteContractRun();
 * // dispatch the delete action
 * sendDeleteContractRun(contractRunId);
 */
export const useDeleteContractRun = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteContractRun: (id) => dispatch(sendDeleteContractRun(id))
  }
}

// OTHERS

/**
 * @returns the `addContractRunToList` action wrapped in dispatch
 */
export const useAddContractRunToList = () => {
  const dispatch = useDispatch();
  return {
    addContractRunToList: (contractRunId, listArgs) => dispatch(addContractRunToList({ id: contractRunId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the contractRun is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the contractRun that you want to grab from the store
 * @returns the contractRun from the store's byId map
 */
export const useContractRunFromMap = (id) => {
  const contractRun = useSelector(({ contractRun: contractRunStore }) => selectSingleById(contractRunStore, id));
  return contractRun
}
