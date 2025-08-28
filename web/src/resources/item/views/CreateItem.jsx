/**
 * View component for /items/new
 *
 * Creates a new item from a copy of the defaultItem in the item store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ItemForm from '../components/ItemForm.jsx';
import ItemLayout from '../components/ItemLayout.jsx';

// import services
import { useCreateItem } from '../itemService';

const CreateItem = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: item, handleChange, handleSubmit, isChanged, ...itemQuery } = useCreateItem({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new item
    , onResponse: (newItem, error) => {
      if(error || !newItem) {
        alert(error || 'An error occurred.')
        history.replace('/items', location.state);
      } else {
        history.replace(`/items/${newItem._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <ItemLayout title={'New Item'}>
      <WaitOn query={itemQuery}>
        <ItemForm
          item={item}
          cancelLink='/items'
          disabled={itemQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ItemLayout>
  )
}

export default CreateItem;
