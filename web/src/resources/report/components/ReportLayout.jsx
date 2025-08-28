/**
 * Wraps all Report views in a wrapping container. If you want to give all
 * Report views a sidebar for example, you would set that here.
 * 
 * Accepts a "title" prop and passes it down to be used by React Helmet on the DefaultLayout.
 * This allows us to easily update the browser tab title on each view.
 */

// import primary libraries
import React from 'react'
import PropTypes from 'prop-types'

// import global components
import DefaultLayout from '../../../global/components/layouts/DefaultLayout.jsx'

const ReportLayout = ({ children, className, title }) => {
  return (
    <DefaultLayout title={title} className={className}>
      {children}
    </DefaultLayout>
  )
}

ReportLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node)
    , PropTypes.node
  ]).isRequired
  , className: PropTypes.string
  , title: PropTypes.string
}

ReportLayout.Skeleton = DefaultLayout.Skeleton;

export default ReportLayout;
