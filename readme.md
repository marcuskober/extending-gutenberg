# Extending Gutenberg blocks

**This is a sample plugin for extending Gutenberg blocks with custom InspectorControls.**

## Features

Adding InspectorControls to core/paragraph block to create paragraphs with column layout.

## Step by step guide

### 1. Create plugin folder and plugin file

Inside `wp-content/plugins` create a folder for your new plugin, e.g. `extending-gutenberg`. 

Inside your new folder create a php plugin file, e.g. `extending-gutenberg.php`.

### 2. Init npm and install *wp-scripts*

Inside `wp-content/plugins/extending-gutenberg` run the following commands:

    npm init
    npm install --save-dev @wordpress/scripts

This installs all needed scripts and tools for the build step. [More info](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/)

### 3. Create source folder for our JavaScript files

Inside `wp-content/plugins/extending-gutenberg` create the folder `src` and inside this folder a file named `index.js`. This is the standard structure for *wp-scripts*.

Run `npm start` to begin with development. *wp-scripts* creates a folder `build` inside `wp-content/plugins/extending-gutenberg`. You now will find the created `index.js` file inside.

### 4. Create WordPress plugin file heaader

Open `wp-content/plugins/extending-gutenberg/extending-gutenberg.php` and add the following comment block so that WordPress is able to detect and integrate your plugin:

```php
<?php
/*
Plugin Name:    Extending Gutenberg
Description:    A sample plugin on how to extend existing Gutenberg blocks
Theme URI:      https://marcuskober.de
Author:         Marcus Kober
Author URI:     https://marcuskober.de
Version:        1.0.0
Text Domain:    extending-gutenberg
*/
```

### 5. Enqueue JavaScript file

Inside your `build` folder you will find the `index.js` that has to be enqueued and a nice little helper file `index.asset.php`. This file gives you a version number that changes whenever you edit `src/index.js` and automatically created dependencies.

Enqueue the JavaScript file with the hook `enqueue_block_editor_assets`.

Your plugin file should now look something like that:

```php
<?php
/*
Plugin Name:    Extending Gutenberg
Description:    A sample plugin on how to extend existing Gutenberg blocks
Theme URI:      https://marcuskober.de
Author:         Marcus Kober
Author URI:     https://marcuskober.de
Version:        1.0.0
Text Domain:    extending-gutenberg
*/

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

define('EXTGUT_DIR', plugin_dir_path(__FILE__));
define('EXTGUT_URL', plugin_dir_url(__FILE__));

add_action('enqueue_block_editor_assets', function() {
    $config = require_once EXTGUT_DIR . '/build/index.asset.php';

    wp_enqueue_script(
        'extending-gutenberg-script',
        EXTGUT_URL . '/build/index.js',
        $config['dependencies'],
        $config['version']
    );
});
```

### 6. Let's get our hands dirty with JavaScript

Now it's time to import all our needed components. Let's put this into `src/index.js`:

```js
import { addFilter } from '@wordpress/hooks'
import { createHigherOrderComponent } from '@wordpress/compose'
import { Fragment } from '@wordpress/element'
import { InspectorControls } from '@wordpress/block-editor'
import { PanelBody, RangeControl, __experimentalUnitControl as UnitControl } from '@wordpress/components'
```

First we need to hook into `blocks.registerBlockType` to add our custom attribute `extendedSettings` that will hold all custom settings. 

```js
addFilter(
  'blocks.registerBlockType',
  'extending-gutenberg/add-attributes',
  (props, name) => {
    // if not core paragraph block just return props
    if (name !== 'core/paragraph') {
      return props
    }

    // extend attributs with the new extendedSettings object
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
```

Create the higher order component for the `editor.BlockEdit` hook and call `addFilter`:

```js
const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
}, 'withInspectorControls')

addFilter(
  'editor.BlockEdit',
  'extending-gutenberg/edit',
  withInspectorControls
)
```

### 7. Implement higher order component

The following code creates the InspectorControls for the column settings:

```js
const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
  return ( props ) => {
    // if not core paragraph block return the simple BlockEdit component
    if (props.name !== 'core/paragraph') {
      return (
        <BlockEdit { ...props } />
      )
    }

    const {attributes, setAttributes} = props

    // create <style> block for current settings
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

    // return extended BlockEdit component
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
```

### 7. Backend is ready. Parse blocks to add frontend styling

In your plugin file you can now hook into `render_block` filter:

```php
add_filter('render_block', function(string $blockContent, array $block): string {
    if ($block['blockName'] !== 'core/paragraph' || ! isset($block['attrs']['extendedSettings'])) {
        return $blockContent;
    }

    // Check if block has id
    $blockHasId = preg_match('/id="([^"]+)"/', $blockContent, $matches);

    if ($blockHasId) {
        $id = $matches[1];
    }
    else {
        // Create new block id
        $id ='extgut-' . uniqid();
        $blockContent = preg_replace('#^<([^>]+)>#m', '<$1 id="' . $id . '">', $blockContent);
    }

    // Create css
    $style = sprintf(
        '<style>#%s{column-count:%s; column-gap:%s;}</style>',
        $id,
        isset($block['attrs']['extendedSettings']['columnCount']) ? $block['attrs']['extendedSettings']['columnCount'] : 1,
        isset($block['attrs']['extendedSettings']['columnGap']) ? $block['attrs']['extendedSettings']['columnGap'] : '20px'
    );

    return $style.$blockContent;
}, 10, 2 );
```

### 8. Done. :)

---

Cheers,
Marcus