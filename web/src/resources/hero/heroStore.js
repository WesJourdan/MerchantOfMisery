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


// First define all standard CRUD API calls for hero

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by heroService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new hero object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateHero = createAsyncThunk(
  'hero/sendCreate'
  , async ({ endpoint, method = 'POST', ...newHero }) => {
    endpoint = endpoint ? `/api/heroes/${endpoint}` : `/api/heroes`;
    const response = await apiUtils.callAPI(endpoint, method, newHero);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleHero = createAsyncThunk(
  'hero/fetchSingle'
  , async (id) => {
    const endpoint = `/api/heroes/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchHeroList = createAsyncThunk(
  'hero/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/heroes${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleHeroAtEndpoint = createAsyncThunk(
  'hero/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/heroes${query}` // example: `/api/heroes/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchHeroListAtEndpoint = createAsyncThunk(
  'hero/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/heroes${query}`; // example: `/api/heroes/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated hero object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateHero = createAsyncThunk(
  'hero/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/heroes/${endpoint}` : `/api/heroes/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteHero = createAsyncThunk(
  'hero/sendDelete'
  , async (id) => {
    const endpoint = `/api/heroes/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the heroSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const heroSlice = createSlice({
  name: 'hero'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by heroService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addHeroToList: handleAddSingleToList
    , addHeroesToList: handleAddManyToList
    , removeHeroesFromList: handleRemoveManyFromList
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
      .addCase(sendCreateHero.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleHero.pending, handleFetchSinglePending)
      .addCase(fetchSingleHero.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleHero.rejected, handleFetchSingleRejected)
      .addCase(fetchHeroList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchHeroList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'heroes'))
      .addCase(fetchHeroList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleHeroAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleHeroAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'heroes'))
      .addCase(fetchSingleHeroAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchHeroListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchHeroListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'heroes'))
      .addCase(fetchHeroListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateHero.pending, handleMutationPending)
      .addCase(sendUpdateHero.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateHero.rejected, handleMutationRejected)
      // .addCase(sendUpdateHero.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteHero.pending, handleDeletePending)
      .addCase(sendDeleteHero.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteHero.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addHeroToList, addHeroesToList, removeHeroesFromList } = heroSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchHeroList
export const fetchListIfNeeded = (queryKey, listFetch = fetchHeroList) => (dispatch, getState) => {
  const heroStore = getState().hero;
  return handleFetchListIfNeeded(dispatch, heroStore, listFetch, queryKey, 'heroes');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleHero
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleHero) => (dispatch, getState) => {
  const heroStore = getState().hero;
  return handleFetchSingleIfNeeded(dispatch, heroStore, singleFetch, id);
}

export default heroSlice.reducer;
