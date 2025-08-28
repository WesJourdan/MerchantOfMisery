/**
 * This set of hooks is how we'll interact with the reportStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchReportList
  , fetchReportListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleReport
  , fetchSingleReportAtEndpoint
  , sendCreateReport
  , sendUpdateReport
  , sendDeleteReport
  , invalidateQuery
  // , invalidateQueries
  , addReportToList
  , addReportsToList
  , removeReportsFromList
  , fetchSingleIfNeeded
} from './reportStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new report.
 * @param {Object} initialState - The initial state of the report (optional)
 * @param {Function} handleResponse - The function to call when the report is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the report (optional)
 * @param {string} method - The http method to use when creating the report (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newReport` as `data`: the new report object as it currently exists in state, initially the default report
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default report
 * const { data: newReport, handleChange, handleSubmit, ...reportQuery } = useCreateReport({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (report, error) => {
 *     if(error || !report) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/reports/${report._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={reportQuery}>
 *     <ReportForm
 *       report={report}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateReport = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up report specific stuff to be used by the shared hook
  const defaultReportQuery = useGetDefaultReport();
  const sendMutation = (mutatedReport) => dispatch(sendCreateReport({ endpoint, method, ...mutatedReport }));

  // the hook will return everything the caller needs to create a new report
  return useMutateResource({ resourceQuery: defaultReportQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new report, try `useCreateReport`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultReport (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default report, but keeps things consistent)
 */
export const useGetDefaultReport = (forceFetch = false) => {
  // leverage existing hooks to get the default report (using 'default' as the id will return the default report from the server)
  return useGetReportById('default', forceFetch);
}


/**
 * This hook will check for a fresh report in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the report to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the report (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetReportById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up report specific stuff to be used by the shared hook
  const reportStore = useSelector(({ report }) => report);
  const fetchReport = forceFetch ? fetchSingleReport : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchReport(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now report specific) hook
  return useGetResourceById({ id, fromStore: reportStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh report in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the report (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetReport = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up report specific stuff to be used by the shared hook
  const reportStore = useSelector(({ report }) => report);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchReport = fetchSingleReportAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchReport));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now report specific) hook
  return useGetResource({ listArgs, fromStore: reportStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the report list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetReportList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up report specific stuff to be used by the shared hook
  const reportStore = useSelector(({ report }) => report);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchReports = endpoint ? fetchReportListAtEndpoint : fetchReportList;
  const fetchReportsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchReports);
  const sendFetchList = (queryString) => dispatch(fetchReportsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, reportIds) => dispatch(addReportsToList({ queryString, ids: reportIds }))
  const removeFromList = (queryString, reportIds) => dispatch(removeReportsFromList({ queryString, ids: reportIds }))

  // return the (now report specific) hook
  return useGetResourceList({ listArgs, fromStore: reportStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateReport` action
 * 
 * Useful if you want to update a report that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableReport` if you want to fetch and update a report
 * 
 * @returns the sendUpdateReport action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateReport } = useUpdateReport({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateReport(updatedReport);
 */
export const useUpdateReport = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateReport: (updatedReport) => dispatch(sendUpdateReport({ endpoint, method, ...updatedReport}))
  }
}

/**
 * Use this hook to handle the update of an existing report.
 * @param {string} id - the id of the report to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated report and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `report` as `data`: the report object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the report has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the report and access everything needed to handle updating it
 * const { data: report, handleChange, handleSubmit, ...reportQuery } = useGetUpdatableReport(reportId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedReport, error) => {
 *     if(error || !updatedReport) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/reports/${reportId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={reportQuery}>
 *     <ReportForm
 *       report={report}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableReport = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up report specific stuff to be used by the shared hook
  // use the existing hook to get the reportQuery
  const reportQuery = useGetReportById(id);
  const sendMutation = (mutatedReport) => dispatch(sendUpdateReport(mutatedReport));
  // return the (now report specific) hook
  return useMutateResource({ resourceQuery: reportQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteReport` action
 * 
 * @returns the sendDeleteReport action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteReport } = useDeleteReport();
 * // dispatch the delete action
 * sendDeleteReport(reportId);
 */
export const useDeleteReport = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteReport: (id) => dispatch(sendDeleteReport(id))
  }
}

// OTHERS

/**
 * @returns the `addReportToList` action wrapped in dispatch
 */
export const useAddReportToList = () => {
  const dispatch = useDispatch();
  return {
    addReportToList: (reportId, listArgs) => dispatch(addReportToList({ id: reportId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the report is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the report that you want to grab from the store
 * @returns the report from the store's byId map
 */
export const useReportFromMap = (id) => {
  const report = useSelector(({ report: reportStore }) => selectSingleById(reportStore, id));
  return report
}
