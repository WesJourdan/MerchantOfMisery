/**
 * View component for /heroes/:heroId/update
 *
 * Updates a single hero from a copy of the hero from the hero store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import HeroLayout from '../components/HeroLayout.jsx';
import HeroForm from '../components/HeroForm.jsx';

// import services
import { useGetUpdatableHero } from '../heroService';

const UpdateHero = () => {
  const history = useHistory();
  const location = useLocation();
  const { heroId } = useParams();
  const { data: hero, handleChange, handleSubmit, isChanged, ...heroQuery } = useGetUpdatableHero(heroId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedHero, error) => {
      if(error || !updatedHero) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/heroes/${heroId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <HeroLayout title={'Update Hero'}>
      <WaitOn query={heroQuery}>
        <HeroForm
          hero={hero}
          cancelLink={`/heroes/${heroId}`}
          disabled={heroQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </HeroLayout>
  )
}

export default UpdateHero;
