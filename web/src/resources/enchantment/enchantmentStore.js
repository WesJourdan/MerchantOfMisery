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


// First define all standard CRUD API calls for enchantment

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by enchantmentService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new enchantment object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateEnchantment = createAsyncThunk(
  'enchantment/sendCreate'
  , async ({ endpoint, method = 'POST', ...newEnchantment }) => {
    endpoint = endpoint ? `/api/enchantments/${endpoint}` : `/api/enchantments`;
    const response = await apiUtils.callAPI(endpoint, method, newEnchantment);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleEnchantment = createAsyncThunk(
  'enchantment/fetchSingle'
  , async (id) => {
    const endpoint = `/api/enchantments/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchEnchantmentList = createAsyncThunk(
  'enchantment/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/enchantments${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleEnchantmentAtEndpoint = createAsyncThunk(
  'enchantment/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/enchantments${query}` // example: `/api/enchantments/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchEnchantmentListAtEndpoint = createAsyncThunk(
  'enchantment/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/enchantments${query}`; // example: `/api/enchantments/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated enchantment object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateEnchantment = createAsyncThunk(
  'enchantment/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/enchantments/${endpoint}` : `/api/enchantments/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteEnchantment = createAsyncThunk(
  'enchantment/sendDelete'
  , async (id) => {
    const endpoint = `/api/enchantments/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the enchantmentSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const enchantmentSlice = createSlice({
  name: 'enchantment'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by enchantmentService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addEnchantmentToList: handleAddSingleToList
    , addEnchantmentsToList: handleAddManyToList
    , removeEnchantmentsFromList: handleRemoveManyFromList
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
      .addCase(sendCreateEnchantment.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleEnchantment.pending, handleFetchSinglePending)
      .addCase(fetchSingleEnchantment.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleEnchantment.rejected, handleFetchSingleRejected)
      .addCase(fetchEnchantmentList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchEnchantmentList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'enchantments'))
      .addCase(fetchEnchantmentList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleEnchantmentAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleEnchantmentAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'enchantments'))
      .addCase(fetchSingleEnchantmentAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchEnchantmentListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchEnchantmentListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'enchantments'))
      .addCase(fetchEnchantmentListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateEnchantment.pending, handleMutationPending)
      .addCase(sendUpdateEnchantment.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateEnchantment.rejected, handleMutationRejected)
      // .addCase(sendUpdateEnchantment.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteEnchantment.pending, handleDeletePending)
      .addCase(sendDeleteEnchantment.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteEnchantment.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addEnchantmentToList, addEnchantmentsToList, removeEnchantmentsFromList } = enchantmentSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchEnchantmentList
export const fetchListIfNeeded = (queryKey, listFetch = fetchEnchantmentList) => (dispatch, getState) => {
  const enchantmentStore = getState().enchantment;
  return handleFetchListIfNeeded(dispatch, enchantmentStore, listFetch, queryKey, 'enchantments');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleEnchantment
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleEnchantment) => (dispatch, getState) => {
  const enchantmentStore = getState().enchantment;
  return handleFetchSingleIfNeeded(dispatch, enchantmentStore, singleFetch, id);
}

export default enchantmentSlice.reducer;
