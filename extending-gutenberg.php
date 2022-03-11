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


