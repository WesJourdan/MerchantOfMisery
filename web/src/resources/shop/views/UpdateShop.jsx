/**
 * View component for /shops/:shopId/update
 *
 * Updates a single shop from a copy of the shop from the shop store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ShopLayout from '../components/ShopLayout.jsx';
import ShopForm from '../components/ShopForm.jsx';

// import services
import { useGetUpdatableShop } from '../shopService';

const UpdateShop = () => {
  const history = useHistory();
  const location = useLocation();
  const { shopId } = useParams();
  const { data: shop, handleChange, handleSubmit, isChanged, ...shopQuery } = useGetUpdatableShop(shopId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedShop, error) => {
      if(error || !updatedShop) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/shops/${shopId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <ShopLayout title={'Update Shop'}>
      <WaitOn query={shopQuery}>
        <ShopForm
          shop={shop}
          cancelLink={`/shops/${shopId}`}
          disabled={shopQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ShopLayout>
  )
}

export default UpdateShop;
