/**
 * Stock Ticker Retrieval Server
 *
 * @version 0.0.1
 */

var express = require( 'express' );
var io = require( 'socket.io' );
var _ = require( 'lodash' );
var app = express();
var http = require( 'http' );
var unirest = require( 'unirest' );
var server = http.createServer( app );
var io = io.listen( server );
startup();

/**
 * Boot
 */
function startup() {

	server.listen( 4000 );

	// static assets
	app.use( '/public', express.static( 'public' ) );

	// index
	app.get( '/', function ( req, res ) {
		res.sendFile( __dirname + '/public/index.html' );
	} );

	io.sockets.on( 'connection', function ( socket ) {
		socket.on( 'ticker', function ( ticker ) {
			track_ticker( socket, ticker );
		} );
	} );
}

/**
 * Track Tickers at Intervals
 */
function track_ticker( socket, ticker ) {

	// initial run
	get_quote( socket, ticker );

	// check every 5 secs
	var timer = setInterval( function () {
		get_quote( socket, ticker )
	}, 5000 );

	socket.on( 'disconnect', function () {
		clearInterval( timer );
	} );
}

/**
 * Retreive Stock Quote
 */
function get_quote( socket, ticker ) {

	if ( !ticker ) {
		throw new Error( 'No ticker provided.' );
	}

	unirest.get( 'http://www.google.com/finance/info?client=ig&q=' + ticker ).end( function ( response ) {
		try {
			var data = JSON.parse( response.body.substring( 3 ) );

			var quote = {
				ticker: data[ 0 ].t,
				exchange: data[ 0 ].e,
				price: data[ 0 ].l_cur,
				change: data[ 0 ].c,
				change_percent: data[ 0 ].cp,
				last_trade_time: data[ 0 ].lt,
				dividend: data[ 0 ].div,
				yield: data[ 0 ].yld
			};

			socket.emit( 'quote', JSON.stringify( quote, true, '\t' ) );
		} catch ( e ) {
			throw e;
		}
	} );
}
