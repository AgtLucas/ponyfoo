!function (nbrut, window, $, locals, Mustache, undefined) {
    'use strict';

    var templating = function () {
        var templates = {},
            stringKeys = {},
            regexKeys = [],
			activity = {
				log: []
			},
            config = {
                defaultTemplate: 'home',
                container: $('main'),
                loading: { html: '', css: '' }
            },
            defaults = {
                mustache: false,
                prepare: function(next){
					next();
				},
                afterActivate: $.noop
            },
            titleSettings = {
                tag: $('title'),
                format: '{0} - ' + locals.site.title,
                raw: {
                    text: locals.site.title,
                    literal: true
                }
            },
            plugins = nbrut.pluginFactory.create();

        function register(settings) {
            var template = {};

            $.extend(template, defaults, settings);

            if(template.key in templates){
                throw new Error('template key not unique. ' + JSON.stringify({
                    key: template.key
                }));
            }
            read(template);

            templates[template.key] = template;

			setup(template);
        }
		
		function setup(template){
            $.each(template.aliases || [], function(){
                var alias = this;

				setupAlias(template, alias);
				bindTrigger(template, alias);
            });
		}
		
		function setupAlias(template, alias){
			alias.route = fixRouteObject(alias.route);

			if(!alias.route.regex){
				stringKeys[alias.route.get()] = template.key;
			}else{
				regexKeys.push({
					key: template.key,
					alias: alias,
					regex: alias.route.regex
				});
			}
		}

		function bindTrigger(template, alias){
            var trigger;

			if(typeof alias.trigger === 'string'){
				trigger = $(alias.trigger);
				trigger.on('click', function(e){
					if (e.which === 1){ // left-click
						activate(template.key);
						return false;
					}
				});
			}
		}

		function back(){
			var log = activity.log,
				to = log[log.length-1];
				
			if(!to){
				activate(config.defaultTemplate);
			}else{
				activate(to.key, to.settings);
			}
		}
		
		function bindBack(template){
			if(typeof template.back === 'string'){
				var backTrigger = $(template.back);
				backTrigger.on('click', back);
			}
		}

        function configure(settings) {
            if(!(settings.key in templates)){
                throw new Error('template not registered. ' + JSON.stringify({
                    key: settings.key
                }));
            }
            var configured = {},
                template = templates[settings.key];

            $.extend(configured, template, settings);
            templates[settings.key] = configured;
        }

        function read(template) {
            var s = $(template.source);
            if (s.length !== 1){
                throw new Error('template source not unique. ' + JSON.stringify({
                    source: template.source,
                    length: s.length
                }));
            }
            var css = s.data('class'),
				html = s.remove().html();

            template.dom = {
                html: html,
                css: css
            };

            if (template.mustache){
				var m = {
					regex: /<!--[ ]*(\{\{[^}]+\}\})[ ]*-->/g,
					replace: '$1'
				};
				var sanitized = html.replace(m.regex, m.replace);
                template.dom.view = Mustache.compile(sanitized);
            }
        }

        function fixRouteObject(source){
            if(typeof source === 'string'){
                return {
                    get: function(){
                        return source;
                    },
                    map: function(){
                        return null;
                    }
                };
            }
            return source;
        }

        function getHash(){
            return activity.log.length + (activity.current === undefined ? 0 : 1);
        }

        function equalSettings(x){
            var c = activity.current.settings,
                sameKey = c.key === x.key; // same route alias
            if(!sameKey){
                return false;
            }
            if(c.data === null && x.data === null){ // both null
                return true;
            }
            if(c.data === null || x.data === null){ // one null
                return false;
            }
            return equalRouteData(c.data, x.data);
        }

        function equalRouteData(c, x){
            for(var key in c){
                if(c[key] !== x[key]){
                    return false;
                }
            }
            return true;
        }

        function activateNotFound(){
            activate(undefined, undefined, 'replace');
        }

        function activate(key, settings, soft) {
            var template = templates[key];
            if (template === undefined) {
                template = templates['404']; // fall back to 404.
            }

            if (settings === undefined){
                settings = {};
            }

            var container = config.container;
            settings.flash = container.data('flash');
            container.removeAttr('data-flash').removeData('flash');

            deactivateContainer(template); // clean-up.
            settings.identifier = getHash();

            var ctx = { identifier: settings.identifier };

            if (activity.current !== undefined){
                ctx.prev = document.location.pathname + document.location.hash; // preserve hash, too.
            }

			function render(viewModel, notFound){
                if(settings.identifier !== getHash()){ // prevent mis-rendering when the user navigated away.
                    return;
                }
                if(notFound === true){
                    activateNotFound();
                    return;
                }
				activateTemplate(template, settings, viewModel || {}, ctx, soft); // set-up.
			}

			template.prepare(render, settings.data || {}, ctx);
        }

        function deactivateContainer(template) { // template is internal
            var loader = config.loading;
            if(template !== undefined){
                plugins.raise(template, 'deactivate');
            }
            config.container.off().removeClass().addClass(loader.css).empty().html(loader.html);
        }

        function activateTemplate(template, settings, viewModel, ctx, soft){
            var view;

            updateHistory();

            viewModel.flash = settings.flash  || {};
            plugins.raise(template, 'beforeActivate', settings);

            view = partial(template.key, viewModel);
            view.fill(config.container, settings.data || {}, ctx);
            plugins.raise(template, 'activated', config.container, viewModel, settings);

            function getHistoryInfo(){
                var alias = getTemplateAlias(template, settings);
                if (alias === undefined){ // template not found
                    return {
                        title: setTitle(template.title, viewModel, settings.data),
                        url: ctx.prev // preserve current url
                    };
                } 
                return {
                    title: setTitle(alias.title, viewModel, settings.data),
                    url: alias.route.get(settings.data)
                };
            }

            function updateHistory(){
                var info = getHistoryInfo(), 
                    method;

                if (activity.current && activity.current.key === template.key){ // template engine initialized
                    if(equalSettings(settings)){ // same template settings
                        if (soft !== 'replace'){
                            soft = true; // don't push history state.
                        }
                    }
                }

                if(soft !== true){
                    if(soft === 'replace'){
                        method = 'replaceState';
                    }else{
                        method = 'pushState';
                        nbrut.analytics.historyChange(info);
                    }

                    window.history[method]({
                        key: template.key,
                        settings: settings
                    }, info.title, info.url);
                }

                if (activity.current !== undefined){
                    activity.log.push(activity.current);
                }
                activity.current = {
                    key: template.key,
                    settings: settings,
                    template: template
                };
            }
        }

        function partial(key, viewModel){
            var template = templates[key];
            if (template === undefined){
                template = templates['404']; // fall back to 404.
            }

            var html;

            if(template.mustache){
                html = template.dom.view(viewModel);
            } else {
                html = template.dom.html;
            }

            function fill(container, data, ctx, noEvent){
                container.off().removeClass().addClass(template.dom.css).empty().html(html);
                fixLocalRoutes(container);
                bindBack(template);

                if(noEvent !== true){
                    raise(container);
                }

                function raise(where){
                    plugins.raise(template, 'fill', where, viewModel, data || {});
                }

                if (ctx === undefined){
                    ctx = {};
                }
                ctx.elements = container.children();

                return {
                    raise: raise,
                    ctx: ctx
                };
            }

            function move(fn){/* NOTE: data-class loses it's meaning in this case. */
                return function(container,data){
                    var tag = '<div/>',
                        temp = $(tag).hide().appendTo('body'), /* append to DOM to avoid inconsistencies */
                        fillResult = fill(temp, data, undefined, true),
                        ctx = fillResult.ctx;

                    ctx.elements[fn](container);
                    temp.remove();
                    fillResult.raise(ctx.elements);
                    return fillResult;
                };
            }

            function render(internal){
                return function(container, data, ctx){
                    var fillResult = internal(container, data, ctx),
                        updated = fillResult.ctx; // the argument could be undefined, update

                    template.afterActivate(viewModel, data || {}, updated);
                    return updated.elements;
                };
            }

            return {
                html: html,
                css: template.dom.css,
                fill: render(fill),
                appendTo: render(move('appendTo')),
                prependTo: render(move('prependTo')),
                insertBefore: render(move('insertBefore')),
                insertAfter: render(move('insertAfter'))
            };
        }

        function getTemplateAlias(template, settings){
            var key,
                alias;

            if(settings !== undefined){
                key = settings.key;
            }

            $.each(template.aliases || [], function(){
                if(this.key === key){
                    alias = this;
                    return false;
                }
            });

            return alias;
        }

        function setTitle(opts, viewModel, data){
            if (opts === undefined){
                opts = titleSettings.raw;
            }else if(typeof opts === 'string'){
                opts = { text: opts };
            }else if($.isFunction(opts)){
                opts = { dynamic: opts };
            }

            var text = opts.text || opts.dynamic(viewModel, data),
                title = opts.literal === true ? text : titleSettings.format.format(text);

            titleSettings.tag.text(title);
            viewModel.title = text;
            return title;
        }

        function getRouteFromComponents(path, hash){
            var route = getRoute(path + hash);
            if (route === undefined){
                route = getRoute(path);
            }
            return route;
        }

        function getRoute(url){
            if(url === undefined){
                return {};
            }

            var result = {
                key: stringKeys[url]
            };

            if(result.key !== undefined){
                return result;
            }

            $.each(regexKeys, function() {
                var self = this,
                    captures = url.match(self.regex);
                if (captures !== null){
                    result = {
                        key: self.key,
                        settings: {
                            key: self.alias.key,
                            data: self.alias.route.map(captures)
                        }
                    };
                    return false;
                }
            });
            return result;
        }

        function fixLocalRoutes(container){
            container.find('a').each(function(){
               var self = $(this),
                   url = self.attr('href'),
                   route = getRoute(url);

                if(route.key !== undefined){
                    self.on('click', function(e){
                        if (e.which === 1){ // left-click
                            activate(route.key, route.settings);
                            return false;
                        }
                    });
                }
            });
        }

        function activateRoute(route, soft){
            activate(route.key, route.settings, soft);
        }

		function popState(e){
            var initial = e.originalEvent === undefined || e.originalEvent.state === null;
			if(!initial){
                activateRoute({
                    key: e.originalEvent.state.key,
                    settings: e.originalEvent.state.settings
                },'replace');
			}
		}
		
        function init(){
            config.loading = {
                html: config.container.html(),
                css: config.container.attr('class')
            };

            $(window).on('popstate', popState);

            $(function(){
                var location = document.location,
                    route = getRouteFromComponents(location.pathname, location.hash);

                activateRoute(route, 'replace');
            });
        }

        return {
            defaults: defaults,
            init: init,
            register: register,
            configure: configure,
            getRoute: getRoute,
            activity: activity,
            activate: activate,
            activateRoute: activateRoute,
            activateNotFound: activateNotFound,
            loading: deactivateContainer,
            partial: partial,
            hook: plugins.hook,
            templateLinks: fixLocalRoutes,
            getActive: function() { // offset by one because 0 means nothing is active yet
                return getHash() - 1;
            }
        };
    }();

    nbrut.tt = templating;
}(nbrut, window, jQuery, locals, Mustache);