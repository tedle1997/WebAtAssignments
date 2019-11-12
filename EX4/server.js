const http = require('http');
const url = require('url');
const fs = require('fs');
const formidable = require('formidable');

const routes = Object.create(null);

const mimeType = {
	json: "application/json",
	js:   "application/javascript",
	pdf:  "application/pdf",
	zip:  "application/zip",
	gif:  "image/gif",
	jpeg: "image/jpeg",
	jpg:  "image/jpeg",
	png:  "image/png",
	mp3:  "audio/mpeg",
	mpeg: "audio/mpeg",
	mp4:  "video/mp4",
	ogg:  "video/ogg",
	ogv:  "video/ogg",
	txt:  "text/plain",
	css:  "text/css",
	html: "text/html"
};

var staticDIR = '/NodeStaticFiles/';

routes['file'] = function (req, res) {

	//--------Preprocess---------------------------------
	if (req.method != 'GET') {
		res.writeHead(405, {'Content-Type': 'text/html' });
		res.write("<h1>Error 405 - NOT GET METHOD :(</h1>");
		res.end();
		return;
	}
	//-----------------------------------------------------
	let urlPath = url.parse(req.url).pathname.replace(/^(\/file\/)/, staticDIR);
	urlPath = __dirname + urlPath;


	//------Check-file-existence------------------------------
	if (!fs.existsSync(urlPath)) {
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.write("<h1>ERROR 404 FILE NOT FOUND :(</h1>");
		res.end();
		return;
	}
	//---------------------------------------------------------

	let fileName = urlPath.split('/').slice(-1)[0];
	let extension = fileName.split('.').slice(-1)[0];
	let type = mimeType[extension];
	if (type == undefined) {
		type = 'application/octet-stream';
	}


	res.setHeader('Content-disposition', 'attachment; filename=\"' + fileName + '\"');
	res.setHeader('Content-type', type);
	fs.createReadStream(urlPath).pipe(res).on('finish', () => {
		res.end();
	});
};

routes['explore'] = function (req, res) {
	//--------Preprocess---------------------------------
	if (req.method != 'GET') {
		res.writeHead(405, {'Content-Type': 'text/html' });
		res.write("<h1>Error 405 - NOT GET METHOD :(</h1>");
		res.end();
		return;
	}
	//-----------------------------------------------------
	let urlPath = url.parse(req.url).pathname.replace(/^(\/explore\/)/, '/NodeStaticFiles/').replace(/\%20/g, ' ');
	urlPath = __dirname + urlPath;
	let basePath = url.parse(req.url).pathname.replace(/^(\/explore)/, '');

	console.log(basePath);

	//------Check-file-existence------------------------------
	if (!fs.existsSync(urlPath)) {
		res.writeHead(404, { 'Content-Type': 'text/html' });
		res.write("<h1>ERROR 404 FILE NOT FOUND</h1>");
		res.end();
		return;
	}
	//---------------------------------------------------------

	let dirName = urlPath.split('/').slice(-1)[0];
	let htmlOut = '';
	htmlOut += '<h1>' + dirName + '</h1>';
	htmlOut += '<ul>';

	let hostUrl = 'http://' + req.headers.host;
	htmlOut += '<li><a href=\"' + hostUrl + '/explore/' + basePath + '\">.</a></li>';
	htmlOut += '<li><a href=\"' + hostUrl + '/explore/' + basePath + '/..\">..</a></li>';

	fs.readdir(urlPath, (err, contents) => {
		if (err) {
			res.writeHead(500, { 'Content-Type': 'text/html' });
			res.write("<h1>ERROR 500</h1>");
			res.end();
			return;
		}

		contents.forEach((file) => {
			let filePath = urlPath + '/' + file;
			let isDir = fs.lstatSync(filePath).isDirectory();
			let url = '';
			if (isDir) {
				url = hostUrl + '/explore/' + basePath + '/' + file;
			} else {
				url = hostUrl + '/file/' + basePath + file;
			}

			htmlOut += '<li><a href=\"' + url + '\">' + file + '</a></li>';
		});

		htmlOut += '</ul>';
		res.writeHead(200, { 'Content-Type': 'text/html' }); // 200 - OK
		res.write(htmlOut);
		res.end();
	});
}

// ESERCIZIO 4

function uploadGet(req, res) {
	let htmlOut = '';
	htmlOut += '<form id=\"upload-form\" action=\"/upload\" method=\"post\" enctype=\"multipart/form-data\">';
	htmlOut += '<input type="file" name="file"><br>';
	htmlOut += '<input type=\"submit\" name=\"submit\"><br>'
	htmlOut += '</form></body></html>';

	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.write(htmlOut);
	res.end();
}

function uploadPost(req, res) {
	let hostUrl = 'http://' + req.headers.host; // Il nostro indirizzo internet "http://localhost:3000"
	let uploadDir = __dirname + '/NodeStaticFiles/'; // Cartella dove caricare il file

	// Legge i dati del form "in arrivo"
	let form = new formidable.IncomingForm();

	// Salva l'estensione del file caricato
	form.keepExtensions = true;

	form.parse(req, (err, fields, files) => {
		let origFile = files.file;
		let destFilePath = uploadDir + origFile.name;


		fs.rename(origFile.path, destFilePath, (err) => {
			if (err) {
				res.writeHead(500, {'content-type': 'text/html'});
				res.write('<h1>Caricamento file fallito</h1>');
				res.end();
				return;
			}

			// Caricamento completato - 302
			res.writeHead(302, {'content-type': 'text/html'});
			res.end();
		});
	});
}

routes['upload'] = function (req, res) {
	if (req.method == 'GET') {
		uploadGet(req, res);
	} else if (req.method == 'POST') {
		uploadPost(req, res);
	}
}

function onRequest(req, res) {
	const pathname = url.parse(req.url).pathname;
	const uri = pathname.split('/', 3)[1]
	if (typeof routes[uri] === 'function') {
		routes[uri](req, res);
	} else {
		//404
	}
}


http.createServer(onRequest).listen(3000);
console.log('Server started at localhost:3000');
