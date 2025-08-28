/**
 * View component for /reports/new
 *
 * Creates a new report from a copy of the defaultItem in the report store
 */

// import primary libraries
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ReportForm from '../components/ReportForm.jsx';
import ReportLayout from '../components/ReportLayout.jsx';

// import services
import { useCreateReport } from '../reportService';

const CreateReport = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: report, handleChange, handleSubmit, isChanged, ...reportQuery } = useCreateReport({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new report
    , onResponse: (newReport, error) => {
      if(error || !newReport) {
        alert(error || 'An error occurred.')
        history.replace('/reports', location.state);
      } else {
        history.replace(`/reports/${newReport._id}`, location.state);
      }
    }
  });

  // render UI based on data and loading state
  return (
    <ReportLayout title={'New Report'}>
      <WaitOn query={reportQuery}>
        <ReportForm
          report={report}
          cancelLink='/reports'
          disabled={reportQuery.isFetching}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ReportLayout>
  )
}

export default CreateReport;
