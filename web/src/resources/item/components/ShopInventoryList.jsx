import React from 'react';
import PropTypes from 'prop-types'
import WaitOn from '../../../global/components/helpers/WaitOn';
import ShopInventoryListItem from './ShopInventoryListItem';
import { useGetShopInventory } from '../itemService';


const ShopInventoryList = ({ shopId }) => {
  const { data: items, ...inventoryQuery } = useGetShopInventory(shopId);
  return (
    <div className="mt-4 rounded-lg bg-gray-900/40 ring-1 ring-gray-800/60 px-4 py-6 text-gray-400">
      <h3 className="mb-3 text-sm font-semibold text-yellow-300">Inventory</h3>
      <ul className="divide-y divide-gray-800/60 max-h-56 overflow-y-auto rounded-md">
        <WaitOn
          query={inventoryQuery}
          empty={(
            <li className="p-4 text-center text-gray-500">Empty</li>
          )}
        >
          {items?.map((it, idx) => <ShopInventoryListItem key={idx} item={it} />)}
        </WaitOn>
      </ul>
    </div>
  )
};

ShopInventoryList.propTypes = {
  shopId: PropTypes.string.isRequired,
};

export default ShopInventoryList;
