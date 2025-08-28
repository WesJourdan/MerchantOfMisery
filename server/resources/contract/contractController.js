/**
 * Sever-side controllers for Contract.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Contract
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const Contract = require('./ContractModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')
const Shop = require('../shop/ShopModel');
const crypto = require('crypto');

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const contract = await Contract.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Contract", 404);
  });
  if(!contract) throw new YoteError("Could not find matching Contract", 404);
  res.json(contract);
}

exports.createSingle = async (req, res) => {
  const newContract = new Contract(req.body);
  const contract = await newContract.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating Contract", 404);
  });
  res.json(contract);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched Contract Ids", 403);
  }
  const oldContract = await Contract.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Contract", 404);
  });
  if(!oldContract) throw new YoteError("Could not find matching Contract", 404);
  // apply updates
  Object.assign(oldContract, req.body);
  const contract = await oldContract.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update Contract", 404);
  });
  res.json(contract);
}

exports.deleteSingle = async (req, res) => {
  const oldContract = await Contract.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Contract", 404);
  });
  if(!oldContract) throw new YoteError("Could not find matching Contract", 404);
  const deletedContract = await oldContract.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this Contract", 404);
  });
  // console.log('contract deleted', deletedContract);
  // return the deleted contract
  res.json(deletedContract);
}

exports.getDefault = async (req, res) => {
  const defaultContract = await Contract.getDefault();
  if(!defaultContract) throw new YoteError("Could not find default Contract", 404);
  res.json(defaultContract);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { contracts, totalPages, totalCount } = await utilFetchContractList({ query, pagination, sort, limit });
  res.json({ contracts, totalPages, totalCount });
}

// FETCH UTILS
const utilFetchContractList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await Contract.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const contracts = await Contract.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding Contract list", 404);
    });
  return { contracts, totalPages, totalCount };
}

// need to wire this up to happen on advance day
// also on new store creation so we have something to start with
exports.utilRefreshShopContractList = async (shopId) => {
  // 1) Load the shop – we derive offers from shop.worldSeed + shop.day
  const shop = await Shop.findById(shopId).lean();
  if (!shop) throw new YoteError('Shop not found for contract refresh', 404);

  // 2) Deterministic RNG from seed(worldSeed:day)
  const rootSeed = `${shop.worldSeed || ''}:${shop.day || 0}`;

  // 3) Wipe current "offered" contracts for this user (fresh list per day)
  await Contract.deleteMany({ _user: shop._user, _shop: shopId, state: 'offered' });

  // 4) Generate N new offers deterministically
  const N = 3;
  const objectives = ['retrieve', 'scout', 'escort'];
  const offers = [];

  for (let i = 0; i < N; i++) {
    const seed = `${rootSeed}:${i}`;
    const r = makeRng(seed); // per-offer RNG

    const dungeonTier = clamp(1 + Math.floor(r() * 4), 1, 5); // 1..4 (cap 5)
    const objective = objectives[Math.floor(r() * objectives.length)];

    // baseRisk ~ 0.2..0.85 with slight tier scaling
    const baseRisk = clamp(0.15 + r() * 0.7 + (dungeonTier - 1) * 0.05, 0, 0.95);

    // rewards scale with tier
    const base = 50 * dungeonTier;
    const spread = 40 * dungeonTier;
    const goldMin = Math.floor(base + r() * spread);
    const goldMax = goldMin + Math.floor(40 + r() * (60 * dungeonTier));
    const etaDays = clamp(1 + Math.floor(r() * 4), 1, 5);

    offers.push({
      _user: shop._user,
      _shop: shop._id,
      dungeonTier,
      objective,
      baseRisk: Number(baseRisk.toFixed(2)),
      expectedReward: { goldMin, goldMax, lootHint: '' },
      etaDays,
      state: 'offered',
      seed
    });
  }

  // 5) Insert and return the list
  const created = await Contract.insertMany(offers, { ordered: true });
  console.log("Created new contract offers:", created);
  return created;
};

// ===== helpers (local) =====
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function makeRng(seedStr) {
  // Hash to 32-bit int then mulberry32 PRNG (deterministic)
  const h = crypto.createHash('sha256').update(seedStr).digest();
  // use first 4 bytes as unsigned int
  let a = h.readUInt32LE(0);
  return function mulberry32() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
