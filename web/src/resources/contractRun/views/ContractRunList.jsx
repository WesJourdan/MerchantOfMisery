/**
 * View component for /contract-runs
 *
 * Generic contractRun list view. Defaults to 'all' with:
 * const { data:  contractRuns } = useGetContractRunList({})
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
import ContractRunListItem from '../components/ContractRunListItem.jsx'
import ContractRunLayout from '../components/ContractRunLayout.jsx'

// import services
import { useGetContractRunList } from '../contractRunService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const ContractRunList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: contractRuns, ids, pagination, ...contractRunQuery } = useGetContractRunList(queryArgs);

  return (
    <ContractRunLayout title={'ContractRun List'}>
      <h1>ContractRun List</h1>
      <Link to="/contract-runs/new">New ContractRun</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${contractRunQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={contractRunQuery} fallback={<Skeleton count={pagination.per} />}>
          {contractRuns?.map(contractRun => <ContractRunListItem key={contractRun._id} id={contractRun._id} />)}
          {/* {ids?.map(contractRunId => <ContractRunListItem key={contractRunId} id={contractRunId} />)} */}
        </WaitOn>
      </PaginatedList>
    </ContractRunLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('contract-run-list-item-skeleton');
  return items.map((name, index) => <ContractRunListItem.Skeleton key={`${name} ${index}`} />)
}


export default ContractRunList
