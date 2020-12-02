var config_basemap = [
    {
        id: "OSM", name: "OpenStreetMap", image: "OSM_MAP.png", type: "ol", opacity: 1, initVisible: true, urls: [
            {
                name: "OSM", parm: {

                }
            }]
    }, {
        id: "Bing", name: "Bing地圖", image: "Bing_MAP.png", type: "ol", opacity: 1, initVisible: false, urls: [
            {
                name: "BingMaps", parm: {
                    key: "Q57tupj2UBsQNQdju4xL~xBceblfTd6icjljunbuaCw~AhwA-whmGMsfIpVhslZyknWhFYq-GvWJZqBnqV8Zq1uRlI5YM_qr7_hxvdgnU7nH",
                    imagerySet: 'Road'
                }
            }]
    }, {
        id: "EMap", name: "通用版電子地圖", image: "EMap_MAP.png", type: "ol", opacity: 1, initVisible: false, urls: [
            {
                name: "XYZ", parm: {
                    url: "https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}",
                    wrapX: false
                }
            }]
    }, {
        id: "OrthoPhoto", name: "正射影像圖(通用版)", image: "OrthoPhoto_MAP.png", type: "ol", opacity: 1, initVisible: false, urls: [
            {
                name: "XYZ", parm: {
                    url: "https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}",
                    wrapX: false
                }
            }]
    }, {
        id: "CartoDB", name: "CartoDB地圖", image: "CartoDB_MAP.png", type: "ol", opacity: 1, initVisible: false, urls: [
            {
                name: "XYZ", parm: {
                    url: "https://{1-4}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png",
                    wrapX: false
                }
            }]
    }, {
        id: "CartoDB_Dark", name: "CartoDB地圖(深色)", image: "CartoDB_Dark_MAP.png", type: "ol", opacity: 1, initVisible: false, urls: [
            {
                name: "XYZ", parm: {
                    url: "https://{1-4}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
                    wrapX: false
                }
            }]
    }, {
        id: "CartoDB_Antique", name: "CartoDB地圖(仿古)", image: "CartoDB_Antique_MAP.png", type: "ol", opacity: 1, initVisible: false, urls: [
            {
                name: "XYZ", parm: {
                    url: "https://cartocdn_{a-d}.global.ssl.fastly.net/base-antique/{z}/{x}/{y}.png",
                    wrapX: false
                }
            }]
    }, {
        id: "Tianditu", name: "天地圖", image: "Tianditu_MAP.png", type: "ol", opacity: 1, initVisible: false, urls: [
            {
                name: "XYZ", parm: {
                    url: "http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=3bc6874f2b919aa581635abab7759a3f",
                    wrapX: false
                }
            }]
    }
];

var config_mapcontrol = [
    {
        id: "showZoomSlider",
        container: "",
        open: false
    }, {
        id: "showMouseCoor",
        container: "mouse-position",
        open: false
    }, {
        id: "showScale",
        container: "",
        open: false
    }, {
        id: "showEagleEye",
        container: "",
        open: false
    }, {
        id: "showFullScreenBtn",
        container: "",
        open: false
    }
];

var config_WSLayerResource = "WS/LayerService.asmx";
var config_OLMapWebAPI = "http://localhost/OLMapAPI/api";

$(".leftsidebar_box dt img").attr("src", "images/left/select_xl01.png");
$(function () {
    $(".leftsidebar_box dd").hide(); //隱藏
    /**系统預設顯示第一個目錄類別**/
    $(".first_dt").parent().find('dd').show(); // 預設顯示第一個目錄
    $(".first_dt img").attr("src", "images/left/select_xl.png"); //當前焦點第一層目錄圖示
    $(".first_dt").css({ "background-color": "#23272c9e" }); // 焦點第一層目錄的樣式
    /**第一層目錄點擊事件**/
    $(".leftsidebar_box dt").click(function () {
        if ($(this).parent().find('dd').is(":hidden")) {
            $(this).parent().find('dd').slideToggle();
            $(this).css({ "background-color": "#23272c9e" }); //焦點第一層目錄背景顏色             
            $(this).parent().find('img').attr("src", "images/left/select_xl.png");
        }
        else {
            $(this).parent().find('dd').slideUp();
            $(this).css({ "background-color": "#1b1c1d" }); //非焦點第一層目錄背景顏色 
            $(this).parent().find('img').attr("src", "images/left/select_xl01.png");
        }
    });

    /**第二層目錄點擊事件**/
    $(".leftsidebar_box dd").click(function () {
        $(".leftsidebar_box dd").css({ "background-color": "#4c4e5a", "color": "#f5f5f5" }); //第二層目錄背景顏色
        $(this).css({ "background-color": "#4c4e5a", "color": "#ffb308" }); //選中的第二層目錄背景顏色
    });

});

