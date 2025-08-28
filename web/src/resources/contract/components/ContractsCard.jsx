import React from "react";
import PropTypes from 'prop-types'
import ContractListRow from "./ContractListRow";
import { useGetContractList } from '../contractService'
import WaitOn from "../../../global/components/helpers/WaitOn";

const ContractsCard = ({ id = 'contracts', shopId }) => {

  const { data: contracts, ...contractsQuery } = useGetContractList({ _shop: shopId });
  return (
    <div id={id} className="scroll-mt-36  bg-gray-900/70 border border-gray-800/80 rounded-xl shadow-lg shadow-black/30 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-blue-300 tracking-wide">Contracts</h2>
        {/* <button className="text-xs px-2 py-1 rounded bg-gray-800 ring-1 ring-gray-700 text-gray-300 hover:bg-gray-700">Generate</button> */}
      </div>
      <ul className="divide-y divide-gray-800/60 rounded-lg overflow-hidden ring-1 ring-gray-800/50 bg-gray-800/30">
        <WaitOn query={contractsQuery}>
          {contracts?.map((c, i) => <ContractListRow key={i} contract={c} />)}
        </WaitOn>
      </ul>
    </div>
  );
}
ContractsCard.propTypes = {
  id: PropTypes.string,
  shopId: PropTypes.string.isRequired,
};

export default ContractsCard;