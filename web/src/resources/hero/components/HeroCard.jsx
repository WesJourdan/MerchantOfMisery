import React from "react";
import PropTypes from 'prop-types'
import HeroListTile from "./HeroListTile";

const HeroCard = ({ id = 'heroes', heroes }) => (
  <div id={id} className="scroll-mt-36  bg-gray-900/70 border border-gray-800/80 rounded-xl shadow-lg shadow-black/30 p-6">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-green-300 tracking-wide">Heroes</h2>
      <button className="text-xs px-2 py-1 rounded bg-gray-800 ring-1 ring-gray-700 text-gray-300 hover:bg-gray-700">View All</button>
    </div>
    <ul className="divide-y divide-gray-800/60 rounded-lg overflow-hidden ring-1 ring-gray-800/50 bg-gray-800/30">
      {heroes.map((h, i) => <HeroListTile key={i} hero={h} />)}
    </ul>
  </div>
);

HeroCard.propTypes = {
  id: PropTypes.string,
  heroes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default HeroCard;
