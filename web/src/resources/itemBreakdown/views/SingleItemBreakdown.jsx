/**
 * View component for /item-breakdowns/:itemBreakdownId
 *
 * Displays a single itemBreakdown from the 'byId' map in the itemBreakdown reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetItemBreakdownById } from '../itemBreakdownService'

// import resource components
import ItemBreakdownLayout from '../components/ItemBreakdownLayout.jsx'

const SingleItemBreakdown = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the itemBreakdown id from the url. Below is equivalent to const { itemBreakdownId } = this.props.match.params
  const { itemBreakdownId } = useParams()

  // get the itemBreakdown from the store (or fetch it from the server)
  const { data: itemBreakdown, ...itemBreakdownQuery } = useGetItemBreakdownById(itemBreakdownId)

  return (
    <ItemBreakdownLayout title={'Single ItemBreakdown'}>
      <WaitOn query={itemBreakdownQuery} fallback={<Skeleton />}>
        <div className={itemBreakdownQuery.isFetching ? "opacity-50" : ""}>
          <h2>ItemBreakdown details</h2>
          <h1> {itemBreakdown?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update ItemBreakdown</Link>
    </ItemBreakdownLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>ItemBreakdown details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> ItemBreakdown Name </h1>
    </div>
  )
}
export default SingleItemBreakdown
