/**
 * View component for /crafting-sessions
 *
 * Generic craftingSession list view. Defaults to 'all' with:
 * const { data:  craftingSessions } = useGetCraftingSessionList({})
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
import CraftingSessionListItem from '../components/CraftingSessionListItem.jsx'
import CraftingSessionLayout from '../components/CraftingSessionLayout.jsx'

// import services
import { useGetCraftingSessionList } from '../craftingSessionService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const CraftingSessionList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: craftingSessions, ids, pagination, ...craftingSessionQuery } = useGetCraftingSessionList(queryArgs);

  return (
    <CraftingSessionLayout title={'CraftingSession List'}>
      <h1>CraftingSession List</h1>
      <Link to="/crafting-sessions/new">New CraftingSession</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${craftingSessionQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={craftingSessionQuery} fallback={<Skeleton count={pagination.per} />}>
          {craftingSessions?.map(craftingSession => <CraftingSessionListItem key={craftingSession._id} id={craftingSession._id} />)}
          {/* {ids?.map(craftingSessionId => <CraftingSessionListItem key={craftingSessionId} id={craftingSessionId} />)} */}
        </WaitOn>
      </PaginatedList>
    </CraftingSessionLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('crafting-session-list-item-skeleton');
  return items.map((name, index) => <CraftingSessionListItem.Skeleton key={`${name} ${index}`} />)
}


export default CraftingSessionList
