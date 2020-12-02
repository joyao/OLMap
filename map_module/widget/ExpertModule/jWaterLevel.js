var waterlevel = function () {
    var stationObj;
    var RealTimeInfoObj;

    return {
        getWeterLevelData: function () {
            $("#waterlevelLoadingInfo i").addClass("loading");
            $("#waterlaveltable").html("");
            $("#waterlevelTime").html("");
            waterlevel.checkLayerValid();
            $.ajax({
                type: "GET",
                url: "https://fhy.wra.gov.tw/WraApi/v1/Water/Station?$orderby=Address",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (d) {
                    stationObj = d;


                    $.ajax({
                        type: "GET",
                        url: "https://fhy.wra.gov.tw/WraApi/v1/Water/RealTimeInfo?$orderby=StationNo",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (dw) {
                            RealTimeInfoObj = dw;
                            RealTimeInfoObj.forEach(function (item, index) {
                                var spobj = stationObj.filter(k => k.StationNo === item.StationNo);
                                if (spobj.length > 0) {
                                    var keyarr = Object.keys(spobj[0]);
                                    for (let i = 0; i < keyarr.length; i++) {
                                        RealTimeInfoObj[index][keyarr[i]] = spobj[0][keyarr[i]];
                                    }
                                }
                            });
                            waterlevel.showData(RealTimeInfoObj, 'waterlaveltable');
                        },
                        error: function (jqXHR, exception) {
                            ajaxError(jqXHR, exception);
                        }
                    });
                },
                error: function (jqXHR, exception) {
                    ajaxError(jqXHR, exception);
                }
            });
        },
        checkLayerValid: function () {
            if (map.e_getLayer("weterlevelLyr") === undefined) {
                weterlevelLyr = new ol.layer.Vector({
                    source: new ol.source.Vector({
                    })
                });
                weterlevelLyr.id = "weterlevelLyr";
                map.addLayer(weterlevelLyr);
            } else {
                weterlevelLyr = map.e_getLayer("weterlevelLyr");
                weterlevelLyr.getSource().clear();
            }
        },
        showData: function (obj, domid) {
            $("#" + domid).html("");
            waterlevel.checkLayerValid();
            var levelalertlight = '';
            for (let i = 0; i < obj.length; i++) {
                if (obj[i].Latitude !== undefined) {
                    var pointfeature = helper.transOlGeometry_4326to3857(new ol.Feature({
                        geometry: new ol.geom.Point([obj[i].Longitude, obj[i].Latitude])
                    }));
                    pointfeature.info = '測站：' + obj[i].StationName + "</br>流域名稱：" + obj[i].BasinName +"</br>目前水位高度：" + obj[i].WaterLevel + " m";
                    var fill;
                    if (obj[i].WaterLevel !== undefined && !(obj[i].WarningLevel1 === undefined && obj[i].WarningLevel2 === undefined && obj[i].WarningLevel3 === undefined)) {

                        if (obj[i].WarningLevel1 !== undefined && obj[i].WaterLevel > obj[i].WarningLevel1) {
                            levelalertlight = '<div class="circle WarningLevel1"></div>';
                            fill = new ol.style.Fill({
                                color: 'rgba(255,0,0,0.7)'
                            });
                        } else if (obj[i].WarningLevel2 !== undefined && obj[i].WaterLevel > obj[i].WarningLevel2) {
                            levelalertlight = '<div class="circle WarningLevel2"></div>';
                            fill = new ol.style.Fill({
                                color: 'rgba(255,165,0,0.7)'
                            });
                        } else if (obj[i].WarningLevel3 !== undefined && obj[i].WaterLevel > obj[i].WarningLevel3) {
                            levelalertlight = '<div class="circle WarningLevel3"></div>';
                            fill = new ol.style.Fill({
                                color: 'rgba(255,255,0,0.7)'
                            });
                        } else {
                            levelalertlight = '<div class="circle normal"></div>';
                            fill = new ol.style.Fill({
                                color: 'rgba(67,239,10,0.7)'
                            });
                        }
                    } else {
                        levelalertlight = '<div class="circle unknown"></div>';
                        fill = new ol.style.Fill({
                            color: 'rgba(128,128,128,0.7)'
                        });
                    }
                    var stroke = new ol.style.Stroke({
                        color: '#767676',
                        width: 1
                    });
                    pointfeature.setStyle(new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: fill,
                            stroke: stroke,
                            radius: 8
                        }),
                        fill: fill,
                        stroke: stroke
                    }));
                    weterlevelLyr.getSource().addFeature(pointfeature);
                    var x3857 = pointfeature.getGeometry().getCoordinates()[0];
                    var y3857 = pointfeature.getGeometry().getCoordinates()[1];
                    //var weterlevelhtml = '<tr><td>' + (obj[i].Address === undefined ? '-' : obj[i].Address) + '</td><td>' + (obj[i].StationName === undefined ? '-' : obj[i].StationName) + '</td><td>' + (obj[i].WaterLevel === undefined ? '-' : obj[i].WaterLevel) + '</td><td>' + (obj[i].WarningLevel1 === undefined ? '-' : obj[i].WarningLevel1) + '</td><td>' + (obj[i].WarningLevel2 === undefined ? '-' : obj[i].WarningLevel2) + '</td><td>' + (obj[i].WarningLevel3 === undefined ? '-' : obj[i].WarningLevel3) + '</td><td>' + (obj[i].Time === undefined ? '-' : obj[i].Time) + '</td></tr>';
                    var lighttitle = '第一警戒值：' + (obj[i].WarningLevel1 === undefined ? '-- ' : obj[i].WarningLevel1) + 'm\n第二警戒值：' + (obj[i].WarningLevel2 === undefined ? '-- ' : obj[i].WarningLevel2) + 'm\n第三警戒值：' + (obj[i].WarningLevel3 === undefined ? '-- ' : obj[i].WarningLevel3) + 'm';
                    var weterlevelhtml = '<tr><td class="middle aligned">' + (obj[i].Address === undefined ? '-' : obj[i].Address.substring(0, 6)) + '</td><td class="middle aligned">' + (obj[i].StationName === undefined ? '-' : obj[i].StationName) + '</td><td class="middle aligned">' + (obj[i].WaterLevel === undefined ? '-' : obj[i].WaterLevel) + '</td><td class="middle aligned" title="' + lighttitle + '" onclick="waterlevel.locateWaterStation(\'' + x3857 + '\',\'' + y3857 + '\')">' + levelalertlight + '</td></tr>';
                    $("#" + domid).append(weterlevelhtml);
                }
            }
            $("#waterlevelTime").html(obj[0].Time);
            $("#waterlevelLoadingInfo i").removeClass("loading");
        },
        locateWaterStation: function (x, y) {
            map.e_centerAndZoom(new ol.Feature({
                geometry: new ol.geom.Point([x, y])
            }),5);
        }
    };





}();