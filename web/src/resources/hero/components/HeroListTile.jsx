import React from 'react';
import PropTypes from 'prop-types'

import { classNames } from "../../../global/utils/filterUtils";


const statusColor = (status) => {
  switch (status) {
    case 'Ready': return 'text-emerald-300';
    case 'Resting': return 'text-amber-300';
    case 'On Mission': return 'text-yellow-300';
    default: return 'text-gray-300';
  }
};


const Avatar = ({ name }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-100 text-xs font-semibold">
      {initials}
    </div>
  );
};

const HeroListTile = ({ hero }) => (
  <li className="group bg-gray-900/40 hover:bg-gray-900/60 transition p-3">
    <div className="flex items-center gap-3">
      <Avatar name={hero.name} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-100">{hero.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-600/30">{hero.class}</span>
        </div>
        <div className="mt-0.5 text-xs text-gray-400">Lv. {hero.level}</div>
      </div>
      <span className={classNames('text-xs font-medium', statusColor(hero.status))}>{hero.status}</span>
    </div>
  </li>
);

HeroListTile.propTypes = {
  hero: PropTypes.shape({
    name: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

export default HeroListTile;