/**
 * View component for /reports/:reportId/update
 *
 * Updates a single report from a copy of the report from the report store
 */

// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ReportLayout from '../components/ReportLayout.jsx';
import ReportForm from '../components/ReportForm.jsx';

// import services
import { useGetUpdatableReport } from '../reportService';

const UpdateReport = () => {
  const history = useHistory();
  const location = useLocation();
  const { reportId } = useParams();
  const { data: report, handleChange, handleSubmit, isChanged, ...reportQuery } = useGetUpdatableReport(reportId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedReport, error) => {
      if(error || !updatedReport) {
        alert(error || 'An error occurred.');
      }
      history.replace(`/reports/${reportId}`, location.state);
    }
  });

  // render UI based on data and loading state
  return (
    <ReportLayout title={'Update Report'}>
      <WaitOn query={reportQuery}>
        <ReportForm
          report={report}
          cancelLink={`/reports/${reportId}`}
          disabled={reportQuery.isFetching}
          formType='update'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ReportLayout>
  )
}

export default UpdateReport;
