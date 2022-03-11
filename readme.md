# Extending Gutenberg blocks

This is a sample plugin for extending Gutenberg.

## Features

Adding InspectorControls to existing Gutenberg blocks.

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

### 5. Enqueue JavaScript file

Inside your `build` folder you will find the index.js that has to be enqueued and a nice little helper file `index.asset.php`. This file gives you a version number that changes whenever you edit `src/index.js` and automatically created dependencies.

Enqueue the JavaScript file with the hook `enqueue_block_editor_assets`.

Your plugin file should now look something like that:

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
