import React from "react";
import PropTypes from 'prop-types'
import { classNames } from "../../../global/utils/filterUtils";


const rarityColor = (rarity) => {
  switch(rarity) {
    case 'Common': return 'bg-gray-700 text-gray-300 ring-gray-600';
    case 'Uncommon': return 'bg-green-700 text-green-300 ring-green-600';
    case 'Rare': return 'bg-blue-700 text-blue-300 ring-blue-600';
    case 'Epic': return 'bg-purple-700 text-purple-300 ring-purple-600';
    case 'Legendary': return 'bg-yellow-700 text-yellow-300 ring-yellow-600';
    default: return 'bg-gray-700 text-gray-300 ring-gray-600';
  }
};

const RarityPill = ({ rarity }) => (
  <span className={classNames('text-xs px-2 py-0.5 rounded-full ring-1 font-semibold', rarityColor(rarity))}>{rarity}</span>
);

const ShopInventoryListItem = ({ item }) => {
  return (
    <li className="flex items-center justify-between p-2 bg-transparent">
      <div className="flex flex-col">
        <span className="font-semibold text-gray-100">{item.name}</span>
        <span className="text-xs text-gray-400">{item.slot} - Tier {item.tier}</span>
      </div>
      <div className="flex items-center gap-2">
        <RarityPill rarity={item.rarity} />
        <span className="text-xs text-gray-400">x{item.stock}</span>
      </div>
    </li>
  )

}

ShopInventoryListItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slot: PropTypes.string.isRequired,
    tier: PropTypes.number.isRequired,
    rarity: PropTypes.string.isRequired,
    stock: PropTypes.number.isRequired,
  }).isRequired,
};

export default ShopInventoryListItem;