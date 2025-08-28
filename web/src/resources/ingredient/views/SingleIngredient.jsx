/**
 * View component for /ingredients/:ingredientId
 *
 * Displays a single ingredient from the 'byId' map in the ingredient reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetIngredientById } from '../ingredientService'

// import resource components
import IngredientLayout from '../components/IngredientLayout.jsx'

const SingleIngredient = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the ingredient id from the url. Below is equivalent to const { ingredientId } = this.props.match.params
  const { ingredientId } = useParams()

  // get the ingredient from the store (or fetch it from the server)
  const { data: ingredient, ...ingredientQuery } = useGetIngredientById(ingredientId)

  return (
    <IngredientLayout title={'Single Ingredient'}>
      <WaitOn query={ingredientQuery} fallback={<Skeleton />}>
        <div className={ingredientQuery.isFetching ? "opacity-50" : ""}>
          <h2>Ingredient details</h2>
          <h1> {ingredient?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update Ingredient</Link>
    </IngredientLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>Ingredient details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> Ingredient Name </h1>
    </div>
  )
}
export default SingleIngredient
