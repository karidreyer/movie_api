const http = require('http'),
  fs = require('fs'),
  url = require('url');

//Create the server
http.createServer((request, response) => {
  let addr = request.url,
    q = new URL(addr, 'http://' + request.headers.host),
    filePath = '';

  //Log the request URL and a timestamp to the log.txt file
  fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });

  //Parse the request.url to determine if the URL contains "documentation"
  if (q.pathname.includes('documentation')) {
    filePath = (__dirname + '/documentation.html'); //If yes, return the documentation.html file
  } else {
    filePath = 'index.html'; //Otherwise, return the index.html file
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data);
    response.end();

  });

}).listen(8080);
console.log('My test server is running on Port 8080.');