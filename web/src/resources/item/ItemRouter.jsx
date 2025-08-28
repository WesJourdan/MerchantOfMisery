/**
 * Sets up the routing for all Item views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import item views
import CreateItem from './views/CreateItem.jsx'
import ItemList from './views/ItemList.jsx'
import SingleItem from './views/SingleItem.jsx'
import UpdateItem from './views/UpdateItem.jsx'

const ItemRouter = () => {
  const location = useLocation()
  const itemId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All items', path: null }]}
        component={ItemList}
        exact
        // login={true}
        path='/items'
      />
      <YTRoute
        breadcrumbs={[{display: 'All items', path: '/items'}, {display: 'New ', path: null}]}
        component={CreateItem}
        exact
        // login={true}
        path='/items/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All items', path: '/items'}, {display: 'Item details', path: null}]}
        component={SingleItem}
        // login={true}
        exact
        path='/items/:itemId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All items', path: '/items'}, {display: 'Item Details', path: `/items/${itemId}`}, {display: 'Update', path: null}]}
        component={UpdateItem}
        exact
        login={true}
        path='/items/:itemId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default ItemRouter
