/**
 * Reads and exports the routes as defined by each resource module.
 *
 * NOTE: this facilitates adding routes via the CLI. The CLI will automatically
 * build these exports with the camelCase version of the resource name so as to
 * add a consistent top-level path to the resource. A resource named UserWorkout
 * will show below as follows:
 *
 * export { default as userWorkout } from './userWorkout/UserWorkoutRouter.jsx'
 *
 * This will give it a top-level route path called 'user-workouts'
 */

import { lazy } from 'react';

// lazy load the routes so they aren't included in the intial bundle and don't load until they are needed or until we decide to preload them (on App.jsx)
export const user = lazy(() => import('../resources/user/UserRouter.jsx'));
export const products = lazy(() => import('../resources/product/ProductRouter.jsx'));
export const shops = lazy(() => import('../resources/shop/ShopRouter.jsx'));
export const items = lazy(() => import('../resources/item/ItemRouter.jsx'));
export const heroes = lazy(() => import('../resources/hero/HeroRouter.jsx'));
export const contracts = lazy(() => import('../resources/contract/ContractRouter.jsx'));
export const contractRuns = lazy(() => import('../resources/contractRun/ContractRunRouter.jsx'));
export const ingredients = lazy(() => import('../resources/ingredient/IngredientRouter.jsx'));
export const enchantments = lazy(() => import('../resources/enchantment/EnchantmentRouter.jsx'));
export const craftingSessions = lazy(() => import('../resources/craftingSession/CraftingSessionRouter.jsx'));
export const itemBreakdowns = lazy(() => import('../resources/itemBreakdown/ItemBreakdownRouter.jsx'));
export const recipes = lazy(() => import('../resources/recipe/RecipeRouter.jsx'));
export const reports = lazy(() => import('../resources/report/ReportRouter.jsx'));