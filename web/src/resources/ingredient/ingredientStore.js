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


// First define all standard CRUD API calls for ingredient

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by ingredientService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new ingredient object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateIngredient = createAsyncThunk(
  'ingredient/sendCreate'
  , async ({ endpoint, method = 'POST', ...newIngredient }) => {
    endpoint = endpoint ? `/api/ingredients/${endpoint}` : `/api/ingredients`;
    const response = await apiUtils.callAPI(endpoint, method, newIngredient);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleIngredient = createAsyncThunk(
  'ingredient/fetchSingle'
  , async (id) => {
    const endpoint = `/api/ingredients/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchIngredientList = createAsyncThunk(
  'ingredient/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/ingredients${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleIngredientAtEndpoint = createAsyncThunk(
  'ingredient/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/ingredients${query}` // example: `/api/ingredients/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchIngredientListAtEndpoint = createAsyncThunk(
  'ingredient/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/ingredients${query}`; // example: `/api/ingredients/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated ingredient object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateIngredient = createAsyncThunk(
  'ingredient/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/ingredients/${endpoint}` : `/api/ingredients/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteIngredient = createAsyncThunk(
  'ingredient/sendDelete'
  , async (id) => {
    const endpoint = `/api/ingredients/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the ingredientSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const ingredientSlice = createSlice({
  name: 'ingredient'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by ingredientService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addIngredientToList: handleAddSingleToList
    , addIngredientsToList: handleAddManyToList
    , removeIngredientsFromList: handleRemoveManyFromList
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
      .addCase(sendCreateIngredient.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleIngredient.pending, handleFetchSinglePending)
      .addCase(fetchSingleIngredient.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleIngredient.rejected, handleFetchSingleRejected)
      .addCase(fetchIngredientList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchIngredientList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'ingredients'))
      .addCase(fetchIngredientList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleIngredientAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleIngredientAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'ingredients'))
      .addCase(fetchSingleIngredientAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchIngredientListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchIngredientListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'ingredients'))
      .addCase(fetchIngredientListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateIngredient.pending, handleMutationPending)
      .addCase(sendUpdateIngredient.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateIngredient.rejected, handleMutationRejected)
      // .addCase(sendUpdateIngredient.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteIngredient.pending, handleDeletePending)
      .addCase(sendDeleteIngredient.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteIngredient.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addIngredientToList, addIngredientsToList, removeIngredientsFromList } = ingredientSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchIngredientList
export const fetchListIfNeeded = (queryKey, listFetch = fetchIngredientList) => (dispatch, getState) => {
  const ingredientStore = getState().ingredient;
  return handleFetchListIfNeeded(dispatch, ingredientStore, listFetch, queryKey, 'ingredients');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleIngredient
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleIngredient) => (dispatch, getState) => {
  const ingredientStore = getState().ingredient;
  return handleFetchSingleIfNeeded(dispatch, ingredientStore, singleFetch, id);
}

export default ingredientSlice.reducer;
