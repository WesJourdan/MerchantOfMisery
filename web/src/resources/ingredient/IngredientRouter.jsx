/**
 * Sets up the routing for all Ingredient views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import ingredient views
import CreateIngredient from './views/CreateIngredient.jsx'
import IngredientList from './views/IngredientList.jsx'
import SingleIngredient from './views/SingleIngredient.jsx'
import UpdateIngredient from './views/UpdateIngredient.jsx'

const IngredientRouter = () => {
  const location = useLocation()
  const ingredientId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All ingredients', path: null }]}
        component={IngredientList}
        exact
        // login={true}
        path='/ingredients'
      />
      <YTRoute
        breadcrumbs={[{display: 'All ingredients', path: '/ingredients'}, {display: 'New ', path: null}]}
        component={CreateIngredient}
        exact
        // login={true}
        path='/ingredients/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All ingredients', path: '/ingredients'}, {display: 'Ingredient details', path: null}]}
        component={SingleIngredient}
        // login={true}
        exact
        path='/ingredients/:ingredientId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All ingredients', path: '/ingredients'}, {display: 'Ingredient Details', path: `/ingredients/${ingredientId}`}, {display: 'Update', path: null}]}
        component={UpdateIngredient}
        exact
        login={true}
        path='/ingredients/:ingredientId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default IngredientRouter
