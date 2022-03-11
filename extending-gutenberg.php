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
        ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data', 'wp-i18n', 'underscore'],
        $config['version']
    );
});

