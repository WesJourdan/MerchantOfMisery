/**
 * Sets up the routing for all CraftingSession views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import craftingSession views
import CreateCraftingSession from './views/CreateCraftingSession.jsx'
import CraftingSessionList from './views/CraftingSessionList.jsx'
import SingleCraftingSession from './views/SingleCraftingSession.jsx'
import UpdateCraftingSession from './views/UpdateCraftingSession.jsx'

const CraftingSessionRouter = () => {
  const location = useLocation()
  const craftingSessionId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All craftingSessions', path: null }]}
        component={CraftingSessionList}
        exact
        // login={true}
        path='/crafting-sessions'
      />
      <YTRoute
        breadcrumbs={[{display: 'All craftingSessions', path: '/crafting-sessions'}, {display: 'New ', path: null}]}
        component={CreateCraftingSession}
        exact
        // login={true}
        path='/crafting-sessions/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All craftingSessions', path: '/crafting-sessions'}, {display: 'CraftingSession details', path: null}]}
        component={SingleCraftingSession}
        // login={true}
        exact
        path='/crafting-sessions/:craftingSessionId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All craftingSessions', path: '/crafting-sessions'}, {display: 'CraftingSession Details', path: `/crafting-sessions/${craftingSessionId}`}, {display: 'Update', path: null}]}
        component={UpdateCraftingSession}
        exact
        login={true}
        path='/crafting-sessions/:craftingSessionId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default CraftingSessionRouter
