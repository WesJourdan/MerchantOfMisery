/**
 * View component for /heroes/:heroId
 *
 * Displays a single hero from the 'byId' map in the hero reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetHeroById } from '../heroService'

// import resource components
import HeroLayout from '../components/HeroLayout.jsx'
import HellmarchTactics from '../components/HellmarchTactics.jsx'

const SingleHero = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the hero id from the url. Below is equivalent to const { heroId } = this.props.match.params
  const { heroId } = useParams()

  // get the hero from the store (or fetch it from the server)
  const { data: hero, ...heroQuery } = useGetHeroById(heroId)

  return (
    <HeroLayout title={'Single Hero'}>
      <WaitOn query={heroQuery} fallback={<Skeleton />}>
        <div className={heroQuery.isFetching ? "opacity-50" : ""}>
          <h2>Hero details</h2>
          <h1> {hero?.name} </h1>
          {hero && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Hellmarch tactics simulator</h3>
              <HellmarchTactics heroName={hero?.name || 'Hero'} />
            </div>
          )}
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update Hero</Link>
    </HeroLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>Hero details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> Hero Name </h1>
    </div>
  )
}
export default SingleHero
