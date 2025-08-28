/**
 * View component for /crafting-sessions/:craftingSessionId
 *
 * Displays a single craftingSession from the 'byId' map in the craftingSession reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetCraftingSessionById } from '../craftingSessionService'

// import resource components
import CraftingSessionLayout from '../components/CraftingSessionLayout.jsx'

const SingleCraftingSession = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the craftingSession id from the url. Below is equivalent to const { craftingSessionId } = this.props.match.params
  const { craftingSessionId } = useParams()

  // get the craftingSession from the store (or fetch it from the server)
  const { data: craftingSession, ...craftingSessionQuery } = useGetCraftingSessionById(craftingSessionId)

  return (
    <CraftingSessionLayout title={'Single CraftingSession'}>
      <WaitOn query={craftingSessionQuery} fallback={<Skeleton />}>
        <div className={craftingSessionQuery.isFetching ? "opacity-50" : ""}>
          <h2>CraftingSession details</h2>
          <h1> {craftingSession?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update CraftingSession</Link>
    </CraftingSessionLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>CraftingSession details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> CraftingSession Name </h1>
    </div>
  )
}
export default SingleCraftingSession
