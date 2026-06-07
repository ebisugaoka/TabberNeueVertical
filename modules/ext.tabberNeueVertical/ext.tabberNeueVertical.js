( function () {
	'use strict';

	const verticalSelector = '.tabber--vertical';
	const directHeaderSelector = ':scope > .tabber__header';
	const directSectionSelector = ':scope > .tabber__section';
	const directTablistSelector = ':scope > .tabber__header > .tabber__tabs';
	const directTabSelector = ':scope > .tabber__header > .tabber__tabs > .tabber__tab';
	const directPanelSelector = ':scope > .tabber__section > .tabber__panel';
	const activePanelClass = 'tabber__panel--vertical-active';
	const readyClass = 'tabber--vertical-ready';

	function getDirectVerticalTabber( tablist ) {
		const tabber = tablist.closest( verticalSelector );
		if ( !tabber ) {
			return null;
		}

		return tabber.querySelector( directTablistSelector ) === tablist ? tabber : null;
	}

	function isVisuallyVertical( tabber ) {
		const tablist = tabber.querySelector( directTablistSelector );
		return tablist && window.getComputedStyle( tablist ).flexDirection.indexOf( 'column' ) === 0;
	}

	function getTabs( tabber ) {
		return Array.prototype.slice.call( tabber.querySelectorAll( directTabSelector ) );
	}

	function getPanels( tabber ) {
		return Array.prototype.slice.call( tabber.querySelectorAll( directPanelSelector ) );
	}

	function getActiveTab( tabber ) {
		const tabs = getTabs( tabber );
		return tabs.find( ( tab ) => tab.getAttribute( 'aria-selected' ) === 'true' ) || tabs[ 0 ] || null;
	}

	function syncActivePanel( tabber ) {
		if ( !( tabber instanceof Element ) || !tabber.matches( verticalSelector ) ) {
			return;
		}

		const section = tabber.querySelector( directSectionSelector );
		const activeTab = getActiveTab( tabber );
		const panels = getPanels( tabber );

		if ( !section || !activeTab || panels.length === 0 ) {
			return;
		}

		const activePanelId = activeTab.getAttribute( 'aria-controls' );
		let activePanel = null;

		panels.forEach( ( panel ) => {
			const isActive = panel.id === activePanelId;
			panel.classList.toggle( activePanelClass, isActive );
			panel.toggleAttribute( 'hidden', !isActive );
			panel.setAttribute( 'aria-hidden', isActive ? 'false' : 'true' );

			if ( isActive ) {
				activePanel = panel;
			}
		} );

		tabber.classList.add( readyClass );

		// If this runs after TabberNeue has already measured the panel, correct the
		// section height. If it runs before, this is harmless and keeps async content
		// loads from producing stale heights.
		if ( activePanel ) {
			window.requestAnimationFrame( () => {
				if ( isVisuallyVertical( tabber ) ) {
					section.style.height = activePanel.offsetHeight + 'px';
				}
			} );
		}
	}

	function getFocusedTabIndex( tabs ) {
		const activeElement = document.activeElement;
		let index = tabs.indexOf( activeElement );

		if ( index === -1 ) {
			index = tabs.findIndex( ( tab ) => tab.getAttribute( 'aria-selected' ) === 'true' );
		}

		return index === -1 ? 0 : index;
	}

	function moveFocus( tabber, direction ) {
		const tabs = getTabs( tabber );
		if ( tabs.length === 0 ) {
			return;
		}

		const oldIndex = getFocusedTabIndex( tabs );
		const newIndex = ( oldIndex + direction + tabs.length ) % tabs.length;

		tabs[ oldIndex ].setAttribute( 'tabindex', '-1' );
		tabs[ newIndex ].setAttribute( 'tabindex', '0' );
		tabs[ newIndex ].focus();
		tabs[ newIndex ].scrollIntoView( { block: 'nearest', inline: 'nearest' } );
	}

	function onKeydown( e ) {
		const tablist = e.target.closest( '.tabber__tabs' );
		if ( !tablist ) {
			return;
		}

		const tabber = getDirectVerticalTabber( tablist );
		if ( !tabber || !isVisuallyVertical( tabber ) ) {
			return;
		}

		if ( e.key === 'ArrowDown' ) {
			e.preventDefault();
			e.stopImmediatePropagation();
			moveFocus( tabber, 1 );
		} else if ( e.key === 'ArrowUp' ) {
			e.preventDefault();
			e.stopImmediatePropagation();
			moveFocus( tabber, -1 );
		} else if ( e.key === 'Enter' || e.key === ' ' ) {
			const tab = e.target.closest( '.tabber__tab' );
			if ( tab && tablist.contains( tab ) ) {
				e.preventDefault();
				tab.click();
			}
		}
	}

	function onTabChange( e ) {
		const tabber = e.target;
		if ( !( tabber instanceof Element ) || !tabber.matches( verticalSelector ) ) {
			return;
		}

		syncActivePanel( tabber );

		if ( !isVisuallyVertical( tabber ) ) {
			return;
		}

		const panelId = e.detail && e.detail.panelId;
		if ( !panelId ) {
			return;
		}

		const tab = tabber.querySelector(
			directTabSelector + '[aria-controls="' + CSS.escape( panelId ) + '"]'
		);
		if ( tab ) {
			tab.scrollIntoView( { block: 'nearest', inline: 'nearest' } );
		}
	}

	function syncOrientation( tabber ) {
		const tablist = tabber.querySelector( directTablistSelector );
		if ( tablist ) {
			tablist.setAttribute( 'aria-orientation', isVisuallyVertical( tabber ) ? 'vertical' : 'horizontal' );
		}
	}

	function initVerticalTabbers( root ) {
		const container = root instanceof Element ? root : document;
		const tabbers = container.matches && container.matches( verticalSelector ) ?
			[ container ] :
			Array.prototype.slice.call( container.querySelectorAll( verticalSelector ) );

		tabbers.forEach( ( tabber ) => {
			syncOrientation( tabber );
			syncActivePanel( tabber );
		} );
	}

	function observeTabAttributeChanges( root ) {
		const observer = new MutationObserver( ( mutations ) => {
			const tabbersToSync = new Set();

			mutations.forEach( ( mutation ) => {
				if ( mutation.type !== 'attributes' || mutation.attributeName !== 'aria-selected' ) {
					return;
				}

				const tab = mutation.target;
				if ( !( tab instanceof Element ) || !tab.matches( '.tabber__tab' ) ) {
					return;
				}

				const header = tab.closest( '.tabber__header' );
				const tabber = header ? header.closest( verticalSelector ) : null;
				if ( tabber && tabber.querySelector( directHeaderSelector ) === header ) {
					tabbersToSync.add( tabber );
				}
			} );

			tabbersToSync.forEach( syncActivePanel );
		} );

		observer.observe( root, {
			subtree: true,
			attributes: true,
			attributeFilter: [ 'aria-selected' ]
		} );
	}

	document.addEventListener( 'keydown', onKeydown, true );
	document.documentElement.addEventListener( 'tabber:tabchange', onTabChange );
	observeTabAttributeChanges( document.documentElement );

	mw.hook( 'wikipage.content' ).add( initVerticalTabbers );
	window.addEventListener( 'resize', mw.util.debounce( () => initVerticalTabbers( document ), 100 ) );
}() );
