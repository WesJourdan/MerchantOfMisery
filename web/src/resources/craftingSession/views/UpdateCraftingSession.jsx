/**
 * View component for /crafting-sessions/:craftingSessionId/update
 *
 * Updates a single craftingSession from a copy of the craftingSession from the craftingSession store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import CraftingSessionLayout from '../components/CraftingSessionLayout.jsx';
import CraftingSessionForm from '../components/CraftingSessionForm.jsx';

// import services
import { useGetUpdatableCraftingSession } from '../craftingSessionService';

const UpdateCraftingSession = () => {
  const history = useHistory();
  const location = useLocation();
  const { craftingSessionId } = useParams();
  const { data: craftingSession, handleChange, handleSubmit, isChanged, ...craftingSessionQuery } = useGetUpdatableCraftingSession(craftingSessionId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedCraftingSession, error) => {
      if(error || !updatedCraftingSession) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/crafting-sessions/${craftingSessionId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <CraftingSessionLayout title={'Update CraftingSession'}>
      <WaitOn query={craftingSessionQuery}>
        <CraftingSessionForm
          craftingSession={craftingSession}
          cancelLink={`/crafting-sessions/${craftingSessionId}`}
          disabled={craftingSessionQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </CraftingSessionLayout>
  )
}

export default UpdateCraftingSession;
