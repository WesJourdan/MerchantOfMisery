/**
 * Reusable stateless form component for Enchantment
 */

// import primary libraries
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

// import global components

// import form components
import { TextInput } from '../../../global/components/forms'

const EnchantmentForm = ({
  cancelLink
  , disabled
  , formTitle
  , formType
  , handleChange
  , handleSubmit
  , isChanged
  , enchantment
}) => {

  // set the button text
  const buttonText = formType === 'create' ? 'Create Enchantment' : 'Update Enchantment'

  // set the form header
  const header = formTitle ? <div className=""><h2> {formTitle} </h2><hr /></div> : <div />

  return (
    <div className="">
      <form name='enchantmentForm' className="" onSubmit={handleSubmit}>
        {header}
        <TextInput
          autoFocus={true}
          name='name'
          label='Name'
          value={enchantment?.name || ''}
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

EnchantmentForm.propTypes = {
  cancelLink: PropTypes.string.isRequired
  , disabled: PropTypes.bool
  , formTitle: PropTypes.string
  , formType: PropTypes.string.isRequired
  , handleChange: PropTypes.func.isRequired
  , handleSubmit: PropTypes.func.isRequired
  , isChanged: PropTypes.bool.isRequired
  , enchantment: PropTypes.object.isRequired
}

EnchantmentForm.defaultProps = {
  disabled: false
  , formTitle: ''
}

export default EnchantmentForm

