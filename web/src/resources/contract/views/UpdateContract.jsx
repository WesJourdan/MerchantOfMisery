/**
 * View component for /contracts/:contractId/update
 *
 * Updates a single contract from a copy of the contract from the contract store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ContractLayout from '../components/ContractLayout.jsx';
import ContractForm from '../components/ContractForm.jsx';

// import services
import { useGetUpdatableContract } from '../contractService';

const UpdateContract = () => {
  const history = useHistory();
  const location = useLocation();
  const { contractId } = useParams();
  const { data: contract, handleChange, handleSubmit, isChanged, ...contractQuery } = useGetUpdatableContract(contractId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedContract, error) => {
      if(error || !updatedContract) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/contracts/${contractId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <ContractLayout title={'Update Contract'}>
      <WaitOn query={contractQuery}>
        <ContractForm
          contract={contract}
          cancelLink={`/contracts/${contractId}`}
          disabled={contractQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ContractLayout>
  )
}

export default UpdateContract;
