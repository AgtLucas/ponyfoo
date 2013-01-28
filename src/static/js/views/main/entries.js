!function (window,$,nbrut,undefined) {
	function prepare(render, data, identifier){
        if (data.query === undefined){
            complete(render, data);
        }else{
            nbrut.thin.get('entry', {
                then: function(it){
                    complete(render, data, it.entries)
                }
            });
        }
	}

    function complete(render, data, latest){
        nbrut.thin.get('entry', {
            id: data.query,
            then: function(it){
                render({
                    entries: it.entries || [it.entry],
                    paging: it.paging,
                    latest: latest || it.entries
                }, it.entry === null);
            }
        });
    }
	
	function afterActivate(viewModel, data, identifier){
		var container = $('.blog-entries');

        if(viewModel.entries.length === 0){
            var empty = nbrut.tt.partial('empty-entry', viewModel);
            empty.fill(container);
        }else if(viewModel.paging !== undefined){
            addPager(viewModel, identifier, data.query || '');
        }

        if(viewModel.entries.length === 1){
            var model = viewModel.entries[0].related,
                siblings = nbrut.tt.partial('entry-siblings', model),
                entry = container.find('.blog-entry');

            siblings.appendTo(entry);
        }

        nbrut.md.prettify(container);

        addSidebar();
	}

    function addExhausted(){
        var container = $('.blog-entries'),
            exhausted = nbrut.tt.partial('exhausted-entries');

        exhausted.appendTo(container);
    }

    function addPager(viewModel, identifier, query){
        if(viewModel.paging.next === false){
            addExhausted();
            return;
        }

        var page = '{0}p/{1}'.format(query.length === 0 ? '' : '/', viewModel.paging.next),
            container = $('.blog-entries'),
            paging = nbrut.tt.partial('entry-pager'),
            win = $(window),
            pager = paging.appendTo(container);

        function more(){
            win.off('scroll.paging');
            pager.off('click.paging');
            pagingEvent(identifier, pager, query, page);
        }

        win.on('scroll.paging', function(){
            var allowance = 80,
                target = pager.position().top + pager.height() - allowance,
                y = win.scrollTop() + win.height();

            if (y > target){
                more();
            }
        });

        pager.on('click.paging', more);
    }

    function pagingEvent(identifier,pager,query,page){
        var card = pager.find('.flip-card');

        console.log(identifier);
        console.log(nbrut.tt.active);

        if(nbrut.tt.active !== identifier){ // sanity
            return;
        }

        if(!card.hasClass('flipped')){
            card.addClass('flipped');

            nbrut.thin.get('entry', {
                id: query + page,
                then: function(it){
                    if(nbrut.tt.active !== identifier){ // sanity
                        return;
                    }

                    var container = $('.blog-entries'),
                        articles = nbrut.tt.partial('more-entries', it),
                        elements = articles.appendTo(container);

                    nbrut.md.prettify(elements);
                    pager.remove();
                    addPager(it, identifier, query);
                }
            });
        }
    }

    function addSidebar(){
        var flipper = $('.sidebar-flipper'),
            card = $('.blog-sidebar .flip-card'),
            highlight = 'box-highlight',
            highlightSidebar = 'sidebar-flip-highlight',
            highlighted = nbrut.local.get(highlightSidebar, true);

        if(highlighted === true){ // only when the user doesn't know about it.
            flipper.addClass(highlight);
        }

        flipper.on('click.flip', function(){
            card.toggleClass('flipped');
            flipper.removeClass(highlight);
            nbrut.local.set(highlightSidebar, false);
        });
    }
	
    nbrut.tt.configure({
        key: 'home',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);