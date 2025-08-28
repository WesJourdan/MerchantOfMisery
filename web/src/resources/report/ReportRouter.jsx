/**
 * Sets up the routing for all Report views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import report views
import CreateReport from './views/CreateReport.jsx'
import ReportList from './views/ReportList.jsx'
import SingleReport from './views/SingleReport.jsx'
import UpdateReport from './views/UpdateReport.jsx'

const ReportRouter = () => {
  const location = useLocation()
  const reportId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All reports', path: null }]}
        component={ReportList}
        exact
        // login={true}
        path='/reports'
      />
      <YTRoute
        breadcrumbs={[{display: 'All reports', path: '/reports'}, {display: 'New ', path: null}]}
        component={CreateReport}
        exact
        // login={true}
        path='/reports/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All reports', path: '/reports'}, {display: 'Report details', path: null}]}
        component={SingleReport}
        // login={true}
        exact
        path='/reports/:reportId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All reports', path: '/reports'}, {display: 'Report Details', path: `/reports/${reportId}`}, {display: 'Update', path: null}]}
        component={UpdateReport}
        exact
        login={true}
        path='/reports/:reportId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default ReportRouter
