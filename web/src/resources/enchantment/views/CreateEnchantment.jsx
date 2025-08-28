/**
 * View component for /enchantments/new
 *
 * Creates a new enchantment from a copy of the defaultItem in the enchantment store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import EnchantmentForm from '../components/EnchantmentForm.jsx';
import EnchantmentLayout from '../components/EnchantmentLayout.jsx';

// import services
import { useCreateEnchantment } from '../enchantmentService';

const CreateEnchantment = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: enchantment, handleChange, handleSubmit, isChanged, ...enchantmentQuery } = useCreateEnchantment({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new enchantment
    , onResponse: (newEnchantment, error) => {
      if(error || !newEnchantment) {
        alert(error || 'An error occurred.')
        history.replace('/enchantments', location.state);
      } else {
        history.replace(`/enchantments/${newEnchantment._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <EnchantmentLayout title={'New Enchantment'}>
      <WaitOn query={enchantmentQuery}>
        <EnchantmentForm
          enchantment={enchantment}
          cancelLink='/enchantments'
          disabled={enchantmentQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </EnchantmentLayout>
  )
}

export default CreateEnchantment;
