/**
 * View component for /item-breakdowns
 *
 * Generic itemBreakdown list view. Defaults to 'all' with:
 * const { data:  itemBreakdowns } = useGetItemBreakdownList({})
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
import ItemBreakdownListItem from '../components/ItemBreakdownListItem.jsx'
import ItemBreakdownLayout from '../components/ItemBreakdownLayout.jsx'

// import services
import { useGetItemBreakdownList } from '../itemBreakdownService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const ItemBreakdownList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: itemBreakdowns, ids, pagination, ...itemBreakdownQuery } = useGetItemBreakdownList(queryArgs);

  return (
    <ItemBreakdownLayout title={'ItemBreakdown List'}>
      <h1>ItemBreakdown List</h1>
      <Link to="/item-breakdowns/new">New ItemBreakdown</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${itemBreakdownQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={itemBreakdownQuery} fallback={<Skeleton count={pagination.per} />}>
          {itemBreakdowns?.map(itemBreakdown => <ItemBreakdownListItem key={itemBreakdown._id} id={itemBreakdown._id} />)}
          {/* {ids?.map(itemBreakdownId => <ItemBreakdownListItem key={itemBreakdownId} id={itemBreakdownId} />)} */}
        </WaitOn>
      </PaginatedList>
    </ItemBreakdownLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('item-breakdown-list-item-skeleton');
  return items.map((name, index) => <ItemBreakdownListItem.Skeleton key={`${name} ${index}`} />)
}


export default ItemBreakdownList
