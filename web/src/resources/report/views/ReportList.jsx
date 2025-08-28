/**
 * View component for /reports
 *
 * Generic report list view. Defaults to 'all' with:
 * const { data:  reports } = useGetReportList({})
 *
 */
// import primary libraries
import React from 'react'
import { Link } from 'react-router-dom'
// import PropTypes from 'prop-types'; // this component gets no props

// import global components
import PaginatedList from '../../../global/components/base/PaginatedList';
import WaitOn from '../../../global/components/helpers/WaitOn'

// import resource components
import ReportListItem from '../components/ReportListItem.jsx'
import ReportLayout from '../components/ReportLayout.jsx'

// import services
import { useGetReportList } from '../reportService'
import { useURLSearchParams } from '../../../global/utils/customHooks';

const ReportList = () => {
  const [queryArgs, handleChange] = useURLSearchParams({page: 1, per: 25});
  const { data: reports, ids, pagination, ...reportQuery } = useGetReportList(queryArgs);

  return (
    <ReportLayout title={'Report List'}>
      <h1>Report List</h1>
      <Link to="/reports/new">New Report</Link>
      <PaginatedList
        as='div'
        className={`scroll-mt-4 ${reportQuery.isFetching ? 'opacity-50' : ''}`}
        {...pagination}
        setPage={(newPage) => handleChange('page', newPage)}
        setPer={(e) => handleChange('per', e.target.value)}
      >
        <WaitOn query={reportQuery} fallback={<Skeleton count={pagination.per} />}>
          {reports?.map(report => <ReportListItem key={report._id} id={report._id} />)}
          {/* {ids?.map(reportId => <ReportListItem key={reportId} id={reportId} />)} */}
        </WaitOn>
      </PaginatedList>
    </ReportLayout>
  )
}

const Skeleton = ({ count = 5 }) => {
  const items = new Array(count).fill('report-list-item-skeleton');
  return items.map((name, index) => <ReportListItem.Skeleton key={`${name} ${index}`} />)
}


export default ReportList
