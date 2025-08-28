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


// First define all standard CRUD API calls for report

/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by reportService which has a nicer api built on hooks.
 */

// CREATE
/**
 * @param {object} args - the new report object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to POST)
 */
export const sendCreateReport = createAsyncThunk(
  'report/sendCreate'
  , async ({ endpoint, method = 'POST', ...newReport }) => {
    endpoint = endpoint ? `/api/reports/${endpoint}` : `/api/reports`;
    const response = await apiUtils.callAPI(endpoint, method, newReport);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleReport = createAsyncThunk(
  'report/fetchSingle'
  , async (id) => {
    const endpoint = `/api/reports/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchReportList = createAsyncThunk(
  'report/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/reports${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// for each resource we can add as many endpoints as we want in this format and we only need two actions to handle them.
// this will hit the same endpoint as the list version, but the store will handle the returned array and access the single item in it.
export const fetchSingleReportAtEndpoint = createAsyncThunk(
  'report/fetchSingleWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/reports${query}` // example: `/api/reports/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchReportListAtEndpoint = createAsyncThunk(
  'report/fetchListWithFilter' // this is the action name that will show up in the console logger.
  , async (query) => {
    const endpoint = `/api/reports${query}`; // example: `/api/reports/logged-in?${queryString}`
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
/**
 * @param {object} args - the updated report object plus the optional endpoint and method
 * @param {string} args.endpoint - the endpoint to send the update to (optional)
 * @param {string} args.method - the http method to use (optional, defaults to PUT)
 */
export const sendUpdateReport = createAsyncThunk(
  'report/sendUpdate'
  , async ({ endpoint, method = 'PUT', ...updates }) => {
    const { _id } = updates;
    endpoint = endpoint ? `/api/reports/${endpoint}` : `/api/reports/${_id}`;
    const response = await apiUtils.callAPI(endpoint, method, updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteReport = createAsyncThunk(
  'report/sendDelete'
  , async (id) => {
    const endpoint = `/api/reports/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the reportSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const reportSlice = createSlice({
  name: 'report'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by reportService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addReportToList: handleAddSingleToList
    , addReportsToList: handleAddManyToList
    , removeReportsFromList: handleRemoveManyFromList
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
      .addCase(sendCreateReport.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleReport.pending, handleFetchSinglePending)
      .addCase(fetchSingleReport.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleReport.rejected, handleFetchSingleRejected)
      .addCase(fetchReportList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchReportList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'reports'))
      .addCase(fetchReportList.rejected, handleFetchListRejected)

      // permission protected single fetches
      .addCase(fetchSingleReportAtEndpoint.pending, handleFetchSinglePending)
      // these endpoints return named lists, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchSingleReportAtEndpoint.fulfilled, (state, action) => handleFetchSingleFromListFulfilled(state, action, 'reports'))
      .addCase(fetchSingleReportAtEndpoint.rejected, handleFetchSingleRejected)
      // permission protected list fetches
      .addCase(fetchReportListAtEndpoint.pending, handleFetchListPending)
      .addCase(fetchReportListAtEndpoint.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'reports'))
      .addCase(fetchReportListAtEndpoint.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateReport.pending, handleMutationPending)
      .addCase(sendUpdateReport.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateReport.rejected, handleMutationRejected)
      // .addCase(sendUpdateReport.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteReport.pending, handleDeletePending)
      .addCase(sendDeleteReport.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteReport.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addReportToList, addReportsToList, removeReportsFromList } = reportSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// accepts an optional listFetch action so we can use it for other list fetches, defaults to fetchReportList
export const fetchListIfNeeded = (queryKey, listFetch = fetchReportList) => (dispatch, getState) => {
  const reportStore = getState().report;
  return handleFetchListIfNeeded(dispatch, reportStore, listFetch, queryKey, 'reports');
};

// accepts an optional singleFetch action so we can use it for other single fetches, defaults to fetchSingleReport
export const fetchSingleIfNeeded = (id, singleFetch = fetchSingleReport) => (dispatch, getState) => {
  const reportStore = getState().report;
  return handleFetchSingleIfNeeded(dispatch, reportStore, singleFetch, id);
}

export default reportSlice.reducer;
