import React from "react";
import PropTypes from 'prop-types'
import ShopInventoryList from "../../item/components/ShopInventoryList";
import { classNames } from "../../../global/utils/filterUtils";
import { useGetShopById } from "../shopService";
import { useGetShopInventory } from "../../item/itemService";



const repPercent = (rep) => {
  // convert -100..100 to 0..100
  const pct = Math.max(0, Math.min(100, Math.round(((rep + 100) / 200) * 100)));
  return pct;
};


const ShopStatusCard = ({ id = 'shop', shopId }) => {

  const { data: shop, ...shopQuery } = useGetShopById(shopId);

  return (<div id={id} className="scroll-mt-36  bg-gray-900/70 border border-gray-800/80 rounded-xl shadow-lg shadow-black/30 p-6">
    <h2 className="text-lg font-semibold mb-4 text-yellow-300 tracking-wide">Shop</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg bg-gray-800/70 ring-1 ring-gray-700 p-4">
        <div className="text-sm text-gray-400">Gold</div>
        <div className="mt-1 text-2xl font-bold text-yellow-300">{shop?.gold.toLocaleString()}</div>
      </div>
      <div className="rounded-lg bg-gray-800/70 ring-1 ring-gray-700 p-4">
        <div className="text-sm text-gray-400">Reputation</div>
        <div className="mt-2 h-3 w-full rounded-full bg-gray-700 overflow-hidden">
          <div className={classNames('h-3 rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400')} style={{ width: repPercent(shop?.reputation) + '%' }} />
        </div>
        <div className="mt-1 text-xs text-gray-400">{repPercent(shop?.reputation)}%</div>
      </div>
    </div>
    <ShopInventoryList shopId={shopId} />
  </div>)
};

ShopStatusCard.propTypes = {
  id: PropTypes.string,
  shopId: PropTypes.string.isRequired,
};

export default ShopStatusCard;