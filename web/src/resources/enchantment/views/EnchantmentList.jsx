/**
 * View component for /enchantments
 *
 * Generic enchantment list view. Defaults to 'all' with:
 * const { data:  enchantments } = useGetEnchantmentList({})
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
import EnchantmentListItem from '../components/EnchantmentListItem.jsx'
import EnchantmentLayout from '../components/EnchantmentLayout.jsx'

// import services
import { useGetEnchantmentList } from '../enchantmentService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const EnchantmentList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: enchantments, ids, pagination, ...enchantmentQuery } = useGetEnchantmentList(queryArgs);

  return (
    <EnchantmentLayout title={'Enchantment List'}>
      <h1>Enchantment List</h1>
      <Link to="/enchantments/new">New Enchantment</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${enchantmentQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={enchantmentQuery} fallback={<Skeleton count={pagination.per} />}>
          {enchantments?.map(enchantment => <EnchantmentListItem key={enchantment._id} id={enchantment._id} />)}
          {/* {ids?.map(enchantmentId => <EnchantmentListItem key={enchantmentId} id={enchantmentId} />)} */}
        </WaitOn>
      </PaginatedList>
    </EnchantmentLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('enchantment-list-item-skeleton');
  return items.map((name, index) => <EnchantmentListItem.Skeleton key={`${name} ${index}`} />)
}


export default EnchantmentList
