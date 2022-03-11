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

    $id = '';
    if (isset($block['attrs']['inline_css_id'])) {
        $id = $block['attrs']['inline_css_id'];
    }

    if (isset($block['attrs']['anchor'])) {
        $id = $block['attrs']['anchor'];
    }

    $id = 'extgut-' . uniqid();

    if (! preg_match('/' . $id . '/', $blockContent)) {
        $blockContent = preg_replace('#^<([^>]+)>#m', '<$1 id="' . $id . '">', $blockContent);
    }

    $style = sprintf('<style>#%s{column-count:%s;}</style>', $id, $block['attrs']['extendedSettings']['columnCount']);

    return $style.$blockContent;
}, 10, 2 );


