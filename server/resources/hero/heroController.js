/**
 * Sever-side controllers for Hero.
 * By default, Yote's server controllers are dynamic relative
 * to their models -- i.e. if you add fields to the Hero
 * model, the create and update controllers below will respect
 * the new schema.
 *
 * NOTE: HOWEVER, you still need to make sure to account for
 * any model changes on the client
 */
const Hero = require('./HeroModel');
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const hero = await Hero.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Hero", 404);
  });
  if(!hero) throw new YoteError("Could not find matching Hero", 404);
  res.json(hero);
}

exports.createSingle = async (req, res) => {
  const newHero = new Hero(req.body);
  const hero = await newHero.save().catch(err => {
    console.log(err);
    throw new YoteError("Error creating Hero", 404);
  });
  res.json(hero);
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched Hero Ids", 403);
  }
  const oldHero = await Hero.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Hero", 404);
  });
  if(!oldHero) throw new YoteError("Could not find matching Hero", 404);
  // apply updates
  Object.assign(oldHero, req.body);
  const hero = await oldHero.save().catch(err => {
    console.log(err);
    throw new YoteError("Could not update Hero", 404);
  });
  res.json(hero);
}

exports.deleteSingle = async (req, res) => {
  const oldHero = await Hero.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Hero", 404);
  });
  if(!oldHero) throw new YoteError("Could not find matching Hero", 404);
  const deletedHero = await oldHero.remove().catch(err => {
    console.log(err);
    throw new YoteError("There was a problem deleting this Hero", 404);
  });
  // console.log('hero deleted', deletedHero);
  // return the deleted hero
  res.json(deletedHero);
}

exports.getDefault = async (req, res) => {
  const defaultHero = await Hero.getDefault();
  if(!defaultHero) throw new YoteError("Could not find default Hero", 404);
  res.json(defaultHero);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { heroes, totalPages, totalCount } = await utilFetchHeroList({ query, pagination, sort, limit });
  res.json({ heroes, totalPages, totalCount });
}

// FETCH UTILS
const utilFetchHeroList = async ({ query, pagination, sort, limit, populate = '' }) => {
  // get count so we can determine total pages for front end to allow proper pagination on client
  const totalCount = pagination ? await Hero.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const heroes = await Hero.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding Hero list", 404);
    });
  return { heroes, totalPages, totalCount };
}