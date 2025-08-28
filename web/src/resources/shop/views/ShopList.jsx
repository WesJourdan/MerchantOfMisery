/**
 * View component for /shops
 *
 * Generic shop list view. Defaults to 'all' with:
 * const { data:  shops } = useGetShopList({})
 *
 */
// import primary libraries
import React from 'react'
import { Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import PaginatedList from '../../../global/components/base/PaginatedList';
import WaitOn from '../../../global/components/helpers/WaitOn'

// import resource components
import ShopListItem from '../components/ShopListItem.jsx'
import ShopLayout from '../components/ShopLayout.jsx'

// import services
import { useGetShopList } from '../shopService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const ShopList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: shops, ids, pagination, ...shopQuery } = useGetShopList(queryArgs);

  return (
    <ShopLayout title={'Shop List'} className={'bg-gray-400'}>
      <h1>Shop List</h1>
      <Link to="/shops/new">New Shop</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${shopQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={shopQuery} fallback={<Skeleton count={pagination.per} />}>
          {shops?.map(shop => <ShopListItem key={shop?._id} id={shop?._id} />)}
          {/* {ids?.map(shopId => <ShopListItem key={shopId} id={shopId} />)} */}
        </WaitOn>
      </PaginatedList>
    </ShopLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('shop-list-item-skeleton');
  return items.map((name, index) => <ShopListItem.Skeleton key={`${name} ${index}`} />)
}


export default ShopList
