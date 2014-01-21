var widgetPages = widgetPages || {};

(function(){
    var PaintToolView /* = widgetPages.PaintToolView */ = function(){
        this.tpl = ''
        + '<div class="wrapper">'
        + '  <form name="tools" id="tool-form">'
        + '  </form>'
        + '</div>';
    };
    PaintToolView.prototype = Object.create(widgetPages.View.prototype);
    PaintToolView.prototype.constructor = PaintToolView;
    PaintToolView.prototype.render = function(){
        this.apply()._render();
        this.renderList();
        return this.$el;
    };
    PaintToolView.prototype.renderList = function(){
        for (var i in PaintToolView.toolList) {
            var tool = PaintToolView.toolList[i];
            var $span = $('<label class="tool-picker clickable"></label>');
            var $radio = $('<input type="radio" name="draw-tool">');
            $radio.attr({value: tool.name});
            if (tool.checked) $radio.attr({checked:true});
            var $img = $('<img>').attr({src: tool.icon});

            this.$el.find('#tool-form').append($span.append($radio, $img));
        };
    };
    PaintToolView.toolList = [
        {name:'Rect',icon:'../img/square.png',checked:true},
        {name:'Curve',icon:'../img/pencil.png'}
    ];
    var CaptureView = widgetPages.CaptureView = function(){
        this.toolView = new PaintToolView();
        this.tpl = ''
        +'<div>'
        +'  <div id="tools">'
        +'  </div>'
        +'  <div>'
        +'    <canvas id="canvas" width="600" height="480"></canvas>'
        +'  </div>'
        +'  <div>'
        +'    <small id="filename">{{fileName}}</samll><br>'
        +'    <input type="submit" id="download" value="ダウンロード"/>'
        +'    <small>ファイル名は設定から変更可能です</small><a id="download-anchor" download="{{fileName}}" href=""></a>'
        +'  </div>'
        +'</div>';
        this.events = {
            'click #download': 'downloadCurrentImage'
        };
        this.canvasApp = null;
    };
    CaptureView.prototype = Object.create(widgetPages.View.prototype);
    CaptureView.prototype.constructor = CaptureView;
    CaptureView.prototype.render = function(){
        this.apply({
            fileName: Util.getCaptureFilename()
        })._render();
        this.$el.find('#tools').append(this.toolView.render());
        this.imgURI = Util.parseQueryString()['uri'];
        return this.$el;
    };
    CaptureView.prototype.startApp = function() {
        this.canvasApp = KanColleWidget.Canvas.initWithURI(this.imgURI);
        this.canvasApp.listen();
    };
    CaptureView.prototype.downloadCurrentImage = function(ev, self) {
        var format = 'image/' + Config.get('capture-image-format');
        $('a#download-anchor').attr('href', this.canvasApp.toDataURL(format))
        $('a#download-anchor')[0].click();
    };
})();
