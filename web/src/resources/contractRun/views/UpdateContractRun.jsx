/**
 * View component for /contract-runs/:contractRunId/update
 *
 * Updates a single contractRun from a copy of the contractRun from the contractRun store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ContractRunLayout from '../components/ContractRunLayout.jsx';
import ContractRunForm from '../components/ContractRunForm.jsx';

// import services
import { useGetUpdatableContractRun } from '../contractRunService';

const UpdateContractRun = () => {
  const history = useHistory();
  const location = useLocation();
  const { contractRunId } = useParams();
  const { data: contractRun, handleChange, handleSubmit, isChanged, ...contractRunQuery } = useGetUpdatableContractRun(contractRunId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedContractRun, error) => {
      if(error || !updatedContractRun) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/contract-runs/${contractRunId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <ContractRunLayout title={'Update ContractRun'}>
      <WaitOn query={contractRunQuery}>
        <ContractRunForm
          contractRun={contractRun}
          cancelLink={`/contract-runs/${contractRunId}`}
          disabled={contractRunQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ContractRunLayout>
  )
}

export default UpdateContractRun;
