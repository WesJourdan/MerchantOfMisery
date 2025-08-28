import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { classNames } from '../../utils/filterUtils';

import DefaultLayout from '../layouts/DefaultLayout';
import ShopStatusCard from '../../../resources/shop/components/ShopStatusCard';
import ContractsCard from '../../../resources/contract/components/ContractsCard';
import HeroCard from '../../../resources/hero/components/HeroCard';
import ReportsCard from '../../../resources/report/components/ReportsCard';


/**
 * Placeholder resource objects (you'll wire these up later)
 */
const shop = {
  gold: 1250,
  reputation: 42,          // -100..100
  day: 7,
  priceStrategy: 'fair',   // greedy | fair | altruist
};

const shopInventory = [
  { name: 'Iron Sword', slot: 'Weapon', tier: 2, rarity: 'Common', stock: 5 },
  { name: 'Steel Shield', slot: 'Shield', tier: 3, rarity: 'Rare', stock: 2 },
  { name: 'Healing Potion', slot: 'Consumable', tier: 1, rarity: 'Uncommon', stock: 10 },
  { name: 'Magic Robe', slot: 'Armor', tier: 4, rarity: 'Epic', stock: 1 },
];

const heroes = [
  { name: 'Sir Roland', class: 'Knight', level: 8, status: 'Ready' },
  { name: 'Mira', class: 'Rogue', level: 6, status: 'Resting' },
  { name: 'Thalia', class: 'Cleric', level: 7, status: 'On Mission' },
];

const contracts = [
  { objective: 'Slay the Undead', dungeonTier: 3, baseRisk: 'Medium', etaDays: 2 },
  { objective: 'Escort Merchant', dungeonTier: 1, baseRisk: 'Low', etaDays: 1 },
  { objective: 'Retrieve Artifact', dungeonTier: 4, baseRisk: 'High', etaDays: 4 },
];

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

const Landing = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCrafting, setShowCrafting] = useState(false);

  const navTo = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main>
      <section className="w-full max-w-7xl mx-auto px-4 pb-40 md:pb-28 lg:pb-24 font-['Inter']">
        <Header shop={shop} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShopStatusCard shop={shop} inventory={shopInventory} />
          <HeroCard heroes={heroes} />
          <ContractsCard contracts={contracts} />
          <ReportsCard reports={reports} />
        </div>
        <BottomNav activeTab={activeTab} navTo={navTo} onOpenCrafting={() => setShowCrafting(true)} />
      </section>
      <CraftingModal isOpen={showCrafting} closeModal={() => setShowCrafting(false)} />
    </main>
  );
};

export default Landing;

const Header = ({
  shop
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
  closeModal
}) => {
  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
      <div className="relative z-10 w-full max-w-2xl mx-auto rounded-xl bg-gray-900 ring-1 ring-gray-800 shadow-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-yellow-300">Crafting (placeholder)</h3>
          <button className="text-gray-400 hover:text-white" onClick={closeModal}>✕</button>
        </div>
        <p className="mt-3 text-sm text-gray-300">We’ll wire the actual crafting form/modal next. For now, this confirms the bottom bar action.</p>
        <div className="mt-4 flex gap-3">
          <button className="px-3 py-2 rounded bg-gray-800 ring-1 ring-gray-700 text-gray-200" onClick={() => setShowCrafting(false)}>Close</button>
          <button className="px-3 py-2 rounded bg-indigo-500/80 hover:bg-indigo-400 text-gray-900 font-semibold">Go to Crafting Screen</button>
        </div>
      </div>
    </div>
  )
}