!function (window,nbrut) {
    var register = nbrut.tt.register;

    register({
        key: 'blogger-tools',
        source: '#blogger-tools-template',
        aliases: [{
            title: 'Tools',
            route: '/blogger',
            trigger: '#blogger-tools'
        }]
    });

    register({
        key: 'blog-configuration',
        source: '#blog-configuration-template',
        back: '#cancel-blog-configuration',
        aliases: [{
            title: 'Configure your Blog',
            route: '/blogger/blog'
        }]
    });

    register({
        key: 'entry-editor',
        source: '#entry-editor-template',
        mustache: true,
		back: '#cancel-entry',
        aliases: [{
            title: 'Compose Entry',
            route: '/blogger/entry',
            trigger: '#write-entry'
        }, {
            key: 'edit',
            title: 'Edit Entry',
            route: {
                regex: /^\/blogger\/entry\/([0-9a-f]{24})$/,
                get: function(data){
                    return '/blogger/entry/{0}'.format(data.id);
                },
                map: function(captures){
                    return { id: captures[1] };
                }
            }
        }]
    });

    register({
        key: 'entry-review',
        source: '#entry-review-template',
        mustache: true,
        aliases: [{
            title: 'Review Entries',
            route: '/blogger/entry/review'
        }]
    });

    register({
        key: 'entry-review-list',
        source: '#entry-review-list-template',
        mustache: true
    });

    register({
        key: 'blogger-users',
        source: '#blogger-users-template',
        mustache: true,
        aliases: [{
            title: 'Users',
            route: '/blogger/users'
        }]
    });

    register({
        key: 'user-list',
        source: '#user-list-template',
        mustache: true
    });

    register({
        key: 'blogger-discussions',
        source: '#blogger-discussions-template',
        mustache: true,
        aliases: [{
            title: 'Review Discussions',
            route: '/blogger/discussions'
        }]
    });

    register({
        key: 'discussion-rows',
        source: '#discussion-rows-template',
        mustache: true
    });
}(window,nbrut);