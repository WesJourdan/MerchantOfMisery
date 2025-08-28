/**
 * View component for /contract-runs/:contractRunId
 *
 * Displays a single contractRun from the 'byId' map in the contractRun reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetContractRunById } from '../contractRunService'

// import resource components
import ContractRunLayout from '../components/ContractRunLayout.jsx'

const SingleContractRun = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the contractRun id from the url. Below is equivalent to const { contractRunId } = this.props.match.params
  const { contractRunId } = useParams()

  // get the contractRun from the store (or fetch it from the server)
  const { data: contractRun, ...contractRunQuery } = useGetContractRunById(contractRunId)

  return (
    <ContractRunLayout title={'Single ContractRun'}>
      <WaitOn query={contractRunQuery} fallback={<Skeleton />}>
        <div className={contractRunQuery.isFetching ? "opacity-50" : ""}>
          <h2>ContractRun details</h2>
          <h1> {contractRun?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update ContractRun</Link>
    </ContractRunLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>ContractRun details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> ContractRun Name </h1>
    </div>
  )
}
export default SingleContractRun
