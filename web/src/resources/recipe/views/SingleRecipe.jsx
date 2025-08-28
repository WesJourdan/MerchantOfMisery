/**
 * View component for /recipes/:recipeId
 *
 * Displays a single recipe from the 'byId' map in the recipe reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetRecipeById } from '../recipeService'

// import resource components
import RecipeLayout from '../components/RecipeLayout.jsx'

const SingleRecipe = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the recipe id from the url. Below is equivalent to const { recipeId } = this.props.match.params
  const { recipeId } = useParams()

  // get the recipe from the store (or fetch it from the server)
  const { data: recipe, ...recipeQuery } = useGetRecipeById(recipeId)

  return (
    <RecipeLayout title={'Single Recipe'}>
      <WaitOn query={recipeQuery} fallback={<Skeleton />}>
        <div className={recipeQuery.isFetching ? "opacity-50" : ""}>
          <h2>Recipe details</h2>
          <h1> {recipe?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update Recipe</Link>
    </RecipeLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>Recipe details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> Recipe Name </h1>
    </div>
  )
}
export default SingleRecipe
