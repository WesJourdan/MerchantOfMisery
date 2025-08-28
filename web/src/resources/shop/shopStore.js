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


// First define all standard CRUD API calls for shop

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by shopService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new shop object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateShop = createAsyncThunk(
  'shop/sendCreate'
  , async ({ endpoint, method = 'POST', ...newShop }) => {
    endpoint = endpoint ? `/api/shops/${endpoint}` : `/api/shops`;
    const response = await apiUtils.callAPI(endpoint, method, newShop);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleShop = createAsyncThunk(
  'shop/fetchSingle'
  , async (id) => {
    const endpoint = `/api/shops/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchShopList = createAsyncThunk(
  'shop/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/shops${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleShopAtEndpoint = createAsyncThunk(
  'shop/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/shops${query}` // example: `/api/shops/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchShopListAtEndpoint = createAsyncThunk(
  'shop/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/shops${query}`; // example: `/api/shops/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated shop object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateShop = createAsyncThunk(
  'shop/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/shops/${endpoint}` : `/api/shops/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteShop = createAsyncThunk(
  'shop/sendDelete'
  , async (id) => {
    const endpoint = `/api/shops/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the shopSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const shopSlice = createSlice({
  name: 'shop'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by shopService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addShopToList: handleAddSingleToList
    , addShopsToList: handleAddManyToList
    , removeShopsFromList: handleRemoveManyFromList
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
      .addCase(sendCreateShop.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleShop.pending, handleFetchSinglePending)
      .addCase(fetchSingleShop.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleShop.rejected, handleFetchSingleRejected)
      .addCase(fetchShopList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchShopList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'shops'))
      .addCase(fetchShopList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleShopAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleShopAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'shops'))
      .addCase(fetchSingleShopAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchShopListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchShopListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'shops'))
      .addCase(fetchShopListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateShop.pending, handleMutationPending)
      .addCase(sendUpdateShop.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateShop.rejected, handleMutationRejected)
      // .addCase(sendUpdateShop.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteShop.pending, handleDeletePending)
      .addCase(sendDeleteShop.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteShop.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addShopToList, addShopsToList, removeShopsFromList } = shopSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchShopList
export const fetchListIfNeeded = (queryKey, listFetch = fetchShopList) => (dispatch, getState) => {
  const shopStore = getState().shop;
  return handleFetchListIfNeeded(dispatch, shopStore, listFetch, queryKey, 'shops');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleShop
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleShop) => (dispatch, getState) => {
  const shopStore = getState().shop;
  return handleFetchSingleIfNeeded(dispatch, shopStore, singleFetch, id);
}

export default shopSlice.reducer;
