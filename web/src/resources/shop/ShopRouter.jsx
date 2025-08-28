/**
 * Sets up the routing for all Shop views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import shop views
import CreateShop from './views/CreateShop.jsx'
import ShopList from './views/ShopList.jsx'
import UpdateShop from './views/UpdateShop.jsx'
import ShopDashboard from './views/ShopDashboard.jsx'

const ShopRouter = () => {
  const location = useLocation()
  const shopId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All shops', path: null }]}
        component={ShopList}
        exact
        // login={true}
        path='/shops'
      />
      <YTRoute
        breadcrumbs={[{display: 'All shops', path: '/shops'}, {display: 'New ', path: null}]}
        component={CreateShop}
        exact
        // login={true}
        path='/shops/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All shops', path: '/shops'}, {display: 'Shop details', path: null}]}
        component={ShopDashboard}
        // login={true}
        exact
        path='/shops/:shopId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All shops', path: '/shops'}, {display: 'Shop Details', path: `/shops/${shopId}`}, {display: 'Update', path: null}]}
        component={UpdateShop}
        exact
        login={true}
        path='/shops/:shopId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default ShopRouter
