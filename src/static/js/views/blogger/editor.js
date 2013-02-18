!function (window,$,nbrut) {
    function bindTitle(){
        var input = $('#entry-title'),
            title = $('.entry-editor .blog-entry-title h1');

        function updateTitlePreview() {
            var value = input.val();
            title.text(value);
            title.toggleClass('empty', value.length === 0);
        }

        input.on('keydown keypress paste', function(){
            setTimeout(updateTitlePreview, 0);
        });
        input.focus();
        updateTitlePreview();
    }

    function prepare(render, data){
        if(!data.id){
            render({
                entry: {},
                submit: {
                    text: 'Post',
                    disabled: 'Posting...'
                }
            });
        }else{
            nbrut.thin.get('entry', {
                id: data.id,
                done: function(it){
                    render({
                        entry: it.entry,
                        submit: {
                            text: 'Update',
                            disabled: 'Updating...'
                        }
                    });
                }
            });
        }
    }

    function bindSubmit(){
        var editor = $('#entry-editor'),
            submit = $('#submit-entry'),
            title = $('#entry-title'),
            brief = $('#wmd-input-brief'),
            text = $('#wmd-input-text');

        submit.on('click', function(){
            nbrut.ui.disable(submit);
            nbrut.thin.put('entry', {
                id: submit.data('id'),
                data: {
                    entry: {
                        title: title.val(),
                        brief: brief.val(),
                        text: text.val()
                    }
                },
                context: editor,
                done: function(){
                    nbrut.tt.activate('entry-review');
                },
                always: function(){
                    nbrut.ui.enable(submit);
                }
            });
        });
    }

    function afterActivate(){
        bindTitle();
        bindSubmit();
    }

    nbrut.tt.configure({
        key: 'entry-editor',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);