/**
 * Reusable stateless form component for Shop
 */

// import primary libraries
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

// import global components

// import form components
import { SelectInput, TextInput } from '../../../global/components/forms'

const ShopForm = ({
  cancelLink
  , disabled
  , formTitle
  , formType
  , handleChange
  , handleSubmit
  , isChanged
  , shop
}) => {

  // set the button text
  const buttonText = formType === 'create' ? 'Create Shop' : 'Update Shop'

  // set the form header
  const header = formTitle ? <div className=""><h2> {formTitle} </h2><hr /></div> : <div />

  return (
    <div className="">
      <form name='shopForm' className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {header}
        <TextInput
          autoFocus={true}
          name='name'
          label='Name'
          value={shop?.name || ''}
          change={handleChange}
          disabled={disabled}
          required={true}
        />
        <TextInput
          name='description'
          label='Description'
          value={shop?.description || ''}
          change={handleChange}
          disabled={disabled}
          required={true}
        />
        {/* <SelectInput
          name='priceStrategy'
          label='Price Strategy'
          value={shop?.priceStrategy || 'fair'}
          change={handleChange}
          disabled={disabled}
          required={true}
          valueKey='value'
          displayKey='text'
          options={[
            { value: 'greedy', text: 'Greedy' },
            { value: 'fair', text: 'Fair' },
            { value: 'altruist', text: 'Altruist' }
          ]}
        /> */}
        {/* buttons */}
        <hr />
        <div className='flex justify-between gap-8'>
          {/* use Link for cancel to avoid unsaved changes popup from react-router */}
          <Link
            to={cancelLink}
            className='text-blue-500 hover:underline w-full bg-gray-200 font-bold py-2 px-4 rounded text-center mr-2'
          >
            Cancel
          </Link>
          <button
            disabled={disabled || !isChanged}
            type='submit'
            className='bg-blue-500 hover:bg-blue-700 w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50'
          >
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  )
}

ShopForm.propTypes = {
  cancelLink: PropTypes.string.isRequired
  , disabled: PropTypes.bool
  , formTitle: PropTypes.string
  , formType: PropTypes.string.isRequired
  , handleChange: PropTypes.func.isRequired
  , handleSubmit: PropTypes.func.isRequired
  , isChanged: PropTypes.bool.isRequired
  , shop: PropTypes.object.isRequired
}

ShopForm.defaultProps = {
  disabled: false
  , formTitle: ''
}

export default ShopForm

