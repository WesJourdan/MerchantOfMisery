/**
 * View component for /contract-runs/new
 *
 * Creates a new contractRun from a copy of the defaultItem in the contractRun store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ContractRunForm from '../components/ContractRunForm.jsx';
import ContractRunLayout from '../components/ContractRunLayout.jsx';

// import services
import { useCreateContractRun } from '../contractRunService';

const CreateContractRun = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: contractRun, handleChange, handleSubmit, isChanged, ...contractRunQuery } = useCreateContractRun({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new contractRun
    , onResponse: (newContractRun, error) => {
      if(error || !newContractRun) {
        alert(error || 'An error occurred.')
        history.replace('/contract-runs', location.state);
      } else {
        history.replace(`/contract-runs/${newContractRun._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <ContractRunLayout title={'New ContractRun'}>
      <WaitOn query={contractRunQuery}>
        <ContractRunForm
          contractRun={contractRun}
          cancelLink='/contract-runs'
          disabled={contractRunQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ContractRunLayout>
  )
}

export default CreateContractRun;
