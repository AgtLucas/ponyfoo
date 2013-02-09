!function (window,$,nbrut,moment,undefined) {
    var html = nbrut.md.html;

    function entryHook(data){
        $.each(data.entries || [data.entry], function(){
            var self = this, d;

            self.date = new Date(self.date);

            m = moment(self.date);

            self.dateText = m.format();
            self.published = m.format(moment.dayFormat);
            self.timeAgo = m.fromNow();

            self.commentsUrl = self.permalink + '/comments';

            self.html = {
                brief: html(self.brief),
                text: html(self.text)
            };
        });

        $.each(data.discussions || [], function(){
            var self = this;

            $.each(self.comments, function(){
                var comment = this;

                comment.html = nbrut.md.html(comment.text);
            });
        });
    }

    function commentHook(data){
        if (data.discussions !== undefined){
            data.discussions.forEach(function(discussion){
                discussion.comments.forEach(addCommentProperties);
            });
        }
    }

    function commentPutHook(data){
        if (data.comment !== undefined){
            addCommentProperties(data.comment);
        }
    }

    function addCommentProperties(comment){
        comment.html = html(comment.text);
        comment.css = 'blog-comment-author' + (comment.author.blogger ? ' blogger' : '');
    }

    function userHook(data){
        var user = data.user;
        if (user !== undefined){
            var created = user.created,
                m = moment(created),
                me = user._id === nbrut.locals.id;

            user.me = me;
            user.created = new Date(created);
            user.createdText = m.format(moment.dayFormat);
            user.duration = m.fromNow(true);

            if (user.website.title === undefined || user.website.url === undefined){
                user.website = undefined; // normalize
            }

            user.profileTitle = me ? 'My Profile' : user.displayName;
            user.bioHtml = nbrut.md.html(user.bio);
        }
    }

    nbrut.thin.hook('entry', { get: entryHook });
    nbrut.thin.hook('comment', { get: commentHook, put: commentPutHook });
    nbrut.thin.hook('user', { get: userHook });
}(window,jQuery,nbrut,moment);