﻿!function($) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace( /\{\{|\}\}|\{(\d+)\}/g , function(m, n) {
			if (m == "{{") {
				return "{";
			}
			if (m == "}}") {
				return "}";
			}
			return args[n];
		});
	};

    $.fn.anchorSEO = function(selector){
        var container = this;

        container.find(selector || 'a').each(function(){
            var a = $(this),
                url = a.get(0).href,
                title = a.attr('title');

            a.addClass('highlighted-link');

            if(!!title){
                a.attr('data-hint', title);
                a.removeAttr('title');
            }

            if(url.indexOf(document.location.origin) !== 0){
                a.attr('rel','nofollow');
            }
        });

        return container.hints(true);
    };

    $.fn.loadImages = function(){
        return this.find('img[data-src]').each(function(){
            var self = $(this),
                src = self.data('src');

            self.attr('src', src);
            self.removeAttr('data-src');
        });
    };

    $.fn.hints = function(enabled){
        return this.each(function(){
            var elements = $(this).find('[data-hint]'),
                hintClassKey = 'hint-class';

            if(enabled !== false){ // prevent over-classing
                elements = elements.filter(':not(.hint, .hint-before)');
            }

            elements.each(function(){
                var self = $(this),
                    hintClass = self.data(hintClassKey),
                    className;

                if(enabled !== false){
                    self.addClass(hintClass || 'hint');
                }else{
                    if(hintClass === undefined){
                        className = self.hasClass('hint-before') ? 'hint-before' : 'hint';
                        self.data(hintClassKey, className);
                    }
                    self.removeClass('hint hint-before');
                }
            });
        });
    };

    $.fn.flip = function(direction){
        return this.each(function(){
            var card = $(this).filter('.flip-card'),
                face = direction || card.is(':not(.flipped)'),
                next = !!face ? '.face.back' : '.face.front',
                prev =  !face ? '.face.back' : '.face.front',
                delay = parseFloat(card.css('transition-duration') || 0) * 1000;

            card.toggleClass('flipped', direction);

            // prevent glitch caused by hints in the backside of cards
            card.find(prev).hints(false);

            setTimeout(function(){
                card.find(next).hints(true);
            }, delay);

            return card.is('.flipped');
        });
    };

    function doThisAndRemove(effect, then) {
        return this.each(function() {
            var self = $(this);
            self[effect]('fast', function() {
                self.remove();
                (then || $.noop)();
            });
        });
    }

	$.fn.fadeOutAndRemove = function(then) {
        doThisAndRemove.apply(this, ['fadeOut',then]);
	};

    $.fn.slideUpAndRemove = function(then) {
        doThisAndRemove.apply(this, ['slideUp',then]);
    };

    $.fn.scrollIntoView = function () {
        $('html, body').animate({
            scrollTop: $(this).position().top - 30
        }, 'fast');

        return this;
    };
}(jQuery);