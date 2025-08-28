/**
 * View component for /ingredients/:ingredientId/update
 *
 * Updates a single ingredient from a copy of the ingredient from the ingredient store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import IngredientLayout from '../components/IngredientLayout.jsx';
import IngredientForm from '../components/IngredientForm.jsx';

// import services
import { useGetUpdatableIngredient } from '../ingredientService';

const UpdateIngredient = () => {
  const history = useHistory();
  const location = useLocation();
  const { ingredientId } = useParams();
  const { data: ingredient, handleChange, handleSubmit, isChanged, ...ingredientQuery } = useGetUpdatableIngredient(ingredientId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedIngredient, error) => {
      if(error || !updatedIngredient) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/ingredients/${ingredientId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <IngredientLayout title={'Update Ingredient'}>
      <WaitOn query={ingredientQuery}>
        <IngredientForm
          ingredient={ingredient}
          cancelLink={`/ingredients/${ingredientId}`}
          disabled={ingredientQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </IngredientLayout>
  )
}

export default UpdateIngredient;
