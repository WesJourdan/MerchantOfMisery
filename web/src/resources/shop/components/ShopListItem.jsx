

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// import global components

// import services
import { useShopFromMap } from '../shopService';

const ShopListItem = ({ id }) => {
  const shop = useShopFromMap(id);

  if(!shop) return <Skeleton />;
  return (
    <li className="list-none p-2 block">
      <Link to={`/${shop?._id}`}>{shop?.name}</Link>
    </li>
  )
}

// custom loading skeleton for this component, by defining it right here we can keep it synced with any changes we make to the actual component above
// Use placeholder text of the same length as the expected content to avoid layout shifting
const Skeleton = () => {
  return (
    <li className="animate-pulse list-none p-2 block cursor-default select-none">
      <p className='bg-gray-600 text-gray-600 w-fit' href="#"> Shop Name</p>
    </li>
  )
}
// add the skeleton to the component so we can access it in other components (ShopList in this case)
ShopListItem.Skeleton = Skeleton;

ShopListItem.propTypes = {
  id: PropTypes.string.isRequired
}

export default ShopListItem;