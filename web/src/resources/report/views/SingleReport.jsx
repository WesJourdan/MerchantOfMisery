/**
 * View component for /reports/:reportId
 *
 * Displays a single report from the 'byId' map in the report reducer
 */

// import primary libraries
import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn'

// import services
import { useGetReportById } from '../reportService'

// import resource components
import ReportLayout from '../components/ReportLayout.jsx'

const SingleReport = () => {
  // get location. Below is equivalent to const location = this.props.location
  const location = useLocation()

  // get the report id from the url. Below is equivalent to const { reportId } = this.props.match.params
  const { reportId } = useParams()

  // get the report from the store (or fetch it from the server)
  const { data: report, ...reportQuery } = useGetReportById(reportId)

  return (
    <ReportLayout title={'Single Report'}>
      <WaitOn query={reportQuery} fallback={<Skeleton />}>
        <div className={reportQuery.isFetching ? "opacity-50" : ""}>
          <h2>Report details</h2>
          <h1> {report?.name} </h1>
        </div>
      </WaitOn>
      <Link to={`${location.pathname}/update`}>Update Report</Link>
    </ReportLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h2>Report details</h2>
      <h1 className='bg-gray-600 text-gray-600 w-fit'> Report Name </h1>
    </div>
  )
}
export default SingleReport
