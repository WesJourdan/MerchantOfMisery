/**
 * View component for /enchantments/:enchantmentId
 *
 * Displays a single enchantment from the 'byId' map in the enchantment reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetEnchantmentById } from '../enchantmentService'

// import resource components
import EnchantmentLayout from '../components/EnchantmentLayout.jsx'

const SingleEnchantment = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the enchantment id from the url. Below is equivalent to const { enchantmentId } = this.props.match.params
  const { enchantmentId } = useParams()

  // get the enchantment from the store (or fetch it from the server)
  const { data: enchantment, ...enchantmentQuery } = useGetEnchantmentById(enchantmentId)

  return (
    <EnchantmentLayout title={'Single Enchantment'}>
      <WaitOn query={enchantmentQuery} fallback={<Skeleton />}>
        <div className={enchantmentQuery.isFetching ? "opacity-50" : ""}>
          <h2>Enchantment details</h2>
          <h1> {enchantment?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update Enchantment</Link>
    </EnchantmentLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>Enchantment details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> Enchantment Name </h1>
    </div>
  )
}
export default SingleEnchantment
