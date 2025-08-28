/**
 * View component for /contracts
 *
 * Generic contract list view. Defaults to 'all' with:
 * const { data:  contracts } = useGetContractList({})
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
import ContractListItem from '../components/ContractListItem.jsx'
import ContractLayout from '../components/ContractLayout.jsx'

// import services
import { useGetContractList } from '../contractService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const ContractList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: contracts, ids, pagination, ...contractQuery } = useGetContractList(queryArgs);

  return (
    <ContractLayout title={'Contract List'}>
      <h1>Contract List</h1>
      <Link to="/contracts/new">New Contract</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${contractQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={contractQuery} fallback={<Skeleton count={pagination.per} />}>
          {contracts?.map(contract => <ContractListItem key={contract._id} id={contract._id} />)}
          {/* {ids?.map(contractId => <ContractListItem key={contractId} id={contractId} />)} */}
        </WaitOn>
      </PaginatedList>
    </ContractLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('contract-list-item-skeleton');
  return items.map((name, index) => <ContractListItem.Skeleton key={`${name} ${index}`} />)
}


export default ContractList
