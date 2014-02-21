/**
 * Mark unpatrolled contributions of a given user with "!" on [[Special:Contributions]]
 * @author: [[User:Helder.wiki]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/MarkUnpatrolledContribs.js]] ([[File:User:Helder.wiki/Tools/MarkUnpatrolledContribs.js]])
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, trailing: true, maxlen: 120, evil: true, onevar: true */
/*global jQuery, mediaWiki */
( function ( mw, $ ) {
'use strict';

function markUnpatrolledContribs (){
	( new mw.Api() ).get( {
		action: 'query',
		list: 'recentchanges',
		rcuser: mw.config.get( 'wgRelevantUserName' ),
		rcprop: 'timestamp|title|ids|patrolled',
		rclimit: 'max'
	} ).done( function( data ){
		var unpatrolled = [], $marker;
		$.each( data.query.recentchanges, function(){
			if( this.unpatrolled !== '' ){
				// Continue
				return true;
			}
			unpatrolled.push( this.revid );
		} );
		if( unpatrolled.length === 0 ){
			return;
		}
		$marker = $( '<abbr class="unpatrolled" title="Esta edição ainda não foi patrulhada">!</abbr>' );
		$( '#mw-content-text' ).find( 'li' ).each( function(){
			var i,
				$this = $(this),
				html = $this.html();
			for( i = 0; i < unpatrolled.length; i++ ){
				if( html.indexOf( 'oldid=' + unpatrolled[i] ) !== -1 ){
					$this.prepend( $marker.clone(), ' ' )
						.css( 'background', '#FFC' );
				}
			}
		} );
	} );
}

if( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Contributions' ){
	mw.loader.using( [ 'mediawiki.api' ], function() {
		$( markUnpatrolledContribs );
	} );
}

}( mediaWiki, jQuery ) );