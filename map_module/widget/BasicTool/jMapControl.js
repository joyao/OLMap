function initMapControlPage() {
    $.each(config_mapcontrol, function (index, item) {
        if (item.open) {
            $("#" + item.id).prop("checked", true);
        } else {
            $("#" + item.id).prop("checked", false);
        }
    });
}


$("#mapcontrolgrid input").click(function () {
    var checkboxid = $(this)[0].id;
    var config_index = config_mapcontrol.indexOf(config_mapcontrol.filter(i => i.id === checkboxid)[0]);
    console.log(checkboxid);
    if ($(this).prop("checked")) {
        // 開啟 Checked
        config_mapcontrol[config_index].open = true;
        openMapControlFunc(config_mapcontrol[config_index].id, config_mapcontrol[config_index].container, true);
    } else {
        config_mapcontrol[config_index].open = false;
        openMapControlFunc(config_mapcontrol[config_index].id, config_mapcontrol[config_index].container, false);
    }
});

function openMapControlFunc(id, container, open) {
    var zoomsliderControl = new ol.control.ZoomSlider();

    var mousePositionControl = new ol.control.MousePosition({
        //坐標格式
        coordinateFormat: new ol.coordinate.createStringXY(4),
        //坐標系統
        projection: 'EPSG:4326',
        //坐標資訊顯示樣式名稱
        className: 'custom-mouse-position',
        //顯示坐標的容器
        target: container,
        //未定義坐標的標記
        undefinedHTML: '&nbsp;'
    });

    var scaleLineControl = new ol.control.ScaleLine({
        units: "metric"
    });

    var overviewMapControl = new ol.control.OverviewMap({
        className: 'ol-overviewmap ol-custom-overviewmap',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: "https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}",
                    wrapX: false
                })
            })
        ],
        collapseLabel: '\u00BB',
        label: '\u00AB',
        collapsed: false
    });

    var fullscreenControl = new ol.control.FullScreen();

    if (open) {
        if (id === "showZoomSlider") {
            $("#map .ol-zoom .ol-zoom-out").css("margin-top", "204px");
            map.addControl(zoomsliderControl);
        } else if (id === "showMouseCoor") {
            map.addControl(mousePositionControl);
        } else if (id === "showScale") {
            map.addControl(scaleLineControl);
        } else if (id === "showEagleEye") {
            map.addControl(overviewMapControl);
        } else if (id === "showFullScreenBtn") {
            map.addControl(fullscreenControl);
        }
    } else {
        var controls = map.getControls(); // this is a ol.Collection
        controls.forEach(function (control) {
            if (id === "showZoomSlider" && control instanceof ol.control.ZoomSlider) {
                $("#map .ol-zoom .ol-zoom-out").css("margin-top", "");
                map.removeControl(control);
            } else if (id === "showMouseCoor" && control instanceof ol.control.MousePosition) {
                map.removeControl(control);
            } else if (id === "showScale" && control instanceof ol.control.ScaleLine) {
                map.removeControl(control);
            } else if (id === "showEagleEye" && control instanceof ol.control.OverviewMap) {
                map.removeControl(control);
            } else if (id === "showFullScreenBtn" && control instanceof ol.control.FullScreen) {
                map.removeControl(control);
            }
        });

    }

}

$("#showLayerSearch").click(function () {
    if ($(this).prop("checked")) {
        // 開啟 Checked
        initLayerSearchTable();
        $("#layersearchtable").show('fast');
    } else {
        $("#layersearchtable").hide('fast');
    }
});

function initLayerSearchTable() {
    var tablehtml = "";
    $.each(config_basemap, function (index, item) {
        if (item.id !== map.e_getBasemap().id) {
            tablehtml += '<tr id="' + item.id + '_SearchTable"><td>' + item.name + '</td><td class="center aligned"><div class="ui fitted radio checkbox"><input type="radio" name="left" onclick="selectSearchLyr(this)"><label></label></div></td></tr>';
        }
    });
    $("#layersearchtable tbody").html(tablehtml);
}

function selectSearchLyr(checkbox) {
    if ($(checkbox).prop("checked")) {
        map.e_changeBasemap(map.e_getBasemap().id);
        // 開啟 Checked
        var searchlytid = $(checkbox).parents("tr")[0].id.replace("_SearchTable", "");
        //圈裡面圖層的順序要在後面
        map.e_getLayer(searchlytid).setZIndex(1);
        map.e_getLayer(searchlytid).setVisible(true);
        openLayerSearchFunc(searchlytid);
    }
}

function openLayerSearchFunc(searchlyrid) {
    var imagery = map.e_getLayer(searchlyrid);
    var container = document.getElementById('map');
    var radius = 75;
    document.addEventListener('keydown', function (evt) {
        if (evt.which === 38) {
            radius = Math.min(radius + 5, 150);
            map.render();
            evt.preventDefault();
        } else if (evt.which === 40) {
            radius = Math.max(radius - 5, 25);
            map.render();
            evt.preventDefault();
        }
    });

    var mousePosition = null;

    var RespondMouseOver = function (event) {
        mousePosition = map.getEventPixel(event);
        map.render();
    };

    var RespondMouseOut = function (event) {
        mousePosition = null;
        map.render();
    };

    container.addEventListener('mousemove', RespondMouseOver);

    container.addEventListener('mouseout', RespondMouseOut);

    var RespondPreRender = function (event) {
        var ctx = event.context;
        ctx.save();
        ctx.beginPath();
        if (mousePosition) {
            // only show a circle around the mouse
            var pixel = ol.render.getRenderPixel(event, mousePosition);
            var offset = ol.render.getRenderPixel(event, [mousePosition[0] + radius, mousePosition[1]]);
            var canvasRadius = Math.sqrt(Math.pow(offset[0] - pixel[0], 2) + Math.pow(offset[1] - pixel[1], 2));
            ctx.arc(pixel[0], pixel[1], canvasRadius, 0, 2 * Math.PI);
            ctx.lineWidth = 5 * canvasRadius / radius;
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.stroke();
        }
        ctx.clip();
    };

    var RespondPostRender = function (event) {
        var ctx = event.context;
        ctx.restore();
    };

    imagery.on('prerender', RespondPreRender);

    // after rendering the layer, restore the canvas context
    imagery.on('postrender', RespondPostRender);

    $("#showLayerSearch").click(function () {
        if ($(this).prop("checked") === false) {
            container.removeEventListener('mousemove', RespondMouseOver);
            container.removeEventListener('mouseout', RespondMouseOut);
            imagery.un('prerender', RespondPreRender);
            imagery.un('postrender', RespondPostRender);
            map.e_changeBasemap(map.e_getBasemap().id);
        }
    });

}