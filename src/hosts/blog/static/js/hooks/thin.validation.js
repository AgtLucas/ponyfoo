!function (window,$,nbrut,undefined) {
    'use strict';

    function validationMessages(context, xhr, textStatus){
        var validation = parseResponseText(xhr, textStatus);

        if($.isArray(validation)){
            if (!context){
                validationInDialog(validation);
            }else if(context.jquery){
                validationInContext(validation, context);
            }else if(context === 'prepare'){
                nbrut.tt.activateNotFound(); // 404
            }
        }
    }

    function parseResponseText(xhr, textStatus){
        var response, notFound = ['Resource not found in the matrix. Try again later'];

        if(textStatus === 'timeout'){
            return ['The matrix is not responding to your request'];
        }

        if(!xhr.responseText){
            if(textStatus === 'success'){
                return getMeta(xhr);
            }else{
                return;
            }
        }

        try{
            response = JSON.parse(xhr.responseText);
        }catch(e){
            return notFound;
        }

        if(xhr.status === 404){ // resource not found
            return notFound;
        }else if(xhr.status === 500){ // mayhem!
            return ['Oops! The matrix won\'t cooperate with your request'];
        }

        function getMeta(response, defaultValue){
            try{
                return response.meta.data.validation;
            }catch(e){
                return defaultValue;
            }   
        }

        return getMeta(response, notFound);
    }

    function validationInDialog(validation){
        var body = $('body'),
            partial = nbrut.tt.partial('validation-dialog', { errors: validation, unclosable: true });

        body.find('.validation-dialog').remove();
        partial.appendTo(body);
    }

    function validationInContext(validation, context){
        var partial = nbrut.tt.partial('validation', {
            css: 'validation-errors',
            messages: validation
        });

        removeMessageInContext(context);
        partial.prependTo(context);

        context.scrollIntoView();
    }

    function removeMessageInContext(context){
        if (context && context.jquery){
            context.find('.validation:first-child').remove();
        }
    }

    nbrut.thin.hook('done', removeMessageInContext);
    nbrut.thin.hook('always', validationMessages);
}(window,jQuery,nbrut);