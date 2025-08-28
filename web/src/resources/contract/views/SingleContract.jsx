/**
 * View component for /contracts/:contractId
 *
 * Displays a single contract from the 'byId' map in the contract reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetContractById } from '../contractService'

// import resource components
import ContractLayout from '../components/ContractLayout.jsx'

const SingleContract = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the contract id from the url. Below is equivalent to const { contractId } = this.props.match.params
  const { contractId } = useParams()

  // get the contract from the store (or fetch it from the server)
  const { data: contract, ...contractQuery } = useGetContractById(contractId)

  return (
    <ContractLayout title={'Single Contract'}>
      <WaitOn query={contractQuery} fallback={<Skeleton />}>
        <div className={contractQuery.isFetching ? "opacity-50" : ""}>
          <h2>Contract details</h2>
          <h1> {contract?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update Contract</Link>
    </ContractLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>Contract details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> Contract Name </h1>
    </div>
  )
}
export default SingleContract
