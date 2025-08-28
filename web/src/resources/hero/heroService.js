/**
 * This set of hooks is how we'll interact with the heroStore. The idea is to provide a simple api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchHeroList
  , fetchHeroListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleHero
  , fetchSingleHeroAtEndpoint
  , sendCreateHero
  , sendUpdateHero
  , sendDeleteHero
  , invalidateQuery
  // , invalidateQueries
  , addHeroToList
  , addHeroesToList
  , removeHeroesFromList
  , fetchSingleIfNeeded
} from './heroStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// CREATE

/**
 * Use this hook to handle the creation of a new hero.
 * @param {Object} initialState - The initial state of the hero (optional)
 * @param {Function} handleResponse - The function to call when the hero is successfully created
 * @param {string} endpoint - The specific endpoint to hit when creating the hero (optional)
 * @param {string} method - The http method to use when creating the hero (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newHero` as `data`: the new hero object as it currently exists in state, initially the default hero
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default hero
 * const { data: newHero, handleChange, handleSubmit, ...heroQuery } = useCreateHero({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , handleResponse: (hero, error) => {
 *     if(error || !hero) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/heroes/${hero._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={heroQuery}>
 *     <HeroForm
 *       hero={hero}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateHero = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up hero specific stuff to be used by the shared hook
  const defaultHeroQuery = useGetDefaultHero();
  const sendMutation = (mutatedHero) => dispatch(sendCreateHero({ endpoint, method, ...mutatedHero }));

  // the hook will return everything the caller needs to create a new hero
  return useMutateResource({ resourceQuery: defaultHeroQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new hero, try `useCreateHero`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultHero (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default hero, but keeps things consistent)
 */
export const useGetDefaultHero = (forceFetch = false) => {
  // leverage existing hooks to get the default hero (using 'default' as the id will return the default hero from the server)
  return useGetHeroById('default', forceFetch);
}


/**
 * This hook will check for a fresh hero in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the hero to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the hero (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetHeroById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up hero specific stuff to be used by the shared hook
  const heroStore = useSelector(({ hero }) => hero);
  const fetchHero = forceFetch ? fetchSingleHero : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchHero(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now hero specific) hook
  return useGetResourceById({ id, fromStore: heroStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh hero in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the hero (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetHero = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up hero specific stuff to be used by the shared hook
  const heroStore = useSelector(({ hero }) => hero);
  // use the custom endpoint action regardless because it will default to the standard list api if no endpoint is passed in (that's what we want)
  const fetchHero = fetchSingleHeroAtEndpoint;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchHero));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now hero specific) hook
  return useGetResource({ listArgs, fromStore: heroStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the hero list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetHeroList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up hero specific stuff to be used by the shared hook
  const heroStore = useSelector(({ hero }) => hero);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchHeroes = endpoint ? fetchHeroListAtEndpoint : fetchHeroList;
  const fetchHeroesIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchHeroes);
  const sendFetchList = (queryString) => dispatch(fetchHeroesIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, heroIds) => dispatch(addHeroesToList({ queryString, ids: heroIds }))
  const removeFromList = (queryString, heroIds) => dispatch(removeHeroesFromList({ queryString, ids: heroIds }))

  // return the (now hero specific) hook
  return useGetResourceList({ listArgs, fromStore: heroStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateHero` action
 * 
 * Useful if you want to update a hero that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableHero` if you want to fetch and update a hero
 * 
 * @returns the sendUpdateHero action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateHero } = useUpdateHero({ endpoint: myEndpoint, method: 'POST' });
 * // dispatch the update action
 * sendUpdateHero(updatedHero);
 */
export const useUpdateHero = ({endpoint, method}) => {
  const dispatch = useDispatch();
  return {
    // return the update action
    sendUpdateHero: (updatedHero) => dispatch(sendUpdateHero({ endpoint, method, ...updatedHero}))
  }
}

/**
 * Use this hook to handle the update of an existing hero.
 * @param {string} id - the id of the hero to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated hero and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `hero` as `data`: the hero object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the hero has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the hero and access everything needed to handle updating it
 * const { data: hero, handleChange, handleSubmit, ...heroQuery } = useGetUpdatableHero(heroId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedHero, error) => {
 *     if(error || !updatedHero) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/heroes/${heroId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={heroQuery}>
 *     <HeroForm
 *       hero={hero}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableHero = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up hero specific stuff to be used by the shared hook
  // use the existing hook to get the heroQuery
  const heroQuery = useGetHeroById(id);
  const sendMutation = (mutatedHero) => dispatch(sendUpdateHero(mutatedHero));
  // return the (now hero specific) hook
  return useMutateResource({ resourceQuery: heroQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteHero` action
 * 
 * @returns the sendDeleteHero action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteHero } = useDeleteHero();
 * // dispatch the delete action
 * sendDeleteHero(heroId);
 */
export const useDeleteHero = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteHero: (id) => dispatch(sendDeleteHero(id))
  }
}

// OTHERS

/**
 * @returns the `addHeroToList` action wrapped in dispatch
 */
export const useAddHeroToList = () => {
  const dispatch = useDispatch();
  return {
    addHeroToList: (heroId, listArgs) => dispatch(addHeroToList({ id: heroId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the hero is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the hero that you want to grab from the store
 * @returns the hero from the store's byId map
 */
export const useHeroFromMap = (id) => {
  const hero = useSelector(({ hero: heroStore }) => selectSingleById(heroStore, id));
  return hero
}
