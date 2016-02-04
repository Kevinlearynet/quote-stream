/**
 * Stocker Ticker Client
 *
 * Updates DOM on pub/sub triggered socket events
 */
'use strict';

( function ( $, _ ) {

	var socket = io.connect( "http://localhost:4000" );

	// retreive quotes for tickers
	$( '#portfolio' ).on( 'submit', function ( e ) {
		e.preventDefault();

		var json = $( this ).serializeArray();
		var data = {};
		_.forEach( json, function map( obj ) {
			data[ obj.name ] = obj.value;
		} );

		socket.emit( 'ticker', data );
	} );

	socket.on( 'quote', function ( data ) {

		// update market price
		var $sibling = $( 'input[value="' + data.ticker + '"]' );
		$sibling.parent().parent().find( 'input[name="market_price"]' ).val( data.price );
	} );

} )( window.jQuery, window._ );
