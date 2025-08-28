import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom';
import { classNames } from '../../../global/utils/filterUtils';
import { SelectInput } from '../../../global/components/forms'

// data
import { useAdvanceDay, useGetShopById } from '../shopService';

// UI
import ShopStatusCard from '../components/ShopStatusCard';
import ContractsCard from '../../contract/components/ContractsCard';
import HeroCard from '../../hero/components/HeroCard';
import ReportsCard from '../../report/components/ReportsCard';
import { useGetContractList } from '../../contract/contractService';
import { useCreateItem } from '../../item/itemService';
import { useEffect } from 'react';
import MeshBuilderDemo from '../../item/components/ItemMeshBuilder'

const titleCase = (s) => (s || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());



/**
 * Placeholder resource objects (you'll wire these up later)
 */
// const shop = {
//   gold: 1250,
//   reputation: 42,          // -100..100
//   day: 7,
//   priceStrategy: 'fair',   // greedy | fair | altruist
// };

// const shopInventory = [
//   { name: 'Iron Sword', slot: 'Weapon', tier: 2, rarity: 'Common', stock: 5 },
//   { name: 'Steel Shield', slot: 'Shield', tier: 3, rarity: 'Rare', stock: 2 },
//   { name: 'Healing Potion', slot: 'Consumable', tier: 1, rarity: 'Uncommon', stock: 10 },
//   { name: 'Magic Robe', slot: 'Armor', tier: 4, rarity: 'Epic', stock: 1 },
// ];

const heroes = [
  { name: 'Sir Roland', class: 'Knight', level: 8, status: 'Ready' },
  { name: 'Mira', class: 'Rogue', level: 6, status: 'Resting' },
  { name: 'Thalia', class: 'Cleric', level: 7, status: 'On Mission' },
];

// const contracts = [
//   { objective: 'Slay the Undead', dungeonTier: 3, baseRisk: 'Medium', etaDays: 2 },
//   { objective: 'Escort Merchant', dungeonTier: 1, baseRisk: 'Low', etaDays: 1 },
//   { objective: 'Retrieve Artifact', dungeonTier: 4, baseRisk: 'High', etaDays: 4 },
// ];

const reports = [
  { outcome: 'Success', summary: 'The party returned victorious with the artifact.' },
  { outcome: 'Failure', summary: 'The merchant was ambushed and the contract failed.' },
  { outcome: 'Pending', summary: 'The undead have been engaged, results unknown.' },
];

/**
 * UI helpers
 */
const strategyPill = (s) => {
  if(s === 'greedy') return 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-600/30';
  if(s === 'altruist') return 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-600/30';
  return 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-600/30';
};

const ShopDashboard = () => {
  const { shopId } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCrafting, setShowCrafting] = useState(false);

  const { data: shop } = useGetShopById(shopId);
  const { data: contracts, invalidate: invalidateContracts } = useGetContractList({ _shop: shopId });

  const advanceDay = useAdvanceDay(shop?._id);

  const handleAdvanceDay = async () => {
    console.log("Advancing day for shop:");
    const result = await advanceDay();
    if(result) {
      console.log("Day advanced successfully", { result });
      invalidateContracts();
      // Handle successful day advancement (e.g., show a message, update state)
    } else {
      console.error("Failed to advance day");
    }
  }

  const navTo = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // return (
  //   <MeshBuilderDemo />
  // )

  return (
    <main>
      <section className="w-full max-w-7xl mx-auto px-4 pb-40 md:pb-28 lg:pb-24 font-['Inter']">
        <Header shop={shop} handleAdvanceDay={handleAdvanceDay} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShopStatusCard shopId={shopId} />
          <HeroCard heroes={heroes} />
          <ContractsCard shopId={shopId} />
          <ReportsCard reports={reports} />
        </div>
        <BottomNav activeTab={activeTab} navTo={navTo} onOpenCrafting={() => setShowCrafting(true)} />
      </section>
      <CraftingModal isOpen={showCrafting} shopId={shopId} closeModal={() => setShowCrafting(false)} />
    </main>
  );
};

