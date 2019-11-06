#!/usr/bin/env node
/*
 *  Basic node.js HTTP server 
 *  
 */

const http = require('http');
const url	= require('url');

const routes = Object.create(null);
const staticDir = __dirname + "/NodeStaticFiles/";

// Configure your routing table here...
//routes['URL'] = function;


const fs = require("fs");
// Main server handler
function onRequest(req, res) {
	if(res.method != 'GET'){
		//TODO error 405
		console.log("ERROR 405");
	}
	if(req.url.slice(0,6) === "/file/"){
		let path = staticDir + req.url.slice(6,);
		if(!fs.existsSync(path)){
			res.writeHead(404);
			return;
		} else {
			fs.createReadStream()
			
		}
	}
	const pathname = url.parse(req.url).pathname;
	const uri = pathname.split('/', 3)[1];
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
console.log('Server started at localhost:3000');