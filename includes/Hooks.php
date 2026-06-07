<?php
/**
 * TabberNeueVertical
 *
 * Adds opt-in vertical layouts for TabberNeue via CSS and a tiny keyboard helper.
 *
 * @license GPL-3.0-or-later
 */

declare( strict_types=1 );

namespace MediaWiki\Extension\TabberNeueVertical;

use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Output\OutputPage;
use MediaWiki\Skin\Skin;

class Hooks implements BeforePageDisplayHook {
	/**
	 * Load the helper module. It is intentionally tiny and inert unless a tabber
	 * has the tabber--vertical class.
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		$out->addModules( [ 'ext.tabberNeueVertical' ] );
	}
}
