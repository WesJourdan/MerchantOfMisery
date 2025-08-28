/**
 * View component for /recipes
 *
 * Generic recipe list view. Defaults to 'all' with:
 * const { data:  recipes } = useGetRecipeList({})
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
import RecipeListItem from '../components/RecipeListItem.jsx'
import RecipeLayout from '../components/RecipeLayout.jsx'

// import services
import { useGetRecipeList } from '../recipeService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const RecipeList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: recipes, ids, pagination, ...recipeQuery } = useGetRecipeList(queryArgs);

  return (
    <RecipeLayout title={'Recipe List'}>
      <h1>Recipe List</h1>
      <Link to="/recipes/new">New Recipe</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${recipeQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={recipeQuery} fallback={<Skeleton count={pagination.per} />}>
          {recipes?.map(recipe => <RecipeListItem key={recipe._id} id={recipe._id} />)}
          {/* {ids?.map(recipeId => <RecipeListItem key={recipeId} id={recipeId} />)} */}
        </WaitOn>
      </PaginatedList>
    </RecipeLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('recipe-list-item-skeleton');
  return items.map((name, index) => <RecipeListItem.Skeleton key={`${name} ${index}`} />)
}


export default RecipeList
