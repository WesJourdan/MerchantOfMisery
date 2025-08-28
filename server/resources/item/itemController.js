/**
 * Sever-side controllers for Item.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Item
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const Item = require('./ItemModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils');

const { nameCraftedItem } = require('../llm/llmController');

// single api functions
exports.getSingleById = async (req, res) => {
  const item = await Item.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Item", 404);
  });
  if(!item) throw new YoteError("Could not find matching Item", 404);
  res.json(item);
}

exports.createSingle = async (req, res) => {
  console.log("Creating item:", req.body);
  try {
    // Enrich with LLM-generated name/description if missing
    const itemDTO = { ...req.body, _user: req.user._id };

    const { name, description } = await nameCraftedItem(itemDTO);
    itemDTO.name = name;
    itemDTO.description = description;

    const newItem = new Item(itemDTO);
    const item = await newItem.save().catch(err => {
      console.log(err);
      throw new YoteError("Error creating Item", 404);
    });
    console.log('item created:', item);
    res.json(item);
  } catch(err) {
    console.log('error creating item:', err);
    throw new YoteError("Error creating Item", 404);
  }
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched Item Ids", 403);
  }
  const oldItem = await Item.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Item", 404);
  });
  if(!oldItem) throw new YoteError("Could not find matching Item", 404);
  // apply updates
  Object.assign(oldItem, req.body);
  const item = await oldItem.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update Item", 404);
  });
  res.json(item);
}

exports.deleteSingle = async (req, res) => {
  const oldItem = await Item.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Item", 404);
  });
  if(!oldItem) throw new YoteError("Could not find matching Item", 404);
  const deletedItem = await oldItem.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this Item", 404);
  });
  // console.log('item deleted', deletedItem);
  // return the deleted item
  res.json(deletedItem);
}

exports.getDefault = async (req, res) => {
  const defaultItem = await Item.getDefault();
  if(!defaultItem) throw new YoteError("Could not find default Item", 404);
  res.json(defaultItem);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { items, totalPages, totalCount } = await utilFetchItemList({ query, pagination, sort, limit });
  res.json({ items, totalPages, totalCount });
}

const RANDOM_ITEMS = [
  {
    "id": "itm_001",
    "name": "Rusty Sword",
    "slot": "weapon",
    "tier": 1,
    "baseValue": 50,
    "affixes": [{ "k": "atk", "v": 2 }],
    "stock": 3,
    "isCursed": false,
    "rarity": "common"
  },
  {
    "id": "itm_002",
    "name": "Cracked Buckler",
    "slot": "armor",
    "tier": 1,
    "baseValue": 40,
    "affixes": [{ "k": "def", "v": 1 }],
    "stock": 2,
    "isCursed": false,
    "rarity": "common"
  },
  {
    "id": "itm_003",
    "name": "Amulet of Slight Itchiness",
    "slot": "trinket",
    "tier": 1,
    "baseValue": 75,
    "affixes": [{ "k": "luck", "v": -1 }],
    "stock": 1,
    "isCursed": true,
    "rarity": "uncommon"
  },
  {
    "id": "itm_004",
    "name": "Potion of Regret",
    "slot": "consumable",
    "tier": 1,
    "baseValue": 25,
    "affixes": [{ "k": "heal", "v": 10 }],
    "stock": 5,
    "isCursed": false,
    "rarity": "common"
  },
  {
    "id": "itm_005",
    "name": "Frozen Dagger of Misfortune",
    "slot": "weapon",
    "tier": 2,
    "baseValue": 150,
    "affixes": [
      { "k": "atk", "v": 4 },
      { "k": "frost", "v": 2 },
      { "k": "misfortune", "v": -1 }
    ],
    "stock": 1,
    "isCursed": false,
    "rarity": "rare"
  }
]

exports.seedRandomItems = async (req, res) => {
  const { shopId } = req.params;

  const items = await Item.insertMany(RANDOM_ITEMS.map(item => ({ ...item, _shop: shopId, _user: req.user._id }))).catch(err => {
    console.log(err);
    throw new YoteError("There was a problem seeding random items", 404);
  });
  if(!items) throw new YoteError("Could not seed random items", 404);
  res.json(items);
}

// FETCH UTILS
const utilFetchItemList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await Item.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const items = await Item.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding Item list", 404);
    });
  return { items, totalPages, totalCount };
}