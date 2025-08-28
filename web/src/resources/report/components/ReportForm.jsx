/**
 * Reusable stateless form component for Report
 */

// import primary libraries
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

// import global components

// import form components
import { TextInput } from '../../../global/components/forms'

const ReportForm = ({
  cancelLink
  , disabled
  , formTitle
  , formType
  , handleChange
  , handleSubmit
  , isChanged
  , report
}) => {

  // set the button text
  const buttonText = formType === 'create' ? 'Create Report' : 'Update Report'

  // set the form header
  const header = formTitle ? <div className=""><h2> {formTitle} </h2><hr /></div> : <div />

  return (
    <div className="">
      <form name='reportForm' className="" onSubmit={handleSubmit}>
        {header}
        <TextInput
          autoFocus={true}
          name='name'
          label='Name'
          value={report?.name || ''}
          change={handleChange}
          disabled={disabled}
          required={true}
        />
        <Link
          to={cancelLink}
        >
          Cancel
        </Link>
        <button
          disabled={disabled || !isChanged}
          type='submit'
        >
          {buttonText}
        </button>
      </form>
    </div>
  )
}

ReportForm.propTypes = {
  cancelLink: PropTypes.string.isRequired
  , disabled: PropTypes.bool
  , formTitle: PropTypes.string
  , formType: PropTypes.string.isRequired
  , handleChange: PropTypes.func.isRequired
  , handleSubmit: PropTypes.func.isRequired
  , isChanged: PropTypes.bool.isRequired
  , report: PropTypes.object.isRequired
}

ReportForm.defaultProps = {
  disabled: false
  , formTitle: ''
}

export default ReportForm

