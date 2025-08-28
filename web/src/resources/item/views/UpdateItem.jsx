/**
 * View component for /items/:itemId/update
 *
 * Updates a single item from a copy of the item from the item store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ItemLayout from '../components/ItemLayout.jsx';
import ItemForm from '../components/ItemForm.jsx';

// import services
import { useGetUpdatableItem } from '../itemService';

const UpdateItem = () => {
  const history = useHistory();
  const location = useLocation();
  const { itemId } = useParams();
  const { data: item, handleChange, handleSubmit, isChanged, ...itemQuery } = useGetUpdatableItem(itemId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedItem, error) => {
      if(error || !updatedItem) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/items/${itemId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <ItemLayout title={'Update Item'}>
      <WaitOn query={itemQuery}>
        <ItemForm
          item={item}
          cancelLink={`/items/${itemId}`}
          disabled={itemQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ItemLayout>
  )
}

export default UpdateItem;
