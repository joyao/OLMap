<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="map.aspx.cs" Inherits="OLMap.map" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=11;IE=10;IE=9;IE=8;IE=7;" />
    <title>OpenLayers Demo</title>
    <link type="text/css" href="css/Plug_in/bootstrap.min.css" rel="stylesheet" />
    <link type="text/css" href="css/Plug_in/semantic.min.css" rel="stylesheet" />
    <link type="text/css" href="css/Plug_in/jquery-ui.min.css" rel="stylesheet" />
    <link type="text/css" href="css/ol.css" rel="stylesheet" />
    <link type="text/css" href="css/base.css" rel="stylesheet" />
    <link type="text/css" href="css/main.css" rel="stylesheet" />
    <style>
    </style>
    <script type="text/javascript" src="js/ol.js"></script>
    <script type="text/javascript" src="js/Plug_in/jquery-3.5.1.js"></script>
    <script type="text/javascript" src="js/Plug_in/popper.min.js"></script>
    <script type="text/javascript" src="js/Plug_in/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/Plug_in/semantic.min.js"></script>
    <script type="text/javascript" src="js/Plug_in/jquery-ui.min.js"></script>
    <script type="text/javascript" src="js/Plug_in/proj4.js"></script>
    <script type="text/javascript" src="js/helper.js"></script>
    <script type="text/javascript" src="js/init.js"></script>
    <script type="text/javascript" src="js/ol_extend.js"></script>
    <script type="text/javascript" src="js/GraphicTrans.js"></script>
</head>
<body>
    <form id="form1" runat="server">
        <div id="header">
            <a class="logo">
                <span>OpenLayers Demo</span>
            </a>
            <a style="float: right;color: white;margin-top: 20px;margin-right: 20px;">使用者：<span id="useridshow"></span></a>
            <div id="mouse-position" style="color: white; position: absolute; right: 20px; bottom: 2px;"></div>
        </div>
        <div id="content">
            <div class="leftsidebar_box">
                <%--<div class="line"></div>--%>
                <dl class="control">
                    <dt class="first_dt">基本功能<img src="images/left/select_xl01.png" /></dt>
                    <dd onclick="loadFuncPage('Basemap.html','map_module/widget/BasicTool/Basemap.html')">切換底圖</dd>
                    <dd onclick="loadFuncPage('MapControl.html','map_module/widget/BasicTool/MapControl.html')">圖面顯示功能</dd>
                    <dd onclick="loadFuncPage('MapMeasure.html','map_module/widget/BasicTool/MapMeasure.html')">量測工具</dd>
                </dl>
                <dl class="data">
                    <dt class="first_dt">進階功能<img src="images/left/select_xl01.png" /></dt>
                    <dd onclick="loadFuncPage('TOC.html','map_module/widget/AdvanceTool/TOC.html')">圖層列表</dd>
                    <dd onclick="loadFuncPage('Locate.html','map_module/widget/AdvanceTool/Locate.html')">圖面空間定位</dd>
                    <dd onclick="loadFuncPage('ExportMap.html','map_module/widget/AdvanceTool/ExportMap.html')">地圖列印</dd>
                </dl>
                <dl class="drawing">
                    <dt class="first_dt">專家功能模組<img src="images/left/select_xl01.png" /></dt>
                    <dd onclick="loadFuncPage('WaterLevel.html','map_module/widget/ExpertModule/WaterLevel.html')">河川水位查詢</dd>
                    <dd onclick="loadFuncPage('Draw.html','map_module/widget/ExpertModule/Draw.html')">繪圖工具</dd>
                    <dd onclick="loadFuncPage('GPS.html','map_module/widget/ExpertModule/GPS.html')">GPS三維形變查詢</dd>
                </dl>
<%--                <dl class="ogc">
                    <dt>功能類別4<img src="images/left/select_xl01.png" /></dt>
                    <dd onclick="loadFuncPage('func1','class4')">功能類別4_模組1</dd>
                    <dd onclick="loadFuncPage('func2','class4')">功能類別4_模組2</dd>
                    <dd onclick="loadFuncPage('func3','class4')">功能類別4_模組3</dd>
                </dl>
                <dl class="label">
                    <dt>功能類別5<img src="images/left/select_xl01.png" /></dt>
                    <dd onclick="loadFuncPage('func1','class5')">功能類別5_模組1</dd>
                    <dd onclick="loadFuncPage('func2','class5')">功能類別5_模組2</dd>
                    <dd onclick="loadFuncPage('func3','class5')">功能類別5_模組3</dd>
                </dl>
                <dl class="others">
                    <dt>功能類別6<img src="images/left/select_xl01.png" /></dt>
                    <dd onclick="loadFuncPage('func1','class5')">功能類別6_模組1</dd>
                    <dd onclick="loadFuncPage('func2','class5')">功能類別6_模組2</dd>
                    <dd onclick="loadFuncPage('func3','class5')">功能類別6_模組3</dd>
                </dl>--%>
            </div>
            <div id="code_wrapper">
                <div id="code_arrow" class="">
                    <span title="顯示功能頁">›</span>
                    <p title="隱藏功能頁">‹</p>
                </div>
                <div id="funcpage">
                </div>

            </div>
            <div id="map"></div>
            <div id="popup"></div>
            <script type="text/javascript">
                localStorage["token"] = "<%=Session["token"]%>";
                localStorage["username"] = "<%=Session["username"]%>";
                $("#useridshow").html(localStorage["username"]);
                //var basemaplayer = new ol.layer.Tile({
                //    source: new ol.source.OSM()
                //});
                //var map = new ol.Map({
                //    view: new ol.View({
                //        center: [13450000, 2700000],
                //        zoom: 8
                //    }),
                //    layers: [basemaplayer],
                //    target: 'map',
                //    //加載圖磚動畫效果
                //    loadTilesWhileAnimating: true
                //});
                //var zoomslider = new ol.control.ZoomSlider();
                //map.addControl(zoomslider);
                var map;
                var basemapArray = [];
                var TOCArray = [];
                loadBasemap();
            </script>
            <script>
                Date.prototype.Format = function (fmt) { //author: meizz 
                    var o = {
                        "M+": this.getMonth() + 1, //月份 
                        "d+": this.getDate(), //日 
                        "h+": this.getHours(), //小时 
                        "m+": this.getMinutes(), //分 
                        "s+": this.getSeconds(), //秒 
                        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
                        "S": this.getMilliseconds() //毫秒 
                    };
                    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                    for (var k in o)
                        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    return fmt;
                }
            </script>
        </div>
    </form>

</body>
</html>
