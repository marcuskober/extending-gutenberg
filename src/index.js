import { addFilter } from '@wordpress/hooks'
import { createHigherOrderComponent } from '@wordpress/compose'
import { Fragment } from '@wordpress/element'
import { InspectorControls } from '@wordpress/block-editor'
import { PanelBody, RangeControl, __experimentalUnitControl as UnitControl } from '@wordpress/components'

/**
 * Callback for the BlockEdit filter
 */
const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
  return ( props ) => {
    if (props.name !== 'core/paragraph') {
      return (
        <BlockEdit { ...props } />
      )
    }

    const {attributes, setAttributes} = props

    const id = `#block-${props.clientId}`
    let includeStyles = false
    let css = `${id}{`

    if (attributes.extendedSettings.columnCount) {
      includeStyles = true
      css += `column-count: ${attributes.extendedSettings.columnCount};`
    }

    if (attributes.extendedSettings.columnGap) {
      includeStyles = true
      css += `column-gap: ${attributes.extendedSettings.columnGap};`
    }

    css += '}'

    const beforeBlock = includeStyles ? (
      <style>
        {css}
      </style>
    ) : null

    return (
      <Fragment>
          {beforeBlock}
          <BlockEdit { ...props } />
          <InspectorControls>
              <PanelBody title="Columns" initialOpen={ false }>
                <RangeControl
                  label="Column count"
                  initialPosition={1}
                  min={1}
                  max={4}
                  value={attributes.extendedSettings.columnCount ? attributes.extendedSettings.columnCount : 1}
                  onChange={(columnCount) => setAttributes({extendedSettings: {...attributes.extendedSettings, columnCount}})}
                />
                <UnitControl
                  label="Column gap"
                  value={attributes.extendedSettings.columnGap ? attributes.extendedSettings.columnGap : '20px'}
                  units={
                    [
                      {
                        value: 'px',
                        label: 'px',
                        default: 20
                      },
                      {
                        value: '%',
                        label: '%',
                        default: 4
                      },
                      {
                        value: 'vw',
                        label: 'vw',
                        default: 2
                      },
                    ]
                  }
                  onChange={(columnGap) => setAttributes({extendedSettings: {...attributes.extendedSettings, columnGap}})}
                />
              </PanelBody>
          </InspectorControls>
      </Fragment>
    );
  }
}, 'withInspectorControls')

/**
 * Hook into registerBlockType to add our custom prop
 */
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

/**
 * Hook into BlockEdit to add our custom inspector controls
 */
 addFilter(
  'editor.BlockEdit',
  'extending-gutenberg/edit',
  withInspectorControls
)
