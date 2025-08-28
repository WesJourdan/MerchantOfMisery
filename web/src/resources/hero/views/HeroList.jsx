/**
 * View component for /heroes
 *
 * Generic hero list view. Defaults to 'all' with:
 * const { data:  heroes } = useGetHeroList({})
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
import HeroListItem from '../components/HeroListItem.jsx'
import HeroLayout from '../components/HeroLayout.jsx'

// import services
import { useGetHeroList } from '../heroService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const HeroList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: heroes, ids, pagination, ...heroQuery } = useGetHeroList(queryArgs);

  return (
    <HeroLayout title={'Hero List'}>
      <h1>Hero List</h1>
      <Link to="/heroes/new">New Hero</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${heroQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={heroQuery} fallback={<Skeleton count={pagination.per} />}>
          {heroes?.map(hero => <HeroListItem key={hero._id} id={hero._id} />)}
          {/* {ids?.map(heroId => <HeroListItem key={heroId} id={heroId} />)} */}
        </WaitOn>
      </PaginatedList>
    </HeroLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('hero-list-item-skeleton');
  return items.map((name, index) => <HeroListItem.Skeleton key={`${name} ${index}`} />)
}


export default HeroList
