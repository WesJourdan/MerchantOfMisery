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


// First define all standard CRUD API calls for craftingSession

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by craftingSessionService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new craftingSession object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateCraftingSession = createAsyncThunk(
  'craftingSession/sendCreate'
  , async ({ endpoint, method = 'POST', ...newCraftingSession }) => {
    endpoint = endpoint ? `/api/crafting-sessions/${endpoint}` : `/api/crafting-sessions`;
    const response = await apiUtils.callAPI(endpoint, method, newCraftingSession);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleCraftingSession = createAsyncThunk(
  'craftingSession/fetchSingle'
  , async (id) => {
    const endpoint = `/api/crafting-sessions/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchCraftingSessionList = createAsyncThunk(
  'craftingSession/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/crafting-sessions${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleCraftingSessionAtEndpoint = createAsyncThunk(
  'craftingSession/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/crafting-sessions${query}` // example: `/api/crafting-sessions/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchCraftingSessionListAtEndpoint = createAsyncThunk(
  'craftingSession/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/crafting-sessions${query}`; // example: `/api/crafting-sessions/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated craftingSession object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateCraftingSession = createAsyncThunk(
  'craftingSession/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/crafting-sessions/${endpoint}` : `/api/crafting-sessions/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteCraftingSession = createAsyncThunk(
  'craftingSession/sendDelete'
  , async (id) => {
    const endpoint = `/api/crafting-sessions/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the craftingSessionSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const craftingSessionSlice = createSlice({
  name: 'craftingSession'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by craftingSessionService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addCraftingSessionToList: handleAddSingleToList
    , addCraftingSessionsToList: handleAddManyToList
    , removeCraftingSessionsFromList: handleRemoveManyFromList
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
      .addCase(sendCreateCraftingSession.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleCraftingSession.pending, handleFetchSinglePending)
      .addCase(fetchSingleCraftingSession.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleCraftingSession.rejected, handleFetchSingleRejected)
      .addCase(fetchCraftingSessionList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchCraftingSessionList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'craftingSessions'))
      .addCase(fetchCraftingSessionList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleCraftingSessionAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleCraftingSessionAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'craftingSessions'))
      .addCase(fetchSingleCraftingSessionAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchCraftingSessionListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchCraftingSessionListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'craftingSessions'))
      .addCase(fetchCraftingSessionListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateCraftingSession.pending, handleMutationPending)
      .addCase(sendUpdateCraftingSession.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateCraftingSession.rejected, handleMutationRejected)
      // .addCase(sendUpdateCraftingSession.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteCraftingSession.pending, handleDeletePending)
      .addCase(sendDeleteCraftingSession.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteCraftingSession.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addCraftingSessionToList, addCraftingSessionsToList, removeCraftingSessionsFromList } = craftingSessionSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchCraftingSessionList
export const fetchListIfNeeded = (queryKey, listFetch = fetchCraftingSessionList) => (dispatch, getState) => {
  const craftingSessionStore = getState().craftingSession;
  return handleFetchListIfNeeded(dispatch, craftingSessionStore, listFetch, queryKey, 'craftingSessions');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleCraftingSession
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleCraftingSession) => (dispatch, getState) => {
  const craftingSessionStore = getState().craftingSession;
  return handleFetchSingleIfNeeded(dispatch, craftingSessionStore, singleFetch, id);
}

export default craftingSessionSlice.reducer;
