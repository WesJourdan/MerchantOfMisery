/**
 * View component for /enchantments/:enchantmentId/update
 *
 * Updates a single enchantment from a copy of the enchantment from the enchantment store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import EnchantmentLayout from '../components/EnchantmentLayout.jsx';
import EnchantmentForm from '../components/EnchantmentForm.jsx';

// import services
import { useGetUpdatableEnchantment } from '../enchantmentService';

const UpdateEnchantment = () => {
  const history = useHistory();
  const location = useLocation();
  const { enchantmentId } = useParams();
  const { data: enchantment, handleChange, handleSubmit, isChanged, ...enchantmentQuery } = useGetUpdatableEnchantment(enchantmentId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedEnchantment, error) => {
      if(error || !updatedEnchantment) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/enchantments/${enchantmentId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <EnchantmentLayout title={'Update Enchantment'}>
      <WaitOn query={enchantmentQuery}>
        <EnchantmentForm
          enchantment={enchantment}
          cancelLink={`/enchantments/${enchantmentId}`}
          disabled={enchantmentQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </EnchantmentLayout>
  )
}

export default UpdateEnchantment;
