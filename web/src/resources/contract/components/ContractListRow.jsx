import React from "react";
import PropTypes from 'prop-types'

import { classNames } from "../../../global/utils/filterUtils";


const riskColor = (risk) => {
  if(risk === 'Low') return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-600/30';
  if(risk === 'Medium') return 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-600/30';
  return 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-600/30';
};

const RiskPill = ({ level }) => (
  <span className={classNames('text-xs px-2 py-0.5 rounded-full', riskColor(level))}>{level} Risk</span>
);

const ContractListRow = ({ contract }) => {
  return (
    <li className="group bg-gray-900/40 hover:bg-gray-900/60 transition p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-gray-100 flex-1">{contract.objective}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 ring-1 ring-gray-600">Tier {contract.dungeonTier}</span>
        <RiskPill level={contract.baseRisk} />
        <span className="text-xs text-gray-400 ml-auto">{contract.etaDays} days</span>
      </div>
    </li>
  );
}

ContractListRow.propTypes = {
  contract: PropTypes.shape({
    objective: PropTypes.string.isRequired,
    dungeonTier: PropTypes.number.isRequired,
    baseRisk: PropTypes.number.isRequired,
    etaDays: PropTypes.number.isRequired,
  }).isRequired,
};

export default ContractListRow;