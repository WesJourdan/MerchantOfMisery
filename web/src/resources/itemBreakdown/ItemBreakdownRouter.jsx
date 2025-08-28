/**
 * Sets up the routing for all ItemBreakdown views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import itemBreakdown views
import CreateItemBreakdown from './views/CreateItemBreakdown.jsx'
import ItemBreakdownList from './views/ItemBreakdownList.jsx'
import SingleItemBreakdown from './views/SingleItemBreakdown.jsx'
import UpdateItemBreakdown from './views/UpdateItemBreakdown.jsx'

const ItemBreakdownRouter = () => {
  const location = useLocation()
  const itemBreakdownId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All itemBreakdowns', path: null }]}
        component={ItemBreakdownList}
        exact
        // login={true}
        path='/item-breakdowns'
      />
      <YTRoute
        breadcrumbs={[{display: 'All itemBreakdowns', path: '/item-breakdowns'}, {display: 'New ', path: null}]}
        component={CreateItemBreakdown}
        exact
        // login={true}
        path='/item-breakdowns/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All itemBreakdowns', path: '/item-breakdowns'}, {display: 'ItemBreakdown details', path: null}]}
        component={SingleItemBreakdown}
        // login={true}
        exact
        path='/item-breakdowns/:itemBreakdownId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All itemBreakdowns', path: '/item-breakdowns'}, {display: 'ItemBreakdown Details', path: `/item-breakdowns/${itemBreakdownId}`}, {display: 'Update', path: null}]}
        component={UpdateItemBreakdown}
        exact
        login={true}
        path='/item-breakdowns/:itemBreakdownId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default ItemBreakdownRouter
