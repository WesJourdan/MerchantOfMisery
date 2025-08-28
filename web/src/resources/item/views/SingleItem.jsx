/**
 * View component for /items/:itemId
 *
 * Displays a single item from the 'byId' map in the item reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetItemById } from '../itemService'

// import resource components
import ItemLayout from '../components/ItemLayout.jsx'

const SingleItem = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the item id from the url. Below is equivalent to const { itemId } = this.props.match.params
  const { itemId } = useParams()

  // get the item from the store (or fetch it from the server)
  const { data: item, ...itemQuery } = useGetItemById(itemId)

  return (
    <ItemLayout title={'Single Item'}>
      <WaitOn query={itemQuery} fallback={<Skeleton />}>
        <div className={itemQuery.isFetching ? "opacity-50" : ""}>
          <h2>Item details</h2>
          <h1> {item?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update Item</Link>
    </ItemLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>Item details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> Item Name </h1>
    </div>
  )
}
export default SingleItem
