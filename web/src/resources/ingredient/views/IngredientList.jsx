/**
 * View component for /ingredients
 *
 * Generic ingredient list view. Defaults to 'all' with:
 * const { data:  ingredients } = useGetIngredientList({})
 *
 */
// import primary libraries
import React from 'react'
import { Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import PaginatedList from '../../../global/components/base/PaginatedList';
import WaitOn from '../../../global/components/helpers/WaitOn'

// import resource components
import IngredientListItem from '../components/IngredientListItem.jsx'
import IngredientLayout from '../components/IngredientLayout.jsx'

// import services
import { useGetIngredientList } from '../ingredientService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const IngredientList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: ingredients, ids, pagination, ...ingredientQuery } = useGetIngredientList(queryArgs);

  return (
    <IngredientLayout title={'Ingredient List'}>
      <h1>Ingredient List</h1>
      <Link to="/ingredients/new">New Ingredient</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${ingredientQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={ingredientQuery} fallback={<Skeleton count={pagination.per} />}>
          {ingredients?.map(ingredient => <IngredientListItem key={ingredient._id} id={ingredient._id} />)}
          {/* {ids?.map(ingredientId => <IngredientListItem key={ingredientId} id={ingredientId} />)} */}
        </WaitOn>
      </PaginatedList>
    </IngredientLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('ingredient-list-item-skeleton');
  return items.map((name, index) => <IngredientListItem.Skeleton key={`${name} ${index}`} />)
}


export default IngredientList
