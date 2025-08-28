/**
 * View component for /contracts/new
 *
 * Creates a new contract from a copy of the defaultItem in the contract store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ContractForm from '../components/ContractForm.jsx';
import ContractLayout from '../components/ContractLayout.jsx';

// import services
import { useCreateContract } from '../contractService';

const CreateContract = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: contract, handleChange, handleSubmit, isChanged, ...contractQuery } = useCreateContract({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new contract
    , onResponse: (newContract, error) => {
      if(error || !newContract) {
        alert(error || 'An error occurred.')
        history.replace('/contracts', location.state);
      } else {
        history.replace(`/contracts/${newContract._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <ContractLayout title={'New Contract'}>
      <WaitOn query={contractQuery}>
        <ContractForm
          contract={contract}
          cancelLink='/contracts'
          disabled={contractQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ContractLayout>
  )
}

export default CreateContract;
