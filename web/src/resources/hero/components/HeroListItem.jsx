

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// import global components

// import services
import { useHeroFromMap } from '../heroService';

const HeroListItem = ({ id }) => {
  const hero = useHeroFromMap(id);

  if(!hero) return <Skeleton />;
  return (
    <li className="list-none p-2 block">
      <Link to={`/heroes/${hero?._id}`}>{hero?.name}</Link>
    </li>
  )
}

// custom loading skeleton for this component, by defining it right here we can keep it synced with any changes we make to the actual component above
// Use placeholder text of the same length as the expected content to avoid layout shifting
const Skeleton = () => {
  return (
    <li className="animate-pulse list-none p-2 block cursor-default select-none">
      <p className='bg-gray-600 text-gray-600 w-fit' href="#"> Hero Name</p>
    </li>
  )
}
// add the skeleton to the component so we can access it in other components (HeroList in this case)
HeroListItem.Skeleton = Skeleton;

HeroListItem.propTypes = {
  id: PropTypes.string.isRequired
}

export default HeroListItem;