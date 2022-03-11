import { addFilter } from '@wordpress/hooks'
import { createHigherOrderComponent } from '@wordpress/compose'
import { Fragment } from '@wordpress/element'
import { InspectorControls } from '@wordpress/blockEditor'
import { PanelBody, PanelRow, RangeControl } from '@wordpress/components'

const withYourCustomBlockClass = createHigherOrderComponent( ( BlockListBlock ) => {
  return ( props ) => {
    return <BlockListBlock { ...props }/>
  }
}, 'withYourCustomBlockClass' )

const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
  return ( props ) => {
    if (props.name !== 'core/paragraph') {
      return (
        <BlockEdit { ...props } />
      )
    }

    const {attributes, setAttributes} = props

    return (
      <Fragment>
          <BlockEdit { ...props } />
          <InspectorControls>
              <PanelBody title="Columns" initialOpen={ false }>
                <RangeControl
                  initialPosition={1}
                  min={1}
                  max={4}
                  value={attributes.extendedSettings.columnCount ? attributes.extendedSettings.columnCount : 1}
                  onChange={(columnCount) => setAttributes({extendedSettings: {...attributes.extendedSettings, columnCount}})}
                />
              </PanelBody>
          </InspectorControls>
      </Fragment>
    );
  }
}, 'withInspectorControls')

addFilter(
  'blocks.registerBlockType',
	'extending-gutenberg/add-attributes',
  (props, name) => {
    if (name !== 'core/paragraph') {
      return props
    }

    const attributes = {
      ...props.attributes,
      extendedSettings: {
        type: 'object',
        default: {},
      }
    }

    return {...props, attributes}
  }
)

addFilter(
	'editor.BlockListBlock',
	'extending-gutenberg/list-block',
	withYourCustomBlockClass
)

addFilter(
  'editor.BlockEdit',
  'extending-gutenberg/edit',
  withInspectorControls
);