/**
 * View component for /shops/new
 *
 * Creates a new shop from a copy of the defaultItem in the shop store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ShopForm from '../components/ShopForm.jsx';
import ShopLayout from '../components/ShopLayout.jsx';

// import services
import { useCreateShop } from '../shopService';

const CreateShop = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: shop, handleChange, handleSubmit, isChanged, ...shopQuery } = useCreateShop({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new shop
    , onResponse: (newShop, error) => {
      if(error || !newShop) {
        alert(error || 'An error occurred.')
        history.replace('/', location.state);
      } else {
        history.replace(`/${newShop._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <ShopLayout title={'New Shop'}>
      <WaitOn query={shopQuery}>
        <ShopForm
          shop={shop}
          cancelLink='/shops'
          disabled={shopQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ShopLayout>
  )
}

export default CreateShop;
