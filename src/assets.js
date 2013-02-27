var config = require('./config.js'),
    assetify = require('assetify'),
    assets = {
        source: config.static.folder,
        bin: config.static.bin,
        css: getCss(),
        js: getJs(),
        profiles: ['anon','registered','blogger']
    };

function getCss(){
    return [
        // basic layout and design
        '/css/defaults/reset.css',
        '/css/defaults/basic.less',
        '/css/defaults/elements.less',
        '/css/defaults/controls.less',
        '/css/defaults/controls.spinner.less',
        '/css/defaults/layout.less',
        '/css/defaults/design.less',
        '/css/defaults/sprite.less',

        // libs
        '/css/libs/markdown.less',
        '/css/libs/markdown.editor.less',
        '/css/libs/prettify.less',
        '/css/libs/hint.less',

        // shared
        '/css/views/shared/404.less',
        { profile: 'anon', local: '/css/views/shared/authentication.less' },
        '/css/views/shared/upload.less',
        '/css/views/shared/expand.less',
        '/css/views/shared/table.pager.less',

        // view-specific rules
        '/css/views/user/profile.less',
        { profile: ['blogger', 'registered'], local: '/css/views/user/profile.edit.less' },
        { profile: 'anon', local: '/css/views/user/_providers.less' },
        { profile: 'anon', local: '/css/views/user/register.less' },
        { profile: 'anon', local: '/css/views/user/login.less' },

        '/css/views/blog/entries.less',
        '/css/views/blog/comments.less',
        { profile: ['blogger', 'registered'], local: '/css/views/blog/comments.registered.less' },

        { profile: 'blogger', local: '/css/views/blogger/index.less' },
        { profile: 'blogger', local: '/css/views/blogger/editor.less' },
        { profile: 'blogger', local: '/css/views/blogger/review.less' },
        { profile: 'blogger', local: '/css/views/blogger/discussions.less' },
        { profile: 'blogger', local: '/css/views/blogger/users.less' }
    ];
}

function getJs(){
    var js = [
        // external libraries
        config.jQuery.asset,
        '/js/libs/moment.min.js',
        '/js/libs/mustache.js',
        '/js/libs/jquery.color-2.1.1.js',
        '/js/libs/jquery.ui.widget.js',
        '/js/libs/jquery.fileupload.js',
        '/js/libs/jquery.textarearesizer.min.js',
        '/js/libs/Markdown.Converter.js',
        '/js/libs/Markdown.Sanitizer.js',
        '/js/libs/prettify.js',

        '/js/ext/String.js',
        '/js/ext/prettify.js',
        '/js/ext/jquery.layout.js',
        '/js/ext/jquery.ui.js', // not the well known, huge, jQuery UI. just a few extensions
        '/js/ext/jquery.nbrut.js',

        // nbrut
        '/js/nbrut/nbrut.core.js',
        { local: '/js/nbrut/nbrut.node.jsn', context: { config: config } },
        '/js/nbrut/nbrut.pluginFactory.js',
        '/js/nbrut/nbrut.md.js',
        '/js/nbrut/nbrut.ui.js',
        '/js/nbrut/nbrut.templates.js',
        '/js/nbrut/nbrut.thin.js',
        '/js/nbrut/nbrut.init.js',

        // depends on nbrut.templates
        '/js/libs/Markdown.Editor.js',

        // hooks
        '/js/views/hooks/thin.js',
        '/js/views/hooks/thin.validation.js',
        '/js/views/hooks/templates.js',
        '/js/views/hooks/templates.md.js',
        '/js/views/hooks/templates.og.js',

        // template registration
        '/js/views/templates/shared.js',
        '/js/views/templates/markdown.js',
        '/js/views/templates/entries.js',
        { profile: 'anon', local: '/js/views/templates/anon.js' },
        { profile: ['blogger', 'registered'], local: '/js/views/templates/registered.js' },
        { profile: 'blogger', local: '/js/views/templates/blogger.js'},

        // template configuration
        '/js/views/shared/upload.js',
        '/js/views/shared/expand.section.js',
        '/js/views/shared/table.pager.js',

        '/js/views/markdown/prompts.js',

        '/js/views/user/profile.js',
        { profile: 'anon', local: '/js/views/user/login.js' },
        { profile: 'anon', local: '/js/views/user/register.js' },
        { profile: ['blogger', 'registered'], local: '/js/views/user/profile.edit.js' },

        '/js/views/blog/search.js',
        '/js/views/blog/entries.js',

        { profile: ['blogger', 'registered'], local: '/js/views/blog/comments.registered.js' },
        { profile: ['blogger', 'registered'], local: '/js/views/blog/comments.edit.js' },

        { profile: 'blogger', local: '/js/views/blogger/editor.js' },
        { profile: 'blogger', local: '/js/views/blogger/review.js' },
        { profile: 'blogger', local: '/js/views/blogger/discussions.js' },
        { profile: 'blogger', local: '/js/views/blogger/users.js' }
    ];

    if(config.tracking.code !== undefined){
        js.push({ local: '/js/ext/analytics.jsn', context: { config: config } });
    }

    if(config.env.development === true){
        js.push('/js/debug.js');
    }

    return js;
}

assets.compile = function(done){
    assetify.use(assetify.plugins.less);
    assetify.use(assetify.plugins.jsn);

    if (config.env.production){
        assetify.use(assetify.plugins.bundle);
        assetify.use(assetify.plugins.minifyCSS);
        assetify.use(assetify.plugins.minifyJS);
    }
    assetify.use(assetify.plugins.forward({ extnames: ['.txt'] }, true));
    assetify.compile(assets, done);
};

module.exports = assets;