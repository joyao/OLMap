var locate = function () {
    // 填充
    var fill = new ol.style.Fill({
        color: 'rgba(255,255,255,0.4)'
    });

    // 線條
    var stroke = new ol.style.Stroke({
        color: '#cc3333',
        width: 2
    });

    // 設定樣式
    var styles = [
        new ol.style.Style({
            image: new ol.style.Circle({
                fill: fill,
                stroke: stroke,
                radius: 5
            }),
            fill: fill,
            stroke: stroke
        })
    ];

    var locateXYLyr;

    function checkLayerValid() {
        if (map.e_getLayer("locateXYLyr") === undefined) {
            locateXYLyr = new ol.layer.Vector({
                source: new ol.source.Vector({
                })
            });
            locateXYLyr.id = "locateXYLyr";
            map.addLayer(locateXYLyr);
        } else {
            locateXYLyr = map.e_getLayer("locateXYLyr");
            locateXYLyr.getSource().clear();
        }
    }

    function getCountyList() {
        $("#ddl_County").html('<option value="">請選擇</option>');
        $.ajax({
            type: "POST",
            url: config_WSLayerResource + "/getCountyList",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (d) {
                var data = $.parseJSON(d.d);
                $.each(data, function (index, item) {
                    $("#ddl_County").append('<option value="' + item.geom + '">' + item.countyname + '</option>');
                });
            },
            error: function (jqXHR, exception) {
                ajaxError(jqXHR, exception);
            }
        });
    }

    function locateXY() {
        console.log("locateXY");
        var coorepsg = $("#locatexy_epsg").val();
        var locatexy_x = parseFloat($("#locatexy_x").val());
        var locatexy_y = parseFloat($("#locatexy_y").val());
        if (isNaN(locatexy_x) === false && isNaN(locatexy_y) === false) {
            var pointfeature = new ol.Feature({
                geometry: new ol.geom.Point([locatexy_x, locatexy_y])
            });
            if (coorepsg === "epsg3826") {
                pointfeature = helper.transOlGeometry_3826to3857(pointfeature);
            } else if (coorepsg === "epsg4326") {
                pointfeature = helper.transOlGeometry_4326to3857(pointfeature);
            } else if (coorepsg === "epsg3857") {
                pointfeature = pointfeature;
            }
            pointfeature.setStyle(styles);

            locate.checkLayerValid();
            locateXYLyr.getSource().addFeature(pointfeature);
            map.e_centerAndZoom(pointfeature, 5);
            //map.getView().animate({
            //    center: pointfeature.getGeometry().getCoordinates(),
            //    zoom: 14,
            //    padding: [80, 30, 80, 350]
            //});
        } else {
            alert("請輸入正確格式之坐標");
        }
    }

    function locateCounty() {
        var wkt_county = $("#ddl_County").val();
        var format = new ol.format.WKT();
        var Countyfeature = format.readFeature(wkt_county, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        Countyfeature.setStyle(styles);
        locate.checkLayerValid();
        locateXYLyr.getSource().addFeature(Countyfeature);
        map.getView().fit(Countyfeature.getGeometry(), { padding: [80, 30, 80, 350] });
    }

    function getRoadIDList(dom) {
        $("#ddl_RoadName").html("");
        $("#ddl_RoadName").parent().addClass("loading");
        $.ajax({
            type: "GET",
            url: "https://gist.motc.gov.tw/gist_api/V3/Map/Basic/RoadClass/" + dom.value,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                $.each(data, function (index, item) {
                    $("#ddl_RoadName").append('<option value="' + item.RoadID + '">' + item.RoadName + '</option>');
                });
                $("#ddl_RoadName").parent().removeClass("loading");
            },
            error: function (jqXHR, exception) {
                ajaxError(jqXHR, exception);
            }
        });
    }

    function locateRoadMile() {
        console.log("locateRoadMile");
        var RoadClass = $("#ddl_RoadClass").val();
        var RoadID = $("#ddl_RoadName").val();
        var Mileage = $("#input_Mileage").val();
        if (RoadID !== "" && Mileage !== "") {
            $.ajax({
                type: "GET",
                url: "https://gist.motc.gov.tw/gist_api/V3/Map/GeoCode/Coordinate/RoadClass/" + RoadClass + "/RoadID/" + RoadID + "/Mileage/" + Mileage + "?$format=GEOJSON",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    var roadmilefeature = (new ol.format.GeoJSON()).readFeatures(data);
                    var roadmilefeature3857 = roadmilefeature.map(f => {
                        var tmepf = helper.transOlGeometry_4326to3857(f);
                        tmepf.setStyle(styles);
                        return tmepf;
                    });
                    locate.checkLayerValid();
                    locateXYLyr.getSource().addFeatures(roadmilefeature3857);
                    map.e_centerAndZoom(roadmilefeature3857[0], 5);
                    //map.getView().animate({
                    //    center: roadmilefeature3857[0].getGeometry().getCoordinates(),
                    //    zoom: 14,
                    //    padding: [80, 30, 80, 500]
                    //});
                },
                error: function (jqXHR, exception) {
                    ajaxError(jqXHR, exception);
                }
            });
        } else {
            alert("請輸入正確格式之道路資訊");
        }
    }

    return {
        checkLayerValid: checkLayerValid,
        getCountyList: getCountyList,
        locateXY: locateXY,
        locateCounty: locateCounty,
        getRoadIDList: getRoadIDList,
        locateRoadMile: locateRoadMile
    };
}();