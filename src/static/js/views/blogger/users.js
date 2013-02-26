!function (window,$,nbrut) {
    function prepare(render){
        nbrut.thin.get('user', {
            context: 'prepare',
            done: function(it){
                console.log(it);
                render(it);
            }
        });
    }

	function afterActivate(viewModel, data, ctx){
        var table = ctx.elements.filter('.users-table');

        nbrut.ui.pagedTable({
            what: 'user',
            friendlyName: 'users',
            legend: 'Load older users',
            partial: 'user-list',
            paging: viewModel.paging,
            table: table
        });
	}

    nbrut.tt.configure({
        key: 'blogger-users',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);