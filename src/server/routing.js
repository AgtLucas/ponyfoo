var site = require('../controllers/site.js');
var entry = require('../controllers/entry.js');

function api(server){
	var base = '/api/1.0',
		verbs = ['get','post','put','del','all'],
		methods = {};
	
	function register(endpoint, cb, verb) {
		server[verb](base + endpoint, cb);
	}
	
	verbs.forEach(function(v){
		methods[v] = function(endpoint, cb){
			register(endpoint, cb, v);
		};
	});
	
	return methods;
}

function registerApiRoutes(server){
	var a = api(server);
	
    a.get('/entry', entry.get);
    
	var routeYear = '/entry/:year([0-9]{4})',
		routeMonth = routeYear + '/:month(0[1-9]|1[0-2])',
		routeDay = routeMonth + '/:day(0[1-9]|[12][0-9]|3[01])',
		routeSlug = routeDay + '/:slug([a-z0-9\-]+)';
		
	a.get(routeYear, entry.getByDate);
	a.get(routeMonth, entry.getByDate);
	a.get(routeDay, entry.getByDate);
	a.get(routeSlug, entry.getBySlug);
	
    a.get('/entry/:id([0-9a-f]+)', entry.getById);
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