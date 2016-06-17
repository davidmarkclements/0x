var restify = require('restify');
const server = restify.createServer();

server.get('/', function (req, res, next) {
  res.send('Hello babel example');
});

const start = () => server.listen(3000);

export {
  start
}
