/**
 * View component for /item-breakdowns/new
 *
 * Creates a new itemBreakdown from a copy of the defaultItem in the itemBreakdown store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ItemBreakdownForm from '../components/ItemBreakdownForm.jsx';
import ItemBreakdownLayout from '../components/ItemBreakdownLayout.jsx';

// import services
import { useCreateItemBreakdown } from '../itemBreakdownService';

const CreateItemBreakdown = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: itemBreakdown, handleChange, handleSubmit, isChanged, ...itemBreakdownQuery } = useCreateItemBreakdown({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new itemBreakdown
    , onResponse: (newItemBreakdown, error) => {
      if(error || !newItemBreakdown) {
        alert(error || 'An error occurred.')
        history.replace('/item-breakdowns', location.state);
      } else {
        history.replace(`/item-breakdowns/${newItemBreakdown._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <ItemBreakdownLayout title={'New ItemBreakdown'}>
      <WaitOn query={itemBreakdownQuery}>
        <ItemBreakdownForm
          itemBreakdown={itemBreakdown}
          cancelLink='/item-breakdowns'
          disabled={itemBreakdownQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ItemBreakdownLayout>
  )
}

export default CreateItemBreakdown;
