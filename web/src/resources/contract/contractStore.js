import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import apiUtils from '../../global/utils/api';

import {
  handleCreateFulfilled
  , handleFetchSingleIfNeeded
  , handleFetchSinglePending
  , handleFetchSingleFulfilled
  , handleFetchSingleFromListFulfilled
  , handleFetchSingleRejected
  , handleFetchListIfNeeded
  , handleFetchListPending
  , handleFetchListFulfilled
  , handleFetchListRejected
  , handleMutationPending
  , handleMutationFulfilled
  , handleMutationRejected
  , handleDeletePending
  , handleDeleteFulfilled
  , handleDeleteRejected
  , INITIAL_STATE
  , handleInvalidateQuery
  , handleInvalidateQueries
  , handleAddSingleToList
  , handleAddManyToList
  , handleRemoveManyFromList
} from '../../global/utils/storeUtils';


// First define all standard CRUD API calls for contract

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by contractService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new contract object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateContract = createAsyncThunk(
  'contract/sendCreate'
  , async ({ endpoint, method = 'POST', ...newContract }) => {
    endpoint = endpoint ? `/api/contracts/${endpoint}` : `/api/contracts`;
    const response = await apiUtils.callAPI(endpoint, method, newContract);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleContract = createAsyncThunk(
  'contract/fetchSingle'
  , async (id) => {
    const endpoint = `/api/contracts/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchContractList = createAsyncThunk(
  'contract/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/contracts${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleContractAtEndpoint = createAsyncThunk(
  'contract/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/contracts${query}` // example: `/api/contracts/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchContractListAtEndpoint = createAsyncThunk(
  'contract/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/contracts${query}`; // example: `/api/contracts/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated contract object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateContract = createAsyncThunk(
  'contract/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/contracts/${endpoint}` : `/api/contracts/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteContract = createAsyncThunk(
  'contract/sendDelete'
  , async (id) => {
    const endpoint = `/api/contracts/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the contractSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const contractSlice = createSlice({
  name: 'contract'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by contractService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addContractToList: handleAddSingleToList
    , addContractsToList: handleAddManyToList
    , removeContractsFromList: handleRemoveManyFromList
  }

  /**
   * The `extraReducers` field lets the slice handle actions defined elsewhere,
   * including actions generated by createAsyncThunk or in other slices.
   * We'll use them to track our server request status.
   * 
   * We'll add a case for each API call defined at the top of the file to dictate
   * what happens during each API call lifecycle.
   */
  , extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(sendCreateContract.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleContract.pending, handleFetchSinglePending)
      .addCase(fetchSingleContract.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleContract.rejected, handleFetchSingleRejected)
      .addCase(fetchContractList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchContractList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'contracts'))
      .addCase(fetchContractList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleContractAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleContractAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'contracts'))
      .addCase(fetchSingleContractAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchContractListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchContractListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'contracts'))
      .addCase(fetchContractListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateContract.pending, handleMutationPending)
      .addCase(sendUpdateContract.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateContract.rejected, handleMutationRejected)
      // .addCase(sendUpdateContract.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteContract.pending, handleDeletePending)
      .addCase(sendDeleteContract.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteContract.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addContractToList, addContractsToList, removeContractsFromList } = contractSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchContractList
export const fetchListIfNeeded = (queryKey, listFetch = fetchContractList) => (dispatch, getState) => {
  const contractStore = getState().contract;
  return handleFetchListIfNeeded(dispatch, contractStore, listFetch, queryKey, 'contracts');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleContract
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleContract) => (dispatch, getState) => {
  const contractStore = getState().contract;
  return handleFetchSingleIfNeeded(dispatch, contractStore, singleFetch, id);
}

export default contractSlice.reducer;
