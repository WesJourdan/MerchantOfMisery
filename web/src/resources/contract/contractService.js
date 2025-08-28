/**
 * This set of hooks is how we'll interact with the contractStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchContractList
  , fetchContractListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleContract
  , fetchSingleContractAtEndpoint
  , sendCreateContract
  , sendUpdateContract
  , sendDeleteContract
  , invalidateQuery
  // , invalidateQueries
  , addContractToList
  , addContractsToList
  , removeContractsFromList
  , fetchSingleIfNeeded
} from './contractStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new contract.
 * @param {Object} initialState - The initial state of the contract (optional)
 * @param {Function} handleResponse - The function to call when the contract is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the contract (optional)
 * @param {string} method - The http method to use when creating the contract (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newContract` as `data`: the new contract object as it currently exists in state, initially the default contract
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default contract
 * const { data: newContract, handleChange, handleSubmit, ...contractQuery } = useCreateContract({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (contract, error) => {
 *     if(error || !contract) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/contracts/${contract._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={contractQuery}>
 *     <ContractForm
 *       contract={contract}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateContract = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up contract specific stuff to be used by the shared hook
  const defaultContractQuery = useGetDefaultContract();
  const sendMutation = (mutatedContract) => dispatch(sendCreateContract({ endpoint, method, ...mutatedContract }));

  // the hook will return everything the caller needs to create a new contract
  return useMutateResource({ resourceQuery: defaultContractQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new contract, try `useCreateContract`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultContract (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default contract, but keeps things consistent)
 */
export const useGetDefaultContract = (forceFetch = false) => {
  // leverage existing hooks to get the default contract (using 'default' as the id will return the default contract from the server)
  return useGetContractById('default', forceFetch);
}


/**
 * This hook will check for a fresh contract in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the contract to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the contract (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetContractById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up contract specific stuff to be used by the shared hook
  const contractStore = useSelector(({ contract }) => contract);
  const fetchContract = forceFetch ? fetchSingleContract : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchContract(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now contract specific) hook
  return useGetResourceById({ id, fromStore: contractStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh contract in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the contract (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetContract = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up contract specific stuff to be used by the shared hook
  const contractStore = useSelector(({ contract }) => contract);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchContract = fetchSingleContractAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchContract));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now contract specific) hook
  return useGetResource({ listArgs, fromStore: contractStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the contract list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetContractList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up contract specific stuff to be used by the shared hook
  const contractStore = useSelector(({ contract }) => contract);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchContracts = endpoint ? fetchContractListAtEndpoint : fetchContractList;
  const fetchContractsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchContracts);
  const sendFetchList = (queryString) => dispatch(fetchContractsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, contractIds) => dispatch(addContractsToList({ queryString, ids: contractIds }))
  const removeFromList = (queryString, contractIds) => dispatch(removeContractsFromList({ queryString, ids: contractIds }))

  // return the (now contract specific) hook
  return useGetResourceList({ listArgs, fromStore: contractStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateContract` action
 * 
 * Useful if you want to update a contract that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableContract` if you want to fetch and update a contract
 * 
 * @returns the sendUpdateContract action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateContract } = useUpdateContract({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateContract(updatedContract);
 */
export const useUpdateContract = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateContract: (updatedContract) => dispatch(sendUpdateContract({ endpoint, method, ...updatedContract}))
  }
}

/**
 * Use this hook to handle the update of an existing contract.
 * @param {string} id - the id of the contract to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated contract and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `contract` as `data`: the contract object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the contract has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the contract and access everything needed to handle updating it
 * const { data: contract, handleChange, handleSubmit, ...contractQuery } = useGetUpdatableContract(contractId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedContract, error) => {
 *     if(error || !updatedContract) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/contracts/${contractId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={contractQuery}>
 *     <ContractForm
 *       contract={contract}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableContract = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up contract specific stuff to be used by the shared hook
  // use the existing hook to get the contractQuery
  const contractQuery = useGetContractById(id);
  const sendMutation = (mutatedContract) => dispatch(sendUpdateContract(mutatedContract));
  // return the (now contract specific) hook
  return useMutateResource({ resourceQuery: contractQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteContract` action
 * 
 * @returns the sendDeleteContract action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteContract } = useDeleteContract();
 * // dispatch the delete action
 * sendDeleteContract(contractId);
 */
export const useDeleteContract = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteContract: (id) => dispatch(sendDeleteContract(id))
  }
}

// OTHERS

/**
 * @returns the `addContractToList` action wrapped in dispatch
 */
export const useAddContractToList = () => {
  const dispatch = useDispatch();
  return {
    addContractToList: (contractId, listArgs) => dispatch(addContractToList({ id: contractId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the contract is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the contract that you want to grab from the store
 * @returns the contract from the store's byId map
 */
export const useContractFromMap = (id) => {
  const contract = useSelector(({ contract: contractStore }) => selectSingleById(contractStore, id));
  return contract
}