export default ShopDashboard;

const Header = ({
  shop,
  handleAdvanceDay
}) => {

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-6 bg-gray-900/80 backdrop-blur-sm ring-1 ring-gray-800/80">
      <div className="px-4 pt-6">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold tracking-tight font-['Cinzel'] text-yellow-200 drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
          Merchant Of Misery
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-200 ring-1 ring-gray-700">
            <span className="i">📅</span>
            Day <strong className="ml-1">{shop?.day}</strong>
          </span>
          <span className={classNames('inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1', strategyPill(shop?.priceStrategy))}>
            <span className="i">🧮</span>
            Pricing: <strong className="ml-1 capitalize">{shop?.priceStrategy}</strong>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 text-yellow-300 ring-1 ring-yellow-600/30 px-3 py-1 text-sm">
            <span className="i">💰</span>
            <strong>{shop?.gold.toLocaleString()}</strong> gold
          </span>
          <button
            type="button"
            className="ml-2 inline-flex items-center gap-2 rounded-md bg-amber-500/90 hover:bg-amber-400 text-gray-900 font-semibold px-4 py-2 shadow ring-1 ring-amber-700/30 transition"
            onClick={handleAdvanceDay}
          >
            ▶ Advance Day
          </button>
        </div>
      </div>
    </div>
  )
}


const BottomNav = ({ activeTab, navTo, onOpenCrafting }) => (
  <nav className="fixed inset-x-0 bottom-0 z-20">
    <div className="mx-auto max-w-7xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <div className="rounded-2xl bg-gray-900/80 backdrop-blur ring-1 ring-gray-800/80 shadow-lg shadow-black/30">
        <ul className="grid grid-cols-6 text-sm">
          <li>
            <button onClick={() => navTo('shop')} className={`w-full px-3 py-3 flex items-center justify-center gap-2 ${activeTab === 'shop' ? 'text-yellow-300' : 'text-gray-300'} hover:text-white`}>
              <span>🏪</span><span className="hidden sm:inline">Shop</span>
            </button>
          </li>
          <li>
            <button onClick={() => navTo('heroes')} className={`w-full px-3 py-3 flex items-center justify-center gap-2 ${activeTab === 'heroes' ? 'text-green-300' : 'text-gray-300'} hover:text-white`}>
              <span>🛡️</span><span className="hidden sm:inline">Heroes</span>
            </button>
          </li>
          <li>
            <button onClick={() => navTo('contracts')} className={`w-full px-3 py-3 flex items-center justify-center gap-2 ${activeTab === 'contracts' ? 'text-blue-300' : 'text-gray-300'} hover:text-white`}>
              <span>📜</span><span className="hidden sm:inline">Contracts</span>
            </button>
          </li>
          <li>
            <button onClick={() => navTo('reports')} className={`w-full px-3 py-3 flex items-center justify-center gap-2 ${activeTab === 'reports' ? 'text-rose-300' : 'text-gray-300'} hover:text-white`}>
              <span>🧾</span><span className="hidden sm:inline">Reports</span>
            </button>
          </li>
          <li className="col-span-2">
            <button onClick={onOpenCrafting} className="w-full px-3 py-3 flex items-center justify-center gap-2 text-gray-900 bg-amber-400/90 hover:bg-amber-300 rounded-b-2xl sm:rounded-r-2xl sm:rounded-bl-none font-semibold transition">
              <span>⚒️</span><span className="hidden sm:inline">Open Crafting</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
);


