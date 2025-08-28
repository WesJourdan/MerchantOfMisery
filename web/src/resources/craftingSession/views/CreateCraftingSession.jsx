/**
 * View component for /crafting-sessions/new
 *
 * Creates a new craftingSession from a copy of the defaultItem in the craftingSession store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import CraftingSessionForm from '../components/CraftingSessionForm.jsx';
import CraftingSessionLayout from '../components/CraftingSessionLayout.jsx';

// import services
import { useCreateCraftingSession } from '../craftingSessionService';

const CreateCraftingSession = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: craftingSession, handleChange, handleSubmit, isChanged, ...craftingSessionQuery } = useCreateCraftingSession({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new craftingSession
    , onResponse: (newCraftingSession, error) => {
      if(error || !newCraftingSession) {
        alert(error || 'An error occurred.')
        history.replace('/crafting-sessions', location.state);
      } else {
        history.replace(`/crafting-sessions/${newCraftingSession._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <CraftingSessionLayout title={'New CraftingSession'}>
      <WaitOn query={craftingSessionQuery}>
        <CraftingSessionForm
          craftingSession={craftingSession}
          cancelLink='/crafting-sessions'
          disabled={craftingSessionQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </CraftingSessionLayout>
  )
}

export default CreateCraftingSession;
