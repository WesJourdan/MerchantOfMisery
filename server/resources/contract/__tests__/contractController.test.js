const YoteError = require('../../../global/helpers/YoteError');

jest.mock('../ContractModel', () => ({
  deleteMany: jest.fn(() => Promise.resolve({ acknowledged: true })),
  insertMany: jest.fn(async (offers) => offers.map((offer, index) => ({ ...offer, _id: `created-${index}` }))),
}));

jest.mock('../../shop/ShopModel', () => ({
  findById: jest.fn(),
}));

const Contract = require('../ContractModel');
const Shop = require('../../shop/ShopModel');
const controller = require('../contractController');

describe('contractController.utilRefreshShopContractList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws a YoteError when no shop is found', async () => {
    Shop.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(controller.utilRefreshShopContractList('missing-shop'))
      .rejects.toBeInstanceOf(YoteError);

    expect(Contract.deleteMany).not.toHaveBeenCalled();
    expect(Contract.insertMany).not.toHaveBeenCalled();
  });

  it('replaces offered contracts with deterministic offers for the shop', async () => {
    const shopDoc = {
      _id: 'shop-123',
      _user: 'user-456',
      worldSeed: 'arcadia',
      day: 17,
    };

    const leanMock = jest.fn().mockResolvedValue(shopDoc);
    Shop.findById.mockReturnValue({ lean: leanMock });

    const createdContracts = await controller.utilRefreshShopContractList(shopDoc._id);

    expect(Shop.findById).toHaveBeenCalledWith(shopDoc._id);
    expect(leanMock).toHaveBeenCalled();

    expect(Contract.deleteMany).toHaveBeenCalledWith({
      _user: shopDoc._user,
      _shop: shopDoc._id,
      state: 'offered',
    });

    expect(Contract.insertMany).toHaveBeenCalledTimes(1);
    const offers = Contract.insertMany.mock.calls[0][0];
    expect(Array.isArray(offers)).toBe(true);
    expect(offers).toHaveLength(3);

    const expectedSeeds = ['arcadia:17:0', 'arcadia:17:1', 'arcadia:17:2'];
    expect(offers.map(o => o.seed)).toEqual(expectedSeeds);

    offers.forEach((offer) => {
      expect(offer).toMatchObject({
        _user: shopDoc._user,
        _shop: shopDoc._id,
        state: 'offered',
      });
      expect(offer.dungeonTier).toBeGreaterThanOrEqual(1);
      expect(offer.dungeonTier).toBeLessThanOrEqual(5);
      expect(offer.baseRisk).toBeGreaterThanOrEqual(0);
      expect(offer.baseRisk).toBeLessThanOrEqual(0.95);
      expect(offer.expectedReward.goldMin).toBeLessThanOrEqual(offer.expectedReward.goldMax);
      expect(['retrieve', 'scout', 'escort']).toContain(offer.objective);
    });

    expect(createdContracts).toEqual(
      offers.map((offer, index) => ({ ...offer, _id: `created-${index}` })),
    );
  });
});
