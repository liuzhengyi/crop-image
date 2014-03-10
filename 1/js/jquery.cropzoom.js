
/*
CropZoom v1.0.4
Release Date: April 17, 2010

Copyright (c) 2010 Gaston Robledo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            if(opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    }
})(jQuery);

(function($){
    
     var _self = null;
     var $options = null;

     $.fn.cropzoom = function(options){
        
        $options = $.extend(true,$.fn.cropzoom.defaults, options); 
        
        return this.each(function() {  
            
            if($options.image.source == '' ||  $options.image.width == 0 || $options.image.height == 0){
                alert('You must set the source, witdth and height of the image element');
                return;
            }
            
            _self = $(this);
            _self.empty();
            _self.css({
                'width': $options.width,
                'height': $options.height,
                'background-color':$options.bgColor,
                'overflow':'hidden',
                'position':'relative',
                'border':'1px solid #666'
            });
            
            
            setData('image',{ 
                h: $options.image.height,
                w: $options.image.width,
                posY: 0,
                posX: 0,
                scaleX: 0,
                scaleY: 0,
                rotation: 0,
                source: $options.image.source
            });
            
           
            calculateFactor();
            getCorrectSizes();

            getData('image').posX = Math.abs(($options.width / 2) - (getData('image').w / 2));
            getData('image').posY = Math.abs(($options.height / 2) - (getData('image').h/ 2));
            
            setData('selector',{
                x : $options.selector.x,
                y : $options.selector.y,
                w : ($options.selector.maxWidth != null ? ($options.selector.w > $options.selector.maxWidth ? $options.selector.maxWidth : $options.selector.w) : $options.selector.w),
                h : ($options.selector.maxHeight != null ? ($options.selector.h > $options.selector.maxHeight ? $options.selector.maxHeight : $options.selector.h) : $options.selector.h)
            });
            var $svg = null;
            var $image = null;
            if(!$.browser.msie){
                $svg = _self[0].ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
                $svg.setAttribute('id', 'k');
                $svg.setAttribute('width', $options.width);
                $svg.setAttribute('height', $options.height);
                $svg.setAttribute('preserveAspectRatio', 'none');
                $image = _self[0].ownerDocument.createElementNS('http://www.w3.org/2000/svg','image');
                $image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', $options.image.source);
                $image.setAttribute('width', getData('image').w);
                $image.setAttribute('height', getData('image').h);
                $image.setAttribute('id', 'img_to_crop');
                $image.setAttribute('preserveAspectRatio', 'none');
                $($image).attr('x', 0);
                $($image).attr('y', 0);
                $svg.appendChild($image);
            }else{
                // Add VML includes and namespace
                _self[0].ownerDocument.namespaces.add('v', 'urn:schemas-microsoft-com:vml', "#default#VML");
                // Add required css rules
                var style = document.createStyleSheet();
                style.addRule('v\\:image', "behavior: url(#default#VML);display:inline-block");
                style.addRule('v\\:image', "antiAlias: false;");
                
                $svg = $("<div />").attr("id","k").css({
                    'width':$options.width,
                    'height':$options.height,
                    'position':'absolute' 
                });
                $image = document.createElement('v:image');
                $image.setAttribute('id','img_to_crop');
                $image.setAttribute('src',$options.image.source);
                $image.setAttribute('gamma','0');
                
                $($image).css({
                    'position':'absolute',
                    'left': 0,
                    'top': 0,
                    'width': getData('image').w,
                    'height':getData('image').h
                });
                $image.setAttribute('coordsize', '21600,21600');
                $image.outerHTML = $image.outerHTML;
                
                
                var ext = getExtensionSource();
                if(ext == 'png' || ext == 'gif')
                    $image.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+$options.image.source+"',sizingMethod='scale');"; 
                $svg.append($image);
            }
          _self.append($svg);  
          
          //Creamos el selector  
          createSelector();

          //Maintein Chaining 
          return this;
        });
        
     }
     
     // 获取扩展名
     function getExtensionSource(){
        var parts = $options.image.source.split('.');
        return parts[parts.length-1];    
     }
     
     
     // 计算...
     function calculateFactor(){  
        getData('image').scaleX = parseFloat($options.width / getData('image').w);
        getData('image').scaleY = parseFloat($options.height / getData('image').h); 
     }
     
     // 获取修正后的尺寸
     function getCorrectSizes(){
           
           var scaleX = getData('image').scaleX;
           var scaleY = getData('image').scaleY;
           if(scaleY < scaleX){
               getData('image').h = $options.height;
               getData('image').w = Math.round(getData('image').w * scaleY);
           }else{
               getData('image').h = Math.round(getData('image').h * scaleX); 
               getData('image').w = $options.width;        
           }
         
     }
     
     // 创建Selector !!
     function createSelector(){
        if($options.selector.centered){
           getData('selector').y = ($options.height / 2) - (getData('selector').h / 2);  
           getData('selector').x = ($options.width / 2) - (getData('selector').w / 2);  
        }
        var _selector = $('<div />').attr('id','selector').css({
            'width': getData('selector').w,
            'height': getData('selector').h,
            'top': getData('selector').y + 'px',
            'left': getData('selector').x + 'px',
            'border':'1px dashed ' + $options.selector.borderColor,
            'position':'absolute',
            'cursor':'move'
        }).mouseover(function(){
             $(this).css({
                'border':'1px dashed '+ $options.selector.borderColorHover
            })
         }).mouseout(function(){
             $(this).css({
                'border':'1px dashed '+ $options.selector.borderColor
            })
         });
        
        //Aplicamos el drageo al selector
        _selector.draggable({
            containment: _self,
            iframeFix: true,
            refreshPositions: true,
            drag: function(event,ui){
                //Actualizamos las posiciones de la mascara 
              getData('selector').x = ui.position.left;
              getData('selector').y = ui.position.top;
              if($options.onSelectorDrag != null)
                    $options.onSelectorDrag(_selector,getData('selector')); 
            },
            stop: function(event,ui){
                //Ocultar la mascara
                if($options.onSelectorDragStop != null)
                    $options.onSelectorDragStop(_selector,getData('selector'));
            } 
        });
        
        //Agregamos el selector al objeto contenedor
        _self.append(_selector);
     };
     
     function setData(key,data){
         _self.data(key,data);
     }
     function getData(key){
        return _self.data(key);
     }
     
     
     /*Code taken from jquery.svgdom.js */
    /* Support adding class names to SVG nodes. */
    var origAddClass = $.fn.addClass;

    $.fn.addClass = function(classNames) {
        classNames = classNames || '';
        return this.each(function() {
            if (isSVGElem(this)) {
                var node = this;
                $.each(classNames.split(/\s+/), function(i, className) {
                    var classes = (node.className ? node.className.baseVal : node.getAttribute('class'));
                    if ($.inArray(className, classes.split(/\s+/)) == -1) {
                        classes += (classes ? ' ' : '') + className;
                        (node.className ? node.className.baseVal = classes :
                            node.setAttribute('class',  classes));
                    }
                });
            }
            else {
                origAddClass.apply($(this), [classNames]);
            }
        });
    };

    /* Support removing class names from SVG nodes. */
    var origRemoveClass = $.fn.removeClass;

    $.fn.removeClass = function(classNames) {
        classNames = classNames || '';
        return this.each(function() {
            if (isSVGElem(this)) {
                var node = this;
                $.each(classNames.split(/\s+/), function(i, className) {
                    var classes = (node.className ? node.className.baseVal : node.getAttribute('class'));
                    classes = $.grep(classes.split(/\s+/), function(n, i) { return n != className; }).
                        join(' ');
                    (node.className ? node.className.baseVal = classes :
                        node.setAttribute('class', classes));
                });
            }
            else {
                origRemoveClass.apply($(this), [classNames]);
            }
        });
    };

    /* Support toggling class names on SVG nodes. */
    var origToggleClass = $.fn.toggleClass;

    $.fn.toggleClass = function(className, state) {
        return this.each(function() {
            if (isSVGElem(this)) {
                if (typeof state !== 'boolean') {
                    state = !$(this).hasClass(className);
                }
                $(this)[(state ? 'add' : 'remove') + 'Class'](className);
            }
            else {
                origToggleClass.apply($(this), [className, state]);
            }
        });
    };

    /* Support checking class names on SVG nodes. */
    var origHasClass = $.fn.hasClass;

    $.fn.hasClass = function(className) {
        className = className || '';
        var found = false;
        this.each(function() {
            if (isSVGElem(this)) {
                var classes = (this.className ? this.className.baseVal :
                    this.getAttribute('class')).split(/\s+/);
                found = ($.inArray(className, classes) > -1);
            }
            else {
                found = (origHasClass.apply($(this), [className]));
            }
            return !found;
        });
        return found;
    };

    /* Support attributes on SVG nodes. */
    var origAttr = $.fn.attr;

    $.fn.attr = function(name, value, type) {
        if (typeof name === 'string' && value === undefined) {
            var val = origAttr.apply(this, [name, value, type]);
            return (val && val.baseVal ? val.baseVal.valueAsString : val);
        }
        var options = name;
        if (typeof name === 'string') {
            options = {};
            options[name] = value;
        }
        return this.each(function() {
            if (isSVGElem(this)) {
                for (var n in options) {
                    this.setAttribute(n,
                        (typeof options[n] == 'function' ? options[n]() : options[n]));
                }
            }
            else {
                origAttr.apply($(this), [name, value, type]);
            }
        });
    };

    /* Support removing attributes on SVG nodes. */
    var origRemoveAttr = $.fn.removeAttr;

    $.fn.removeAttr = function(name) {
        return this.each(function() {
            if (isSVGElem(this)) {
                (this[name] && this[name].baseVal ? this[name].baseVal.value = '' :
                    this.setAttribute(name, ''));
            }
            else {
                origRemoveAttr.apply($(this), [name]);
            }
        });
    }; 

    function isSVGElem(node) {
        return (node.nodeType == 1 && node.namespaceURI == 'http://www.w3.org/2000/svg');
    }
    
    function getParameters(custom){
        var image = getData('image');
        var selector = getData('selector');
        var fixed_data = {
             'viewPortW': _self.width(),
             'viewPortH': _self.height(),
             'imageX':image.posX,
             'imageY': image.posY,
             //'imageRotate': image.rotation,
             'imageW': image.w,
             'imageH': image.h,
             'imageSource': image.source,
             'selectorX': selector.x,
             'selectorY': selector.y,
             'selectorW': selector.w,
             'selectorH': selector.h
        };
        return $.extend(fixed_data,custom);
    }
     
    /* Defaults */ 
     $.fn.cropzoom.defaults = {  
           width: 500,  
           height: 375,
           bgColor: '#000',
           overlayColor: '#000',    
           selector: {
               x:0,
               y:0,
               w:229,
               h:100,
               aspectRatio:false,
               centered:false,
               borderColor: 'yellow',
               borderColorHover: 'red',
               bgInfoLayer: '#FFF',
               infoFontSize: 10,
               infoFontColor: 'blue',
               showPositionsOnDrag: true,
               showDimetionsOnDrag: true,
               maxHeight:null,
               maxWidth:null
           },
           image: {source:'',rotation:0,width:0,height:0,minZoom:10,maxZoom:150},
           zoomSteps: 1,
           rotationSteps: 5,
           onSelectorDrag:null,
           onSelectorDragStop: null,
           onSelectorResize: null,
           onSelectorResizeStop: null,
           onZoom: null,
           onRotate:null,
           onImageDrag:null
           
     };
     
     $.fn.extend({
        //Function to set the selector position and sizes
        setSelector: function(x,y,w,h,animate){
            if(animate != undefined && animate == true){
                $('#selector').animate({
                    'top': y,
                    'left': x,
                    'width': w,
                    'height': h
                },'slow');
            }else{
                $('#selector').css({
                    'top': y,
                    'left': x,
                    'width': w,
                    'height': h
                });
            }
            setData('selector',{
                x: x,
                y: y,
                w: w,
                h: h
            });
        },
        //Restore the Plugin
        restore: function(){
             _self.empty();
             setData('image',{});
             setData('selector',{});
            _self.cropzoom($options);
            
        },
        //Send the Data to the Server
        send : function(url,type,custom,onSuccess){
             
             var response = "";
             $.ajax({
                 url : url,
                 type: type,
                 data: (getParameters(custom)),
                 success:function(r){ 
                    setData('imageResult',r);
                    if(onSuccess !== undefined && onSuccess != null)
                        onSuccess(r);
                 }
             });
         }  
     });

})(jQuery);
