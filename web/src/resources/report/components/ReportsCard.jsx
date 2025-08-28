import React from "react";
import PropTypes from 'prop-types'
import { classNames } from "../../../global/utils/filterUtils";



const ReportsCard = ({ id = 'reports', reports }) => (
  <div id={id} className="scroll-mt-36  bg-gray-900/70 border border-gray-800/80 rounded-xl shadow-lg shadow-black/30 p-6">
    <h2 className="text-lg font-semibold mb-3 text-rose-300 tracking-wide">Reports</h2>
    <ul className="space-y-2">
      {reports.map((r, i) => {
        const tone = r.outcome === 'Success'
          ? 'bg-emerald-500/10 text-emerald-200 ring-emerald-700/30'
          : r.outcome === 'Failure'
          ? 'bg-rose-500/10 text-rose-200 ring-rose-700/30'
          : 'bg-amber-500/10 text-amber-200 ring-amber-700/30';
        return (
          <li key={i} className={classNames('rounded-lg ring-1 p-3', tone, 'ring-gray-800/50')}>
            <div className="font-semibold">{r.outcome}</div>
            <div className="text-xs mt-0.5 opacity-90">{r.summary}</div>
          </li>
        );
      })}
    </ul>
  </div>
);

ReportsCard.propTypes = {
  id: PropTypes.string,
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      outcome: PropTypes.string.isRequired,
      summary: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ReportsCard;
