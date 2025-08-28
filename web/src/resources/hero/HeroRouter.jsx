/**
 * Sets up the routing for all Hero views.
 */

// import primary libraries
import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

// import global components
import YTRoute from '../../global/components/routing/YTRoute.jsx'

// import hero views
import CreateHero from './views/CreateHero.jsx'
import HeroList from './views/HeroList.jsx'
import SingleHero from './views/SingleHero.jsx'
import UpdateHero from './views/UpdateHero.jsx'

const HeroRouter = () => {
  const location = useLocation()
  const heroId = location.pathname.split('/')[1]
  return (
    <Switch>
      <YTRoute
        breadcrumbs={[{display: 'All heroes', path: null }]}
        component={HeroList}
        exact
        // login={true}
        path='/heroes'
      />
      <YTRoute
        breadcrumbs={[{display: 'All heroes', path: '/heroes'}, {display: 'New ', path: null}]}
        component={CreateHero}
        exact
        // login={true}
        path='/heroes/new'
      />
      <YTRoute
        breadcrumbs={[{display: 'All heroes', path: '/heroes'}, {display: 'Hero details', path: null}]}
        component={SingleHero}
        // login={true}
        exact
        path='/heroes/:heroId'
      />
      <YTRoute
        breadcrumbs={[{display: 'All heroes', path: '/heroes'}, {display: 'Hero Details', path: `/heroes/${heroId}`}, {display: 'Update', path: null}]}
        component={UpdateHero}
        exact
        login={true}
        path='/heroes/:heroId/update'
        // admin={true}
      />
    </Switch>
  )
}

export default HeroRouter
