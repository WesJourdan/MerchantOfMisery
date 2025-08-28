/**
 * View component for /ingredients/new
 *
 * Creates a new ingredient from a copy of the defaultItem in the ingredient store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import IngredientForm from '../components/IngredientForm.jsx';
import IngredientLayout from '../components/IngredientLayout.jsx';

// import services
import { useCreateIngredient } from '../ingredientService';

const CreateIngredient = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: ingredient, handleChange, handleSubmit, isChanged, ...ingredientQuery } = useCreateIngredient({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new ingredient
    , onResponse: (newIngredient, error) => {
      if(error || !newIngredient) {
        alert(error || 'An error occurred.')
        history.replace('/ingredients', location.state);
      } else {
        history.replace(`/ingredients/${newIngredient._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <IngredientLayout title={'New Ingredient'}>
      <WaitOn query={ingredientQuery}>
        <IngredientForm
          ingredient={ingredient}
          cancelLink='/ingredients'
          disabled={ingredientQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </IngredientLayout>
  )
}

export default CreateIngredient;
