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


// First define all standard CRUD API calls for item

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by itemService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new item object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateItem = createAsyncThunk(
  'item/sendCreate'
  , async ({ endpoint, method = 'POST', ...newItem }) => {
    endpoint = endpoint ? `/api/items/${endpoint}` : `/api/items`;
    const response = await apiUtils.callAPI(endpoint, method, newItem);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleItem = createAsyncThunk(
  'item/fetchSingle'
  , async (id) => {
    const endpoint = `/api/items/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchItemList = createAsyncThunk(
  'item/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/items${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleItemAtEndpoint = createAsyncThunk(
  'item/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/items${query}` // example: `/api/items/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchItemListAtEndpoint = createAsyncThunk(
  'item/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/items${query}`; // example: `/api/items/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated item object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateItem = createAsyncThunk(
  'item/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/items/${endpoint}` : `/api/items/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteItem = createAsyncThunk(
  'item/sendDelete'
  , async (id) => {
    const endpoint = `/api/items/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the itemSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const itemSlice = createSlice({
  name: 'item'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by itemService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addItemToList: handleAddSingleToList
    , addItemsToList: handleAddManyToList
    , removeItemsFromList: handleRemoveManyFromList
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
      .addCase(sendCreateItem.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleItem.pending, handleFetchSinglePending)
      .addCase(fetchSingleItem.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleItem.rejected, handleFetchSingleRejected)
      .addCase(fetchItemList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchItemList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'items'))
      .addCase(fetchItemList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleItemAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleItemAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'items'))
      .addCase(fetchSingleItemAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchItemListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchItemListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'items'))
      .addCase(fetchItemListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateItem.pending, handleMutationPending)
      .addCase(sendUpdateItem.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateItem.rejected, handleMutationRejected)
      // .addCase(sendUpdateItem.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteItem.pending, handleDeletePending)
      .addCase(sendDeleteItem.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteItem.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addItemToList, addItemsToList, removeItemsFromList } = itemSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchItemList
export const fetchListIfNeeded = (queryKey, listFetch = fetchItemList) => (dispatch, getState) => {
  const itemStore = getState().item;
  return handleFetchListIfNeeded(dispatch, itemStore, listFetch, queryKey, 'items');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleItem
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleItem) => (dispatch, getState) => {
  const itemStore = getState().item;
  return handleFetchSingleIfNeeded(dispatch, itemStore, singleFetch, id);
}

export default itemSlice.reducer;
