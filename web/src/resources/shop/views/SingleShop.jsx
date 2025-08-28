/**
 * View component for /shops/:shopId
 *
 * Displays a single shop from the 'byId' map in the shop reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetShopById } from '../shopService'

// import resource components
import ShopLayout from '../components/ShopLayout.jsx'

const SingleShop = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the shop id from the url. Below is equivalent to const { shopId } = this.props.match.params
  const { shopId } = useParams()

  // get the shop from the store (or fetch it from the server)
  const { data: shop, ...shopQuery } = useGetShopById(shopId)

  return (
    <ShopLayout title={'Single Shop'}>
      <WaitOn query={shopQuery} fallback={<Skeleton />}>
        <div className={shopQuery.isFetching ? "opacity-50" : ""}>
          <h2>Shop details</h2>
          <h1> {shop?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update Shop</Link>
    </ShopLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>Shop details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> Shop Name </h1>
    </div>
  )
}
export default SingleShop
