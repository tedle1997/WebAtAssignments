#!/usr/bin/env node
/*
 *  Basic node.js HTTP server 
 *  
 */

var express = require("express");
var app = express();

const http = require('http');
const url	= require('url');

const routes = Object.create(null);

// Configure your routing table here...
//routes['URL'] = function;


const fs = require("fs");
// Main server handler
function onRequest(req, res) {
	fs.readFile(__dirname + req.url, function (err,data) {
		console.log("reach within readfile");
		if (err) {
			res.writeHead(404);
			res.end(JSON.stringify(err));
			return;
		}
		res.writeHead(200);
	});
	const pathname = url.parse(req.url).pathname
	const uri = pathname.split('/', 3)[1]
	if (typeof routes[uri] === 'function')
	{
		routes[uri](req, res);
	} 
	else 
	{ 
        //404
		}
} 


http.createServer(onRequest).listen(3000);
console.log('Server started at localhost:3000')