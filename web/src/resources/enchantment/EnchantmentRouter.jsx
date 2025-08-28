/**
 * Sets up the routing for all Enchantment views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import enchantment views
import CreateEnchantment from './views/CreateEnchantment.jsx'
import EnchantmentList from './views/EnchantmentList.jsx'
import SingleEnchantment from './views/SingleEnchantment.jsx'
import UpdateEnchantment from './views/UpdateEnchantment.jsx'

const EnchantmentRouter = () => {
  const location = useLocation()
  const enchantmentId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All enchantments', path: null }]}
        component={EnchantmentList}
        exact
        // login={true}
        path='/enchantments'
      />
      <YTRoute
        breadcrumbs={[{display: 'All enchantments', path: '/enchantments'}, {display: 'New ', path: null}]}
        component={CreateEnchantment}
        exact
        // login={true}
        path='/enchantments/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All enchantments', path: '/enchantments'}, {display: 'Enchantment details', path: null}]}
        component={SingleEnchantment}
        // login={true}
        exact
        path='/enchantments/:enchantmentId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All enchantments', path: '/enchantments'}, {display: 'Enchantment Details', path: `/enchantments/${enchantmentId}`}, {display: 'Update', path: null}]}
        component={UpdateEnchantment}
        exact
        login={true}
        path='/enchantments/:enchantmentId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default EnchantmentRouter
