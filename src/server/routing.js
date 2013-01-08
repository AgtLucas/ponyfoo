var site = require('../controllers/site.js');
var entry = require('../controllers/entry.js');

function api(server){
	var base = '/api/1.0',
		verbs = ['get','post','put','del','all'],
		methods = {};
	
	function register(endpoint, cb, verb) {
		server[verb](base + endpoint, cb);
	}
	
	verbs.foreach(function(v){
		methods[v] = function(endpoint, cb){
			register(endpoint, cb, v);
		};
	});
	
	return methods;
}

function registerApiRoutes(server){
	var a = api(server);
	
    a.get('/entry', entry.get);
    
	a.get('/entry/:year/:month?/:day?', entry.getByDate);
	a.get('/entry/:year/:month/:day/:slug', entry.getBySlug);
	
    a.get('/entry/:id([0-9a-f]+)', entry.getOne);
    a.put('/entry', entry.put);
	a.put('/entry/:id([0-9a-f]+)', entry.upd);
	a.del('/entry/:id([0-9a-f]+)', entry.del);
	
	a.all('/*', function(req, res){
		var json = JSON.stringify({
			error: {
				code: 404,
				message: 'api endpoint not found'
			}
		});
		res.writeHead(404, {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache'
		});
		res.write(json);
		res.end();
	});
}

module.exports = function(server){	
	registerApiRoutes(server);
	
	server.get('/*', site.get);
};