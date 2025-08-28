/**
 * Sets up the routing for all Contract views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import contract views
import CreateContract from './views/CreateContract.jsx'
import ContractList from './views/ContractList.jsx'
import SingleContract from './views/SingleContract.jsx'
import UpdateContract from './views/UpdateContract.jsx'

const ContractRouter = () => {
  const location = useLocation()
  const contractId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All contracts', path: null }]}
        component={ContractList}
        exact
        // login={true}
        path='/contracts'
      />
      <YTRoute
        breadcrumbs={[{display: 'All contracts', path: '/contracts'}, {display: 'New ', path: null}]}
        component={CreateContract}
        exact
        // login={true}
        path='/contracts/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All contracts', path: '/contracts'}, {display: 'Contract details', path: null}]}
        component={SingleContract}
        // login={true}
        exact
        path='/contracts/:contractId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All contracts', path: '/contracts'}, {display: 'Contract Details', path: `/contracts/${contractId}`}, {display: 'Update', path: null}]}
        component={UpdateContract}
        exact
        login={true}
        path='/contracts/:contractId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default ContractRouter
