/**
 * Mark unpatrolled contributions of a given user with "!" on [[Special:Contributions]] and the history of pages
 *
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 */
( function ( mw, $ ) {
	'use strict';
	mw.messages.set( {
		// [[MediaWiki:Recentchanges-label-unpatrolled]]
		'muc-recentchanges-label-unpatrolled': 'Esta edição ainda não foi patrulhada'
	} );
	function mark( revids ) {
		var $marker = $( '<abbr class="unpatrolled">!</abbr>' )
			.attr( 'title', mw.msg( 'muc-recentchanges-label-unpatrolled' ) );
		$( '#mw-content-text' ).find( 'li' ).each( function () {
			var i,
				$this = $( this ),
				href = $this.find( 'a.mw-changeslist-date' ).attr( 'href' );
			if ( !href ) {
				return true;
			}
			for ( i = 0; i < revids.length; i++ ) {
				if ( href.indexOf( 'oldid=' + revids[ i ] ) !== -1 ) {
					$this.prepend( $marker.clone(), ' ' )
						.addClass( 'not-patrolled' );
				}
			}
		} );
	}

	function markUnpatrolledContribs() {
		var api = new mw.Api(),
			param = {
				action: 'query',
				list: 'recentchanges',
				rcprop: 'timestamp|title|ids|patrolled',
				rclimit: 'max',
				formatversion: 2,
				'continue': ''
			},
			getRC = function ( queryContinue ) {
				$.extend( param, queryContinue );
				api.get( param ).done( function ( data ) {
					var unpatrolled = [],
						pg = mw.config.get( 'wgPageName' ).replace( /_/g, ' ' );
					$.each( data.query.recentchanges, function () {
						if ( this.patrolled ||
							( mw.config.get( 'wgAction' ) === 'history' && this.title !== pg )
						) {
							// Continue
							return true;
						}
						unpatrolled.push( this.revid );
					} );
					if ( unpatrolled.length ) {
						mark( unpatrolled );
					}
					if ( data[ 'continue' ] ) {
						getRC( data[ 'continue' ] );
					}
				} );
			};
		if ( mw.config.get( 'wgAction' ) !== 'history' ) {
			param.rcuser = mw.config.get( 'wgRelevantUserName' );
		}
		getRC();
	}

	if ( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Contributions' || mw.config.get( 'wgAction' ) === 'history' ) {
		$.when(
			mw.loader.using( [ 'mediawiki.api' ] ),
			$.ready
		).then( markUnpatrolledContribs );
	}

}( mediaWiki, jQuery ) );
