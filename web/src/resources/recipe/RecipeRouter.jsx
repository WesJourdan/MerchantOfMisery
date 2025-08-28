/**
 * Sets up the routing for all Recipe views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import recipe views
import CreateRecipe from './views/CreateRecipe.jsx'
import RecipeList from './views/RecipeList.jsx'
import SingleRecipe from './views/SingleRecipe.jsx'
import UpdateRecipe from './views/UpdateRecipe.jsx'

const RecipeRouter = () => {
  const location = useLocation()
  const recipeId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All recipes', path: null }]}
        component={RecipeList}
        exact
        // login={true}
        path='/recipes'
      />
      <YTRoute
        breadcrumbs={[{display: 'All recipes', path: '/recipes'}, {display: 'New ', path: null}]}
        component={CreateRecipe}
        exact
        // login={true}
        path='/recipes/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All recipes', path: '/recipes'}, {display: 'Recipe details', path: null}]}
        component={SingleRecipe}
        // login={true}
        exact
        path='/recipes/:recipeId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All recipes', path: '/recipes'}, {display: 'Recipe Details', path: `/recipes/${recipeId}`}, {display: 'Update', path: null}]}
        component={UpdateRecipe}
        exact
        login={true}
        path='/recipes/:recipeId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default RecipeRouter
