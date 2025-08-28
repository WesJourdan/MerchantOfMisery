/**
 * Sets up the routing for all ContractRun views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import contractRun views
import CreateContractRun from './views/CreateContractRun.jsx'
import ContractRunList from './views/ContractRunList.jsx'
import SingleContractRun from './views/SingleContractRun.jsx'
import UpdateContractRun from './views/UpdateContractRun.jsx'

const ContractRunRouter = () => {
  const location = useLocation()
  const contractRunId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All contractRuns', path: null }]}
        component={ContractRunList}
        exact
        // login={true}
        path='/contract-runs'
      />
      <YTRoute
        breadcrumbs={[{display: 'All contractRuns', path: '/contract-runs'}, {display: 'New ', path: null}]}
        component={CreateContractRun}
        exact
        // login={true}
        path='/contract-runs/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All contractRuns', path: '/contract-runs'}, {display: 'ContractRun details', path: null}]}
        component={SingleContractRun}
        // login={true}
        exact
        path='/contract-runs/:contractRunId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All contractRuns', path: '/contract-runs'}, {display: 'ContractRun Details', path: `/contract-runs/${contractRunId}`}, {display: 'Update', path: null}]}
        component={UpdateContractRun}
        exact
        login={true}
        path='/contract-runs/:contractRunId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default ContractRunRouter
