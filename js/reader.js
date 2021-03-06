(function(){
    var Util = (function(){
        //H5数据存储
        var prefix = "html5_reader_";
        var StorageGetter = function(key){
            return localStorage.getItem(prefix + key);
        }
        var StorageSetter = function(key,val){
            return localStorage.setItem(prefix + key,val);
        }
        //获取加密后的JSON数据（Base64插件和JSONP）
        var getBSONP = function(url,callback){
            return $.jsonp({
               url: url,
               cache: true,
               callback: "duokan_fiction_chapter",
               success: function(result){
                   var data = $.base64.decode(result);  //解码
                   var json = decodeURIComponent(escape(data)); 
                   callback(json);
               }
            });
        }
        return {
            getBSONP: getBSONP,
            StorageGetter: StorageGetter,
            StorageSetter: StorageSetter
        }
    })();
    
    var Dom = {
        top_nav: $("#top-nav"),
        bottom_nav: $(".bottom_nav"),
        font_btn: $("#font_btn"),
        font_container: $(".font-container")
    };
    var Win = $(window);
    var Doc = $(document);
    var RootContainer = $("#fiction_chapter_container");
    
    //初始字号
    var initFontSize = Util.StorageGetter("font_size");
    initFontSize = parseInt(initFontSize);
    if(!initFontSize){
        initFontSize = 14;
    }
    RootContainer.css("font-size",initFontSize);
    
    //初始背景色
    var initReaderBg = Util.StorageGetter("data_bg");
    if(!initReaderBg){
         initReaderBg = 1;
         $(".defalut").addClass("add-border-bg");
    }
    $(".container").attr("data-bg",initReaderBg);
    $(".reader-font-bg a").eq(initReaderBg-1).addClass("add-border-bg").siblings().removeClass("add-border-bg");
    //1,2,3,4,5,0   0,1,2,3,4,-1(最后一个元素往回计数)
    
    //初始昼夜模式切换
    var initDayNight = Util.StorageGetter("data_day_night");
    if(!initDayNight){
         initDayNight = 0;
         $(".night").removeClass("display-none").siblings().addClass("display-none");
    }
    $(".container").attr("data-night",initDayNight);
    if(initDayNight == 0){
        $(".night").removeClass("display-none").siblings().addClass("display-none");
    }else{
        $(".night").addClass("display-none").siblings().removeClass("display-none");
    }
    
    
    
    function main(){
        //应用程序入口
        var readerModel = ReaderModel();
        var readerUI = ReaderBaseFrame(RootContainer);
        readerModel.init(function(data){
            readerUI(data);
        });
        EventHanlder();
    }
    
    function ReaderModel(){
        //数据交互
        //获取章节列表信息
        var Chapter_id;
        //初始化及渲染数据
        var init = function(UIcallback){
            getFictionInfo(function(){
                getCurChapterContent(Chapter_id,function(data){
                    UIcallback && UIcallback(data);
                });
            })
        }
        var getFictionInfo = function(callback){
            $.get("data/chapter.json",function(data){
                //获取章节信息后的回调
                Chapter_id = data.chapters[1].chapter_id;
                callback && callback();
            },"json")
        }
        
        //获取章节内容
        var getCurChapterContent = function(chapter_id,callback){
            $.get("data/data" + chapter_id + ".json",function(data){
                //判断服务器状态
                if(data.result == 0){
                    var url = data.jsonp;
                    Util.getBSONP(url, function(data){
                        callback && callback(data);
                    });
                }
            },"json")
        }
        return {
            init: init
        }
    }
    
    function ReaderBaseFrame(container){
        //渲染UI
        function parseChapterData(jsonData){
            var jsonObj = JSON.parse(jsonData);
            var html = "<h4>" + jsonObj.t + "</h4>";
            for(var i=0; i<jsonObj.p.length; i++){
                html += "<p>" + jsonObj.p[i] + "</p>";
            }
            return html;
        }
        return function(data){
            container.html(parseChapterData(data));
        }
    }
    
    function EventHanlder(){
        
        //交互的事件绑定
        $("#action-mid").click(function(){
            if(Dom.top_nav.css("display") == "none"){
                Dom.bottom_nav.show();
                Dom.top_nav.show();
            }else{
                Dom.bottom_nav.hide();
                Dom.top_nav.hide();
                Dom.font_container.hide();
                $(".icon-font-size").removeClass("display-none");
                $(".icon-font-size-hlight").addClass("display-none");
            }
        });
        
        //页面滚动隐藏边栏
        Win.scroll(function(){
            Dom.bottom_nav.hide();
            Dom.top_nav.hide();
            Dom.font_container.hide();
            $(".icon-font-size").removeClass("display-none");
            $(".icon-font-size-hlight").addClass("display-none");
        });
        
        //唤出字体面板
        Dom.font_btn.click(function(){
            if(Dom.font_container.css("display") == "none"){
                Dom.font_container.show();
                $(".icon-font-size").addClass("display-none");
                $(".icon-font-size-hlight").removeClass("display-none");
            }else{
                Dom.font_container.hide();
                $(".icon-font-size").removeClass("display-none");
                $(".icon-font-size-hlight").addClass("display-none");
            }
        });
        
        //字号放大缩小
        $("#large-font").click(function(){
            if(initFontSize > 20){
                return;
            }
            initFontSize += 1;
            RootContainer.css("font-size",initFontSize);
            Util.StorageSetter("font_size",initFontSize);
        });
        $("#small-font").click(function(){
            if(initFontSize < 12){
                return;
            }
            initFontSize -= 1;
            RootContainer.css("font-size",initFontSize);
            Util.StorageSetter("font_size",initFontSize);
        });
        
        //文本背景色切换
        $(".reader-font-bg a").click(function(){
            $(this).addClass("add-border-bg").siblings().removeClass("add-border-bg");
            $(".container").attr("data-bg",$(this).attr("data-bg"));
            initReaderBg =  $(".container").attr("data-bg");
            Util.StorageSetter("data_bg",initReaderBg);
        });

        //触发昼夜模式切换
        $("#day-night").click(function(){
            if($(".night").hasClass("display-none")){
                $(".night").removeClass("display-none").siblings().addClass("display-none");
                $(".container").attr("data-night",0);
            }else{
                $(".night").addClass("display-none").siblings().removeClass("display-none");
                $(".container").attr("data-night",1);
            }
            initDayNight = $(".container").attr("data-night");
            Util.StorageSetter("data_day_night",initDayNight);
        });
    
    }
    
    
    main();
    
    })();