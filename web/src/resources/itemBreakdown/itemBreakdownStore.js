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


// First define all standard CRUD API calls for itemBreakdown

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by itemBreakdownService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new itemBreakdown object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateItemBreakdown = createAsyncThunk(
  'itemBreakdown/sendCreate'
  , async ({ endpoint, method = 'POST', ...newItemBreakdown }) => {
    endpoint = endpoint ? `/api/item-breakdowns/${endpoint}` : `/api/item-breakdowns`;
    const response = await apiUtils.callAPI(endpoint, method, newItemBreakdown);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleItemBreakdown = createAsyncThunk(
  'itemBreakdown/fetchSingle'
  , async (id) => {
    const endpoint = `/api/item-breakdowns/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchItemBreakdownList = createAsyncThunk(
  'itemBreakdown/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/item-breakdowns${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleItemBreakdownAtEndpoint = createAsyncThunk(
  'itemBreakdown/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/item-breakdowns${query}` // example: `/api/item-breakdowns/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchItemBreakdownListAtEndpoint = createAsyncThunk(
  'itemBreakdown/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/item-breakdowns${query}`; // example: `/api/item-breakdowns/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated itemBreakdown object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateItemBreakdown = createAsyncThunk(
  'itemBreakdown/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/item-breakdowns/${endpoint}` : `/api/item-breakdowns/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteItemBreakdown = createAsyncThunk(
  'itemBreakdown/sendDelete'
  , async (id) => {
    const endpoint = `/api/item-breakdowns/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the itemBreakdownSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const itemBreakdownSlice = createSlice({
  name: 'itemBreakdown'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by itemBreakdownService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addItemBreakdownToList: handleAddSingleToList
    , addItemBreakdownsToList: handleAddManyToList
    , removeItemBreakdownsFromList: handleRemoveManyFromList
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
      .addCase(sendCreateItemBreakdown.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleItemBreakdown.pending, handleFetchSinglePending)
      .addCase(fetchSingleItemBreakdown.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleItemBreakdown.rejected, handleFetchSingleRejected)
      .addCase(fetchItemBreakdownList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchItemBreakdownList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'itemBreakdowns'))
      .addCase(fetchItemBreakdownList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleItemBreakdownAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleItemBreakdownAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'itemBreakdowns'))
      .addCase(fetchSingleItemBreakdownAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchItemBreakdownListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchItemBreakdownListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'itemBreakdowns'))
      .addCase(fetchItemBreakdownListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateItemBreakdown.pending, handleMutationPending)
      .addCase(sendUpdateItemBreakdown.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateItemBreakdown.rejected, handleMutationRejected)
      // .addCase(sendUpdateItemBreakdown.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteItemBreakdown.pending, handleDeletePending)
      .addCase(sendDeleteItemBreakdown.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteItemBreakdown.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addItemBreakdownToList, addItemBreakdownsToList, removeItemBreakdownsFromList } = itemBreakdownSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchItemBreakdownList
export const fetchListIfNeeded = (queryKey, listFetch = fetchItemBreakdownList) => (dispatch, getState) => {
  const itemBreakdownStore = getState().itemBreakdown;
  return handleFetchListIfNeeded(dispatch, itemBreakdownStore, listFetch, queryKey, 'itemBreakdowns');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleItemBreakdown
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleItemBreakdown) => (dispatch, getState) => {
  const itemBreakdownStore = getState().itemBreakdown;
  return handleFetchSingleIfNeeded(dispatch, itemBreakdownStore, singleFetch, id);
}

export default itemBreakdownSlice.reducer;
