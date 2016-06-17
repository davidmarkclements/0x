'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.start = undefined;

var _restify = require('restify');

var _restify2 = _interopRequireDefault(_restify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = _restify2.default.createServer();

server.get('/', function (req, res, next) {
  res.send('Hello babel example');
});

var start = function start() {
  return server.listen(3000);
};

exports.start = start;