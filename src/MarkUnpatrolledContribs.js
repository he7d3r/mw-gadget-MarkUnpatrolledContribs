/**
 * Mark unpatrolled contributions of a given user with "!" on [[Special:Contributions]] and the history of pages
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, trailing: true, maxlen: 120, evil: true, onevar: true */
/*global jQuery, mediaWiki */
( function ( mw, $ ) {
'use strict';

function markUnpatrolledContribs() {
	var param = {
		action: 'query',
		list: 'recentchanges',
		rcprop: 'timestamp|title|ids|patrolled',
		rclimit: 'max'
	};
	if ( mw.config.get( 'wgAction' ) !== 'history' ) {
		param.rcuser = mw.config.get( 'wgRelevantUserName' );
	}
	( new mw.Api() ).get( param ).done( function( data ) {
		var unpatrolled = [],
			$marker,
			pg = mw.config.get( 'wgPageName' ).replace( /_/g, ' ' );
		$.each( data.query.recentchanges, function() {
			if ( this.unpatrolled !== '' ||
				( mw.config.get( 'wgAction' ) === 'history' && this.title !== pg )
			) {
				// Continue
				return true;
			}
			unpatrolled.push( this.revid );
		} );
		if ( unpatrolled.length === 0 ) {
			return;
		}
		$marker = $( '<abbr class="unpatrolled" title="Esta edição ainda não foi patrulhada">!</abbr>' );
		$( '#mw-content-text' ).find( 'li' ).each( function() {
			var i,
				$this = $( this ),
				href = $this.find( 'a.mw-changeslist-date' ).attr( 'href' );
			if ( !href ) {
				return true;
			}
			for ( i = 0; i < unpatrolled.length; i++ ) {
				if ( href.indexOf( 'oldid=' + unpatrolled[i] ) !== -1 ) {
					$this.prepend( $marker.clone(), ' ' )
						.css( 'background', '#FFC' );
				}
			}
		} );
	} );
}

if ( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Contributions' || mw.config.get( 'wgAction' ) === 'history' ) {
	mw.loader.using( [ 'mediawiki.api' ], function() {
		$( markUnpatrolledContribs );
	} );
}

}( mediaWiki, jQuery ) );