/**
 * Sever-side controllers for Shop.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Shop
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const Shop = require('./ShopModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils');
const { randomUUID } = require('crypto');
const { utilRefreshShopContractList } = require('../contract/contractController');


// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const shop = await Shop.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Shop", 404);
  });
  if(!shop) throw new YoteError("Could not find matching Shop", 404);
  res.json(shop);
}

exports.createSingle = async (req, res) => {
  // only name, description, and priceStrategy are entered by the user
  console.log('req.body', req.body);
  const newShop = new Shop(req.body);
  // assign ownership;
  newShop._user = req.user._id;
  // Fill worldSeed if client didn't send one
  if (!newShop.worldSeed) newShop.worldSeed = randomUUID();
  console.log('newShop', newShop);
  const shop = await newShop.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating Shop", 404);
  });
  res.json(shop);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched Shop Ids", 403);
  }
  const oldShop = await Shop.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Shop", 404);
  });
  if(!oldShop) throw new YoteError("Could not find matching Shop", 404);
  // apply updates
  Object.assign(oldShop, req.body);
  const shop = await oldShop.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update Shop", 404);
  });
  res.json(shop);
}

exports.deleteSingle = async (req, res) => {
  const oldShop = await Shop.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Shop", 404);
  });
  if(!oldShop) throw new YoteError("Could not find matching Shop", 404);
  const deletedShop = await oldShop.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this Shop", 404);
  });
  // console.log('shop deleted', deletedShop);
  // return the deleted shop
  res.json(deletedShop);
}

exports.getDefault = async (req, res) => {
  const defaultShop = await Shop.getDefault();
  if(!defaultShop) throw new YoteError("Could not find default Shop", 404);
  res.json(defaultShop);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { shops, totalPages, totalCount } = await utilFetchShopList({ query, pagination, sort, limit });
  res.json({ shops, totalPages, totalCount });
}

exports.advanceDay = async (req, res) => {
  const shop = await Shop.findById(req.params.shopId).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Shop", 404);
  });
  if(!shop) throw new YoteError("Could not find matching Shop", 404);

  // Advance the shop's day
  shop.day += 1;
  await shop.save().catch(err => {
    console.log(err);
    throw new YoteError("Error advancing Shop day", 404);
  });

  // Refresh the contract list for the shop
  await utilRefreshShopContractList(shop._id);

  res.json(shop);
}

// FETCH UTILS
const utilFetchShopList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await Shop.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const shops = await Shop.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding Shop list", 404);
    });
  return { shops, totalPages, totalCount };
}