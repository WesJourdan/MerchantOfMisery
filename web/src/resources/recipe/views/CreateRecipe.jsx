/**
 * View component for /recipes/new
 *
 * Creates a new recipe from a copy of the defaultItem in the recipe store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import RecipeForm from '../components/RecipeForm.jsx';
import RecipeLayout from '../components/RecipeLayout.jsx';

// import services
import { useCreateRecipe } from '../recipeService';

const CreateRecipe = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: recipe, handleChange, handleSubmit, isChanged, ...recipeQuery } = useCreateRecipe({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new recipe
    , onResponse: (newRecipe, error) => {
      if(error || !newRecipe) {
        alert(error || 'An error occurred.')
        history.replace('/recipes', location.state);
      } else {
        history.replace(`/recipes/${newRecipe._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <RecipeLayout title={'New Recipe'}>
      <WaitOn query={recipeQuery}>
        <RecipeForm
          recipe={recipe}
          cancelLink='/recipes'
          disabled={recipeQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </RecipeLayout>
  )
}

export default CreateRecipe;