//第二層功能頁面載入顯示
function loadFuncPage(name, path) {
    var pageName = name;
    var htmlUrl = path;
    //$("#funcpage").html("<iframe src='" + path + "' style='width:100%;height:100%'>");
    //if ($('#code_arrow').hasClass('go_back') === false) {
    //    togglefunctab();
    //}
    if (checkBeforeLoad()) {
        $.ajax({
            url: path,
            type: 'GET',
            dataType: 'html',
            error: function () { alert('error'); },
            success: function (data) {
                $("#funcpage").html(data);
                if ($('#code_arrow').hasClass('go_back') === false) {
                    togglefunctab();
                }
            }
        });
    }

}


$(function () {
    $('#code_arrow').click(function () {
        togglefunctab();
    });
});

function togglefunctab() {
    var iCodeWidth = 330;
    var oArrow = $('#code_arrow');
    var oCodeCore = $('#funcpage');
    var oIframeWrapper = $('div.iframe_wrapper');
    var iIframeMargin = parseInt(oIframeWrapper.css('margin-left'));
    if (oArrow.hasClass('go_back')) {
        oCodeCore.animate({ width: 0 });
        oIframeWrapper.animate({ marginLeft: iIframeMargin - iCodeWidth });
        oArrow.removeClass('go_back');
    } else {
        oCodeCore.animate({ width: iCodeWidth });
        oIframeWrapper.animate({ marginLeft: iIframeMargin });
        oArrow.addClass('go_back');
    }
}

function loadBasemap() {
    $.each(config_basemap, function (index, item) {
        var basemap_parm = item.urls[0];
        var layer = eval("new ol.layer.Tile({ \
                source: new ol.source."+ basemap_parm.name + "(" + JSON.stringify(basemap_parm.parm) + ") \
            })");
        layer.setOpacity(item.opacity);
        layer.setVisible(item.initVisible);
        layer.id = item.id;
        basemapArray.push(layer);

    });
    map = new ol.Map({
        view: new ol.View({
            center: [13450000, 2700000],
            zoom: 8
        }),
        layers: basemapArray,
        target: 'map',
        //加載圖磚動畫效果
        loadTilesWhileAnimating: true,
        pixelRatio: window.devicePixelRatio,
        controls: new ol.control.defaults({
            attributionOptions: {
                collapsible: true
            }
        })
    });
    //var zoomslider = new ol.control.ZoomSlider();
    //map.addControl(zoomslider);

    // 建立popup
    var popup = new ol.Overlay({
        element: document.getElementById('popup')
    });
    map.addOverlay(popup);

    // display popup on click
    map.on('click', function (evt) {
        var element = popup.getElement();
        $(element).popover('dispose');
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                return feature;
            });
        // 若只抓水位資料圖層顯示popup
        if (map.e_getLayer("weterlevelLyr") != undefined) {
            if (Object.values(map.e_getLayer("weterlevelLyr")?.getSource().getFeatures()).indexOf(feature) >= 0) {
                //if (feature) {
                //var coordinates = feature.getGeometry().getCoordinates();
                //popup.setPosition(coordinates);
                popup.setPosition(evt.coordinate);
                //加了container，popup才會跟著地圖走
                $(element).popover({
                    container: element,
                    placement: 'top',
                    animation: false,
                    html: true,
                    content: feature.info === undefined ? "無資訊" : feature.info
                });
                $(element).popover('show');
            } else {
                $(element).popover('dispose');
            }
        }

    });

    // change mouse cursor when over marker
    map.on('pointermove', function (e) {
        var element = popup.getElement();
        if (e.dragging) {
            $(element).popover('dispose');
            return;
        }
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        map.getViewport().style.cursor = hit ? 'pointer' : '';
    });
}

function checkBeforeLoad() {
    var status = false;
    if ($("#showLayerSearch").prop("checked")) {
        alert("請先關閉圖層探查功能！");
        status = false;
    } else {
        status = true;
    }
    return status;
}

function ajaxError(jqXHR, exception) {
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'Not connect.\n Verify Network.';
    } else if (jqXHR.status === 404) {
        msg = 'Requested page not found. [404]';
    } else if (jqXHR.status === 500) {
        msg = 'Internal Server Error [500].';
    } else if (exception === 'parsererror') {
        msg = 'Requested JSON parse failed.';
    } else if (exception === 'timeout') {
        msg = 'Time out error.';
    } else if (exception === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    alert(msg);
}