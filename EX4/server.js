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

routes['file'] = function (req, res) {
	if (req.method != 'GET') {
		// Controlla che sia un GET
		res.writeHead(405, {'Content-Type': 'text/html' }); // Errore 405
		res.write("<h1>Error 405 - Non sei un GET :(</h1>");// Contenuto html
		res.end();
		return;
	}

	// http://localhost:3000/file/file%2001.txt [file 01.txt]
	// --> file/file%2001.txt
	let urlPath = url.parse(req.url).pathname
	// --> NodeStaticFiles/file%2001.txt
		.replace(/^(\/file\/)/, '/NodeStaticFiles/')
		// ' ' <--> %20 [Spazi]
		.replace(/\%20/g, ' ');;

	// --> /home/user/someone/assignment4/NodeStaticFiles/file01.txt
	urlPath = __dirname + urlPath;


	if (!fs.existsSync(urlPath)) {
		// Il file non esiste
		res.writeHead(404, { 'Content-Type': 'text/html' }); // Errore 404
		res.write("<h1>Error 404 - File non trovato :(</h1>Che tristezza");// Contenuto html
		res.end();
		return;
	}

	// Habemus file
	let fileName = urlPath.split('/') // Crea array con i vari segmenti
		.slice(-1)  // = .reverse()   // Gira al contrario l'array
		[0];                          // Prendi il primo elemento dell'array girato

	let extension = fileName.split('.') // Come per il path
		.slice(-1)                      // Reverse
		[0];                            // L'ultimo dell'originale


	let type = mimeType[extension];        // Ottieni il mimeType relativo all'estensione
	if (type == undefined) {
		type = 'application/octet-stream'; // Generico / binario
	}

	res.setHeader('Content-disposition', 'attachment; filename=\"' + fileName + '\"');
	res.setHeader('Content-type', type);
	fs.createReadStream(urlPath)
		.pipe(res) // <- Butta il file dentro la risposta
		.on('finish', () => {
			// Quando abbiamo scaricato, chiudiamo la risposta
			res.end();
		});
}

// -------------------------------------------------
// ESERCIZIO 3

routes['explore'] = function (req, res) {
	if (req.method != 'GET') {
		// Controlla che sia un GET
		res.writeHead(405, { 'Content-Type': 'text/html' }); // Errore 405
		res.write("<h1>Error 405 - Non sei un GET :(</h1>");// Contenuto html
		res.end();
		return;
	}

	// http://localhost:3000/explore/level%201/foo.txt [level 1]
	// --> /explore/level%201
	let urlPath = url.parse(req.url).pathname
	// --> NodeStaticFiles/level%201
		.replace(/^(\/explore\/)/, '/NodeStaticFiles/')
		// ' ' <--> %20 [Spazi]
		.replace(/\%20/g, ' ');

	// --> /home/user/someone/assignment4/NodeStaticFiles/level 1
	urlPath = __dirname + urlPath;

	// Percorso file
	let basePath = url.parse(req.url).pathname // --> /explore/level%201
		.replace(/^(\/explore)/, ''); // /level%201

	if (!fs.existsSync(urlPath)) {
		// Il file non esiste
		res.writeHead(404, { 'Content-Type': 'text/html' }); // Errore 404
		res.write("<h1>Error 404 - File non trovato :(</h1>Che tristezza");// Contenuto html
		res.end();
		return;
	}

	let dirName = urlPath.split('/') // Crea array con i vari segmenti
		.slice(-1)  // = .reverse()  // Gira al contrario l'array
		[0];                         // Prendi il primo elemento dell'array girato


	let htmlOut = '';
	htmlOut += '<h1>' + dirName + '</h1>'; // Titolo in h1 con il nome della cartella
	htmlOut += '<ul>'; // Iniziamo la lista

	let hostUrl = 'http://' + req.headers.host; // esempio: http://localhost:3000

//NON MANCA UN IF?
	// `.` -> la stessa cartella
	htmlOut += '<li><a href=\"' + hostUrl + '/explore/' + basePath + '/.\">.</a></li>';
	// `..` -> la cartella genitore
	htmlOut += '<li><a href=\"' + hostUrl + '/explore/' + basePath + '/..\">..</a></li>';

	fs.readdir(urlPath, (err, contents) => {
		if (err) {
			// Impossibile leggere la cartella
			res.writeHead(500, { 'Content-Type': 'text/html' }); // Errore 500
			res.write("<h1>Lettura cartella non riuscita</h1>"); // Contenuto html
			res.end();
			return;
		}

		contents.forEach((file) => {
			let filePath = urlPath + '/' + file; // Percorso completo del file
			let isDir = fs.lstatSync(filePath).isDirectory(); // Cartella o file?
			let url = '';
			if (isDir) {
				// explore (cartella)
				url = hostUrl + '/explore/' + basePath + file;
			} else {
				// file (download)
				url = hostUrl + '/file/' + basePath + file;
			}

			htmlOut += '<li><a href=\"' + url + '\">' + file + '</a></li>';
		});

		htmlOut += '</ul>'; // Chiudi lista
		res.writeHead(200, { 'Content-Type': 'text/html' }); // 200 - OK
		res.write(htmlOut); // Contenuto html
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
		let origFile = files.file; // .file -> name="file" dal form
		let destFilePath = uploadDir + origFile.name; // NodeStaticFiles/ilMioFile.txt

		// Sposta il file da origFile.path a destFilePath
		fs.rename(origFile.path, destFilePath, (err) => {
			if (err) {
				// Caricamento file fallito
				res.writeHead(500, {'content-type': 'text/html'}); // Errore 500
				res.write('<h1>Caricamento file fallito</h1>');    // Contenuto html
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
		// Mostra il form
		uploadGet(req, res);
	} else if (req.method == 'POST') {
		// Carica il file
		uploadPost(req, res);
	}
}

// roba generale


// Configure your routing table here...
//routes['URL'] = function;

// Main server handler
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
console.log('Server started at localhost:3000')
