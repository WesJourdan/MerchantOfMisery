/**
 * Reads and exports the reducers as defined by each resource module
 *
 * NOTE: this facilitates adding reducers via the CLI
 */

export { default as auth } from '../resources/user/authStore.js';
export { default as product } from '../resources/product/productStore.js';
export { default as notification } from '../resources/notification/notificationStore.js';
export { default as shop } from '../resources/shop/shopStore.js';
export { default as item } from '../resources/item/itemStore.js';
export { default as hero } from '../resources/hero/heroStore.js';
export { default as contract } from '../resources/contract/contractStore.js';
export { default as contractRun } from '../resources/contractRun/contractRunStore.js';
export { default as ingredient } from '../resources/ingredient/ingredientStore.js';
export { default as enchantment } from '../resources/enchantment/enchantmentStore.js';
export { default as craftingSession } from '../resources/craftingSession/craftingSessionStore.js';
export { default as itemBreakdown } from '../resources/itemBreakdown/itemBreakdownStore.js';
export { default as recipe } from '../resources/recipe/recipeStore.js';
export { default as report } from '../resources/report/reportStore.js';