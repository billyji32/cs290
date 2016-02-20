var http=require('http');

http.createServer(function(req, res){
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end('i love this shit');
}).listen(3000);

console.log('server started on localhost:3000; press ctrl-c to terminate...');
