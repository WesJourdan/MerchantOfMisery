/**
 * View component for /items
 *
 * Generic item list view. Defaults to 'all' with:
 * const { data:  items } = useGetItemList({})
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
import ItemListItem from '../components/ItemListItem.jsx'
import ItemLayout from '../components/ItemLayout.jsx'

// import services
import { useGetItemList } from '../itemService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const ItemList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: items, ids, pagination, ...itemQuery } = useGetItemList(queryArgs);

  return (
    <ItemLayout title={'Item List'}>
      <h1>Item List</h1>
      <Link to="/items/new">New Item</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${itemQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={itemQuery} fallback={<Skeleton count={pagination.per} />}>
          {items?.map(item => <ItemListItem key={item._id} id={item._id} />)}
          {/* {ids?.map(itemId => <ItemListItem key={itemId} id={itemId} />)} */}
        </WaitOn>
      </PaginatedList>
    </ItemLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('item-list-item-skeleton');
  return items.map((name, index) => <ItemListItem.Skeleton key={`${name} ${index}`} />)
}


export default ItemList
