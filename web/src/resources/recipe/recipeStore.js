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


// First define all standard CRUD API calls for recipe

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by recipeService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new recipe object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateRecipe = createAsyncThunk(
  'recipe/sendCreate'
  , async ({ endpoint, method = 'POST', ...newRecipe }) => {
    endpoint = endpoint ? `/api/recipes/${endpoint}` : `/api/recipes`;
    const response = await apiUtils.callAPI(endpoint, method, newRecipe);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleRecipe = createAsyncThunk(
  'recipe/fetchSingle'
  , async (id) => {
    const endpoint = `/api/recipes/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchRecipeList = createAsyncThunk(
  'recipe/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/recipes${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleRecipeAtEndpoint = createAsyncThunk(
  'recipe/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/recipes${query}` // example: `/api/recipes/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchRecipeListAtEndpoint = createAsyncThunk(
  'recipe/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/recipes${query}`; // example: `/api/recipes/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated recipe object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateRecipe = createAsyncThunk(
  'recipe/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/recipes/${endpoint}` : `/api/recipes/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteRecipe = createAsyncThunk(
  'recipe/sendDelete'
  , async (id) => {
    const endpoint = `/api/recipes/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the recipeSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const recipeSlice = createSlice({
  name: 'recipe'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by recipeService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addRecipeToList: handleAddSingleToList
    , addRecipesToList: handleAddManyToList
    , removeRecipesFromList: handleRemoveManyFromList
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
      .addCase(sendCreateRecipe.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleRecipe.pending, handleFetchSinglePending)
      .addCase(fetchSingleRecipe.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleRecipe.rejected, handleFetchSingleRejected)
      .addCase(fetchRecipeList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchRecipeList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'recipes'))
      .addCase(fetchRecipeList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleRecipeAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleRecipeAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'recipes'))
      .addCase(fetchSingleRecipeAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchRecipeListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchRecipeListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'recipes'))
      .addCase(fetchRecipeListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateRecipe.pending, handleMutationPending)
      .addCase(sendUpdateRecipe.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateRecipe.rejected, handleMutationRejected)
      // .addCase(sendUpdateRecipe.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteRecipe.pending, handleDeletePending)
      .addCase(sendDeleteRecipe.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteRecipe.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addRecipeToList, addRecipesToList, removeRecipesFromList } = recipeSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchRecipeList
export const fetchListIfNeeded = (queryKey, listFetch = fetchRecipeList) => (dispatch, getState) => {
  const recipeStore = getState().recipe;
  return handleFetchListIfNeeded(dispatch, recipeStore, listFetch, queryKey, 'recipes');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleRecipe
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleRecipe) => (dispatch, getState) => {
  const recipeStore = getState().recipe;
  return handleFetchSingleIfNeeded(dispatch, recipeStore, singleFetch, id);
}

export default recipeSlice.reducer;
