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


// First define all standard CRUD API calls for contractRun

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by contractRunService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new contractRun object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateContractRun = createAsyncThunk(
  'contractRun/sendCreate'
  , async ({ endpoint, method = 'POST', ...newContractRun }) => {
    endpoint = endpoint ? `/api/contract-runs/${endpoint}` : `/api/contract-runs`;
    const response = await apiUtils.callAPI(endpoint, method, newContractRun);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleContractRun = createAsyncThunk(
  'contractRun/fetchSingle'
  , async (id) => {
    const endpoint = `/api/contract-runs/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchContractRunList = createAsyncThunk(
  'contractRun/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/contract-runs${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleContractRunAtEndpoint = createAsyncThunk(
  'contractRun/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/contract-runs${query}` // example: `/api/contract-runs/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchContractRunListAtEndpoint = createAsyncThunk(
  'contractRun/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/contract-runs${query}`; // example: `/api/contract-runs/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated contractRun object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateContractRun = createAsyncThunk(
  'contractRun/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/contract-runs/${endpoint}` : `/api/contract-runs/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteContractRun = createAsyncThunk(
  'contractRun/sendDelete'
  , async (id) => {
    const endpoint = `/api/contract-runs/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the contractRunSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const contractRunSlice = createSlice({
  name: 'contractRun'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by contractRunService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addContractRunToList: handleAddSingleToList
    , addContractRunsToList: handleAddManyToList
    , removeContractRunsFromList: handleRemoveManyFromList
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
      .addCase(sendCreateContractRun.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleContractRun.pending, handleFetchSinglePending)
      .addCase(fetchSingleContractRun.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleContractRun.rejected, handleFetchSingleRejected)
      .addCase(fetchContractRunList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchContractRunList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'contractRuns'))
      .addCase(fetchContractRunList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleContractRunAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleContractRunAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'contractRuns'))
      .addCase(fetchSingleContractRunAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchContractRunListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchContractRunListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'contractRuns'))
      .addCase(fetchContractRunListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateContractRun.pending, handleMutationPending)
      .addCase(sendUpdateContractRun.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateContractRun.rejected, handleMutationRejected)
      // .addCase(sendUpdateContractRun.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteContractRun.pending, handleDeletePending)
      .addCase(sendDeleteContractRun.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteContractRun.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addContractRunToList, addContractRunsToList, removeContractRunsFromList } = contractRunSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchContractRunList
export const fetchListIfNeeded = (queryKey, listFetch = fetchContractRunList) => (dispatch, getState) => {
  const contractRunStore = getState().contractRun;
  return handleFetchListIfNeeded(dispatch, contractRunStore, listFetch, queryKey, 'contractRuns');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleContractRun
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleContractRun) => (dispatch, getState) => {
  const contractRunStore = getState().contractRun;
  return handleFetchSingleIfNeeded(dispatch, contractRunStore, singleFetch, id);
}

export default contractRunSlice.reducer;
