/**
 * View component for /item-breakdowns/:itemBreakdownId/update
 *
 * Updates a single itemBreakdown from a copy of the itemBreakdown from the itemBreakdown store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ItemBreakdownLayout from '../components/ItemBreakdownLayout.jsx';
import ItemBreakdownForm from '../components/ItemBreakdownForm.jsx';

// import services
import { useGetUpdatableItemBreakdown } from '../itemBreakdownService';

const UpdateItemBreakdown = () => {
  const history = useHistory();
  const location = useLocation();
  const { itemBreakdownId } = useParams();
  const { data: itemBreakdown, handleChange, handleSubmit, isChanged, ...itemBreakdownQuery } = useGetUpdatableItemBreakdown(itemBreakdownId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedItemBreakdown, error) => {
      if(error || !updatedItemBreakdown) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/item-breakdowns/${itemBreakdownId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <ItemBreakdownLayout title={'Update ItemBreakdown'}>
      <WaitOn query={itemBreakdownQuery}>
        <ItemBreakdownForm
          itemBreakdown={itemBreakdown}
          cancelLink={`/item-breakdowns/${itemBreakdownId}`}
          disabled={itemBreakdownQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ItemBreakdownLayout>
  )
}

export default UpdateItemBreakdown;
