﻿!function(window, $, undefined) {
    'use strict';

    $.fn.hints = function(enabled){
        return this.each(function(){
            var elements = $(this).find('[data-hint][data-hint!=""]'), // non-empty hints
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
        return function(target){
            target.each(function() {
                var self = $(this);
                self[effect]('fast', function() {
                    self.remove();
                    (then || $.noop)();
                });
            });
        };
    }

    $.fn.fadeOutAndRemove = function(then) {
        doThisAndRemove('fadeOut',then)(this);
    };

    $.fn.slideUpAndRemove = function(then) {
        doThisAndRemove('slideUp',then)(this);
    };

    $.fn.flash = function(opts) {
        if (typeof opts === 'string') {
            opts = { color: opts };
        }

        var defaults = { color: '#000', duration: 500 },
            settings = $.extend({}, defaults, opts),
            half = settings.duration / 2;

        return this.each(function() {
            var self = $(this),
                original = self.css('backgroundColor');

            if(!self.is(':animated')){
                self.animate({ backgroundColor: settings.color }, half)
                    .animate({ backgroundColor: original }, half, function(){
                        self.css('backgroundColor', ''); // remove inline style
                    });
            }
        });
    };
}(window, jQuery);