const CraftingModal = ({
  isOpen,
  closeModal,
  shopId
}) => {
  if(!isOpen) return null;
  const [craftedItem, setCraftedItem] = useState(null);

  const { data: item, handleChange, setFormState, handleSubmit, ...itemQuery } = useCreateItem({
    initialState: {
      _shop: shopId
    },
    onResponse: (item, error) => {
      if(item) {
        console.log('[Crafting] FORGE request →', item);
        setCraftedItem(item);
      } else {
        console.error('[Crafting] FORGE request failed →', error);
      }
    }
  })

  console.log({ item })

  // --- Placeholder catalogs (wire to real data later) ---
  const SLOT_OPTIONS = ['weapon', 'armor', 'trinket', 'consumable'];
  const RARITY_OPTIONS = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const TIER_OPTIONS = ['1', '2', '3', '4', '5'];

  const ENCHANTMENTS = [
    { id: 'fire', label: 'Fire (of Embering, Flaming)' },
    { id: 'frost', label: 'Frost (of Chilling, Gelid)' },
    { id: 'poison', label: 'Poison (of Toxicity)' },
    { id: 'holy', label: 'Holy (of Radiance)' },
    { id: 'shadow', label: 'Shadow (of Woe)' },
    { id: 'chaos', label: 'Chaos (of Weirding)' },
    { id: 'lightning', label: 'Lightning (of Zapping)' },
    { id: 'cow', label: 'Cow (of Bovine Might)' },
    { id: 'greed', label: 'Greed (of Hoarding)' },
    { id: 'misfortune', label: 'Misfortune (of Bad Juju)' },
    { id: 'alcohol', label: 'Alcohol (of Liquid Courage)' },
    { id: 'gluten', label: 'Gluten (of Eternal Carbs)' },
    { id: 'flatulence', label: 'Flatulence (of Doomfart)' },
    { id: 'love', label: 'Love (of Misplaced Affection)' },
  ];

  const BASE_MATERIALS = {
    weapon: ['Iron Ingot', 'Steel Ingot', 'Demon Claw', 'Rusty Nails', 'Oak Shaft'],
    armor: ['Leather Scraps', 'Chain Links', 'Iron Plates', 'Padded Lining', 'Polished Buckle'],
    trinket: ['Silver Thread', 'Obsidian Bead', 'Goblin Charm', 'Bent Ring', 'Tarnished Amulet'],
    consumable: ['Herb Bundle', 'Crystal Vial', 'Powdered Bone', 'Mushroom Cap', 'Spring Water'],
  };

  const RANDOM_JUNK = [
    'Expired Canned Meat',
    'Soggy Sock',
    'Bent Spoon',
    'Ancient IOU',
    'Mystery Goo',
    'Cracked Mug',
    "rusty spoon",
    "boiled crow feather",
    "tangle of rope",
    "singed napkin",
    "dented mug",
    "squeaking mouse wheel",
    "fizzy ale cork",
    "polished dragon scale",
    "crooked horseshoe",
    "newt eyeball",
    "glow-in-the-dark thumb tack",
    "oil-soaked parchment",
    "squeaky toy bell",
    "soured peppermint",
    "frost-worn coin",
    "cracked bellows",
    "vulture feather",
    "sourdough crust",
    "smoked rat tail",
    "hushed candle",
    "stubby quill",
    "boiled beetle",
    "tarnished bolt",
    "cinder-scented rag",
    "stale ale dregs",
    "glass eyeball",
    "gutter ash",
    "bee sting jar",
    "charred wood splinter",
    "gaffer’s thimble"
  ];

  const AFFIX_CURVE = {
    common: { min: [1, 2, 3, 4, 5], max: [2, 3, 4, 5, 6] },
    uncommon: { min: [2, 3, 4, 5, 6], max: [3, 4, 6, 7, 8] },
    rare: { min: [3, 4, 6, 7, 9], max: [4, 6, 8, 10, 12] },
    epic: { min: [4, 6, 8, 10, 13], max: [6, 8, 11, 14, 18] },
    legendary: { min: [6, 9, 12, 15, 18], max: [8, 12, 16, 20, 25] },
  };

  // const [item, setFormState] = useState({
  //   slot: 'weapon',
  //   tier: '1',
  //   rarity: 'common',
  //   enchantment: 'fire',
  //   materials: [],
  //   junk: '',
  //   isCursed: false,
  // });

  // --- helpers ---
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const curveFor = (rarity, tier) => {
    const idx = Math.max(1, Math.min(5, Number(tier))) - 1;
    const curve = AFFIX_CURVE[rarity];
    return { min: curve?.min?.[idx] || 0, max: curve?.max?.[idx] || 0 };
  };

  const rollValue = (rarity, tier) => {
    const { min, max } = curveFor(rarity, tier);
    return randInt(min, max);
  };

  const baseValueFor = (slot, tier, rarity) => {
    // very rough placeholder economy: scales by tier & rarity index
    const rarityIndex = RARITY_OPTIONS.indexOf(rarity) + 1; // 1..5
    const slotMult = { weapon: 22, armor: 20, trinket: 18, consumable: 12 }[slot] || 15;
    return Math.max(10, Math.round(slotMult * tier * (0.8 + 0.2 * rarityIndex)));
  };

  const affixesFor = (slot, rarity, tier, enchantment) => {
    const core = slot === 'weapon' ? 'atk' : slot === 'armor' ? 'def' : slot === 'trinket' ? 'luck' : 'heal';
    const coreVal = rollValue(rarity, tier);
    const enchKey = `ench:${enchantment}`;
    const enchVal = Math.max(1, Math.round(rollValue(rarity, tier) * 0.6));
    const flavor = item?.junk ? [{ k: `flavor:${item?.junk.replace(/\s+/g, '_').toLowerCase()}`, v: 1 }] : [];
    return [{ k: core, v: coreVal }, { k: enchKey, v: enchVal }, ...flavor];
  };

  const nameFor = (slot, rarity, enchantment) => {
    const noun = slot === 'weapon' ? 'Blade' : slot === 'armor' ? 'Mail' : slot === 'trinket' ? 'Charm' : 'Tonic';
    const ofWhat = {
      fire: 'Flames', frost: 'Chill', poison: 'Venom', holy: 'Radiance', shadow: 'Woe',
      chaos: 'Madness', lightning: 'Thunder', cow: 'Bovine Might', greed: 'Hoarding', misfortune: 'Bad Juju',
      alcohol: 'Liquid Courage', gluten: 'Eternal Carbs', flatulence: 'Doomfart', love: 'Romance'
    }[enchantment] || 'Mystery';
    return `${titleCase(rarity)} ${noun} of ${ofWhat}`;
  };

  useEffect(() => {
    // update affixes on item change
    if (item) {
      const { slot, tier, rarity, enchantment } = item;
      const affixes = affixesFor(slot, rarity, tier, enchantment);
      const baseValue = baseValueFor(slot, tier, rarity);
      setFormState(prev => ({ ...prev, affixes, baseValue }));
    }
  }, [item?.slot, item?.tier, item?.rarity, item?.enchantment]);

  // const preview = useMemo(() => {
  //   const { slot, tier, rarity, enchantment } = item;
  //   const previewItem = {
  //     name: nameFor(slot, rarity, enchantment),
  //     slot,
  //     tier: Number(tier),
  //     baseValue: baseValueFor(slot, tier, rarity),
  //     affixes: affixesFor(slot, rarity, tier, enchantment),
  //     stock: 1,
  //     isCursed: !!item?.isCursed,
  //     rarity,
  //     // non-schema helper for UI only
  //     _ingredients: { materials: item?.materials, junk: item?.junk }
  //   };

  //   const namingPrompt = {
  //     // system: 'You name parody-ARPG loot. Keep to 1-2 sentences for description.',
  //     // intent: 'name_and_description',
  //     // inputs: {
  //     //   slot,
  //     //   tier: Number(tier),
  //     //   rarity,
  //     //   enchantment,
  //     //   stats: item?.affixes,
  //     //   isCursed: !!item?.isCursed,
  //     //   forgeNotes: {
  //     //     crafterFatigue: 2,
  //     //     shopReputation: 12,
  //     //     // events: ['customer returned cursed hat','donkey brayed ominously']
  //     //     // events: ['Evan the hero never came back with that sword he promised','electrical storm']
  //     //     // events: ["Forger's stomach was growling"]
  //     //   },
  //     //   ingredients: { materials: item?.materials, randomJunk: item?.junk }
  //     // },
  //   };

  //   return { item: previewItem, namingPrompt };
  // }, [item]);

  // const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleMaterial = (mat) => {
    setFormState((prev = {}) => {
      const exists = prev?.materials?.includes(mat);
      const materials = prev?.materials || [];
      return { ...prev, materials: exists ? materials.filter(m => m !== mat) : [...materials, mat] };
    });
  };

  const randomize = () => {
    const slot = SLOT_OPTIONS[randInt(0, SLOT_OPTIONS.length - 1)];
    const tier = TIER_OPTIONS[randInt(0, TIER_OPTIONS.length - 1)];
    const rarity = RARITY_OPTIONS[randInt(0, RARITY_OPTIONS.length - 1)];
    const enchantment = ENCHANTMENTS[randInt(0, ENCHANTMENTS.length - 1)].id;
    const mats = [
      BASE_MATERIALS[slot][randInt(0, BASE_MATERIALS[slot].length - 1)],
      BASE_MATERIALS[slot][randInt(0, BASE_MATERIALS[slot].length - 1)]
    ].filter((v, i, arr) => arr.indexOf(v) === i);
    const junk = RANDOM_JUNK[randInt(0, RANDOM_JUNK.length - 1)];
    setFormState({ slot, tier, rarity, enchantment, materials: mats, junk, isCursed: Math.random() < 0.1 });
  };

  const clearAll = () => setFormState({ slot: 'weapon', tier: 1, rarity: 'common', enchantment: 'fire', materials: [], junk: '', isCursed: false });

  const forge = () => {

    console.log('[Crafting] FORGE request →', item);
    // handleCreateItem(itemDTO);
    handleSubmit();
    // TODO: replace with API call -> /api/crafting (once implemented)
    // closeModal();
  };

  if(craftedItem) {
    return <CraftedItemModal isOpen={true} item={craftedItem} closeModal={() => { setCraftedItem(null); closeModal(); }} />
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-auto mx-auto rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-yellow-300">Crafting</h3>
          <button className="text-gray-400 hover:text-white" onClick={closeModal}>✕</button>
        </div>

        {/* Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-400">Slot</label>
            {/* <select className="mt-1 w-full rounded-md bg-gray-800 ring-1 ring-gray-700 px-3 py-2" value={form.slot} onChange={e => onChange('slot', e.target.value)}>
              {SLOT_OPTIONS.map(s => <option key={s} value={s} className='text-white'>{titleCase(s)}</option>)}
            </select> */}
            <SelectInput
              name='slot'
              options={SLOT_OPTIONS}
              selectedValue={item?.slot}
              change={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-400">Tier</label>
            <SelectInput
              name='tier'
              options={TIER_OPTIONS}
              selectedValue={item?.tier}
              change={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-400">Rarity</label>
            <SelectInput
              name='rarity'
              options={RARITY_OPTIONS}
              selectedValue={item?.rarity}
              change={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wide text-gray-400">Enchantment</label>
            <SelectInput
              name='enchantment'
              options={ENCHANTMENTS}
              valueKey={'id'}
              displayKey={'label'}
              selectedValue={item?.enchantment}
              change={handleChange}
            />
          </div>
          <div className="flex items-end gap-2">
            <button className="px-3 py-2 rounded bg-gray-800 ring-1 ring-gray-700 text-gray-200" onClick={clearAll}>Reset</button>
            <button className="px-3 py-2 rounded bg-indigo-500/80 hover:bg-indigo-400 text-gray-900 font-semibold" onClick={randomize}>Randomize</button>
          </div>
        </div>

        {/* Materials & Junk */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-200">Base Materials</label>
              <span className="text-xs text-gray-400">{titleCase(item?.slot)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(BASE_MATERIALS[item?.slot] || []).map(mat => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => toggleMaterial(mat)}
                  className={classNames('px-2 py-1 rounded-md ring-1 text-sm',
                    item?.materials?.includes(mat)
                      ? 'bg-emerald-600/20 text-emerald-300 ring-emerald-600/40'
                      : 'bg-gray-800 text-gray-300 ring-gray-700 hover:bg-gray-700')}
                >{mat}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">Random Junk (for flavor)</label>
            <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-auto">
              {RANDOM_JUNK.map(j => (
                <button
                  key={j}
                  type="button"
                  // onClick={() => handleChange('junk', item?.junk === j ? '' : j)}
                  onClick={() => handleChange({ target: { name: 'junk', value: item?.junk === j ? '' : j }})}
                  className={classNames('px-2 py-1 rounded-md ring-1 text-sm',
                    item?.junk === j
                      ? 'bg-fuchsia-600/20 text-fuchsia-300 ring-fuchsia-600/40'
                      : 'bg-gray-800 text-gray-300 ring-gray-700 hover:bg-gray-700')}
                >{j}</button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input id="isCursed" type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-gray-800" checked={item?.isCursed} onChange={e => setFormState({ ...item, isCursed: e.target.checked })} />
              <label htmlFor="isCursed" className="text-sm text-rose-300">Cursed?</label>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-800/70 ring-1 ring-gray-700 p-4">
            <h4 className="text-sm font-semibold text-gray-200">Item Preview</h4>
            <div className="mt-2 text-sm">
              <div className="font-bold text-yellow-300">{item?.name}</div>
              <div className="text-gray-400">{titleCase(item?.slot)} • Tier {item?.tier} • {titleCase(item?.rarity)}</div>
              <div className="mt-2 text-gray-300">Base Value: <span className="text-yellow-300">{item?.baseValue}</span> gold</div>
              <ul className="mt-2 space-y-1 text-gray-200">
                {item?.affixes?.map((a, i) => (
                  <li key={i} className="flex justify-between"><span className="text-gray-400">{a.k}</span><span className="font-mono">+{a.v}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-lg bg-gray-800/70 ring-1 ring-gray-700 p-4">
            <h4 className="text-sm font-semibold text-gray-200">LLM Naming Prompt (preview)</h4>
            {/* <pre className="mt-2 max-h-56 overflow-auto text-xs text-gray-300">{JSON.stringify(preview.namingPrompt, null, 2)}</pre> */}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className="px-3 py-2 rounded bg-gray-800 ring-1 ring-gray-700 text-gray-200" onClick={closeModal}>Close</button>
          <button className="px-3 py-2 rounded bg-amber-400/90 hover:bg-amber-300 text-gray-900 font-semibold" onClick={forge}>Forge Item</button>
        </div>
      </div>
    </div>
  );
};

const CraftedItemModal = ({
  isOpen,
  item,
  closeModal
}) => {
  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-auto mx-auto rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-yellow-300">Crafting Complete!</h3>
          <button className="text-gray-400 hover:text-white" onClick={closeModal}>✕</button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-lg bg-gray-800/70 ring-1 ring-gray-700 p-4">
            <h4 className="text-sm font-semibold text-gray-200">New Item Created</h4>
            <div className="mt-2 text-sm">
              <div className="font-bold text-yellow-300">{item?.name}</div>
              <div className="text-gray-400">{titleCase(item?.slot)} • Tier {item?.tier} • {titleCase(item?.rarity)}</div>
              <div className="mt-2 text-gray-300">Base Value: <span className="text-yellow-300">{item?.baseValue}</span> gold</div>
              <ul className="mt-2 space-y-1 text-gray-200">
                {item?.affixes?.map((a, i) => (
                  <li key={i} className="flex justify-between"><span className="text-gray-400">{a.k}</span><span className="font-mono">+{a.v}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-lg bg-gray-800/70 ring-1 ring-gray-700 p-4">
            <h4 className="text-sm font-semibold text-gray-200">Description</h4>
            <p className="mt-2 text-sm text-gray-300 italic">{item?.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
