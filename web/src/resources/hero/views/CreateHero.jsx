/**
 * View component for /heroes/new
 *
 * Creates a new hero from a copy of the defaultItem in the hero store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import HeroForm from '../components/HeroForm.jsx';
import HeroLayout from '../components/HeroLayout.jsx';

// import services
import { useCreateHero } from '../heroService';

const CreateHero = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: hero, handleChange, handleSubmit, isChanged, ...heroQuery } = useCreateHero({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new hero
    , onResponse: (newHero, error) => {
      if(error || !newHero) {
        alert(error || 'An error occurred.')
        history.replace('/heroes', location.state);
      } else {
        history.replace(`/heroes/${newHero._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <HeroLayout title={'New Hero'}>
      <WaitOn query={heroQuery}>
        <HeroForm
          hero={hero}
          cancelLink='/heroes'
          disabled={heroQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </HeroLayout>
  )
}

export default CreateHero;
