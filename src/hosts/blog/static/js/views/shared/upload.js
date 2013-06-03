!function (window,$,nbrut,undefined) {
    'use strict';

    function getExtensionRegex(fileType){
        if(fileType === 'image'){
            return {
                regex: /(\.|image\/)(gif|jpe?g|png)$/i,
                warning: 'Only GIF, JPEG and PNG images are allowed'
            };
        }
        return null;
    }

    function dragBehavior(area){
        var dropText = area.find('.upload-drop-text'),
            dragClass = 'upload-dragover';

        $('body').on('dragover.invalidate-dragover', function(){
            if(!area.hasClass(dragClass) && !area.hasClass('upload-progress')){
                area.addClass(dragClass);
                dropText.centerTextOnParent();
            }
        }).on('mouseenter.invalidate-dragover drop.invalidate-dragover', function(){
            if (area.hasClass(dragClass)){
                area.removeClass(dragClass);
                dropText.clearInlineMargins();
            }
        });
    }

    function dropDesign(area, xhr){
        var uploadClass = 'upload-progress',
            uploadText = area.find('.upload-progress-text');

        area.addClass(uploadClass);
        uploadText.centerTextOnParent();

        xhr.always(function(){
            area.removeClass(uploadClass);
            uploadText.clearInlineMargins();
        });
    }

    function afterActivate(viewModel, data, ctx){
        var area = ctx.elements,
            uploadContainer = area.find('.upload-form'),
            fileUpload = area.find('.upload-input'),
            ext = getExtensionRegex(viewModel.fileType);

        viewModel.thin.context = uploadContainer;
        dragBehavior(area);

        fileUpload.fileupload({
            type: viewModel.type || 'PUT',
            url: viewModel.url,
            dataType: 'json',
            dropZone: area,
            pasteZone: area,
            add: function(e, data){
                var xhr, validation;

                if(area.is('.upload-progress')){
                    return; // sanity
                }

                if(data.paramName !== 'file'){
                    return;
                }

                data.files = $.map(data.files, function(file){
                    if (ext === null || ext.regex.test(file.type) || ext.regex.test(file.name)){
                        return file;
                    }
                }).slice(0,1); // just the first valid file.

                uploadContainer.find('.validation').remove();

                if(data.files.length === 0){
                    validation = nbrut.tt.partial('validation', {
                        css: 'validation-errors',
                        messages: [ext.warning]
                    });
                    validation.prependTo(uploadContainer);
                }else{
                    xhr = data.submit();
                    nbrut.thin.track(xhr, viewModel.thin);
                    dropDesign(area, xhr);
                }
            },
            done: viewModel.done
        });
    }

    nbrut.tt.configure({
        key: 'file-upload',
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);