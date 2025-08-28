/**
 * View component for /recipes/:recipeId/update
 *
 * Updates a single recipe from a copy of the recipe from the recipe store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import RecipeLayout from '../components/RecipeLayout.jsx';
import RecipeForm from '../components/RecipeForm.jsx';

// import services
import { useGetUpdatableRecipe } from '../recipeService';

const UpdateRecipe = () => {
  const history = useHistory();
  const location = useLocation();
  const { recipeId } = useParams();
  const { data: recipe, handleChange, handleSubmit, isChanged, ...recipeQuery } = useGetUpdatableRecipe(recipeId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedRecipe, error) => {
      if(error || !updatedRecipe) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/recipes/${recipeId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <RecipeLayout title={'Update Recipe'}>
      <WaitOn query={recipeQuery}>
        <RecipeForm
          recipe={recipe}
          cancelLink={`/recipes/${recipeId}`}
          disabled={recipeQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </RecipeLayout>
  )
}

export default UpdateRecipe;
