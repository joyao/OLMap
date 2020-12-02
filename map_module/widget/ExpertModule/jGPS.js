var GPS = function () {
    var GPSStationList;
    var GPSDateList = [];
    var GPSData_hgt = [];
    var GPSData_dn = [];
    var GPSData_de = [];
    var FitGPSData_hgt = [];




    function loadlayer(item) {
        var source = new ol.source.TileWMS({
            url: 'http://localhost/qgis/wms?',
            params: {
                'map': 'GPS_Station.qgs',
                'LAYERS': 'GPS_Station',
                'TILED': true,
                'FORMAT': 'image/png',
                'VERSION': '1.1.1'
            },
            serverType: 'geoserver',
            // Countries have transparency, so do not fade tiles:
            transition: 0

        });
        var layer = new ol.layer.Tile({
            opacity: 1,
            source: source
        });
        layer.id = "GPSLyr";
        layer.setOpacity(1);

        if (map.e_getLayer("GPSLyr") === undefined) {
            map.addLayer(layer);

        } else {
            map.e_getLayer("GPSLyr").getSource().clear();
            map.e_getLayer("GPSLyr").setSource(source);
        }
    }


    function mapGPSInit() {
        if (map.e_getLayer("GPSLyr") !== undefined) {
            $('#GPSLyrCB.checkbox').checkbox("set checked");
        }
        $('#GPSLyrCB.checkbox')
            .checkbox({
                onChecked: function () {
                    loadlayer();
                },
                onUnchecked: function () {
                    map.removeLayer(map.e_getLayer("GPSLyr"));
                }
            });
        // 產生GPS測站列表
        $.ajax({
            type: "POST",
            url: config_OLMapWebAPI + "/Basic/getGPSStationList",
            headers: {
                "Authorization": localStorage["token"]
            },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                "keyword": '*'
            }),
            success: function (data) {
                //console.log(data);

                $('#gps_station')
                    .find('option')
                    .remove()
                    .end()
                    .append('<option value="" disabled selected>請選擇GPS測站</option>');

                for (var i = 0; i < data.length; i++) {
                    $('#gps_station').append(new Option(data[i].gpsid));
                }
                GPSStationList = data;
            }
        });


        $("#GPS_county").change(function () {
            var county = $("#GPS_county").val() === "全部" ? "*" : $("#GPS_county").val();
            // 產生GPS測站列表
            $.ajax({
                type: "POST",
                url: config_OLMapWebAPI + "/Basic/getGPSStationList",
                headers: {
                    "Authorization": localStorage["token"]
                },
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    "keyword": county,
                }),
                success: function (data) {
                    console.log(data);
                    $('#gps_station').siblings('.text').text('');
                    $('#gps_station')
                        .find('option')
                        .remove()
                        .end()
                        .append('<option value="choose_case" disabled selected>請選擇GPS測站</option>');

                    for (var i = 0; i < data.length; i++) {
                        $('#gps_station').append(new Option(data[i].gpsid));
                    }
                    $('#startdate').val('');
                    $('#enddate').val('');
                }
            });
        });

        $('#gps_station').on('change', function () {
            var id = $('#gps_station').find(":selected").text();
            var tmp = GPSStationList.filter(function (st) {
                return st.gpsid === id;
            });
            var GPS = tmp[0];
            proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
            proj4.defs('WGS84', "+proj=longlat +datum=WGS84 +no_defs ");
            var point = proj4("WGS84", "EPSG:3857", [parseFloat(GPS.lon), parseFloat(GPS.lat)]);
            console.log(point)
            map.e_centerAndZoom(new ol.Feature({
                geometry: new ol.geom.Point([point[0], point[1]])
            }), 5);
            $('.datepick').prop("disabled", false);
            $('.ListOptions input').removeClass("disabled");
            $('.datepick').datepicker("destroy");
            $('#startdate').datepicker({
                dateFormat: "yy-mm-dd",
                minDate: new Date(GPS.sdate.substring(0, 4), String(parseInt(GPS.sdate.substring(4, 6)) - 1), GPS.sdate.substring(6, 8)),
                maxDate: new Date(GPS.edate.substring(0, 4), String(parseInt(GPS.edate.substring(4, 6)) - 1), GPS.edate.substring(6, 8)),
                onSelect: function (dateText, inst) {
                    $('#startdate').val(dateText);
                }
            });
            $('#enddate').datepicker({
                dateFormat: "yy-mm-dd",
                minDate: new Date(GPS.sdate.substring(0, 4), String(parseInt(GPS.sdate.substring(4, 6)) - 1), GPS.sdate.substring(6, 8)),
                maxDate: new Date(GPS.edate.substring(0, 4), String(parseInt(GPS.edate.substring(4, 6)) - 1), GPS.edate.substring(6, 8)),
                onSelect: function (dateText, inst) {
                    $('#enddate').val(dateText);
                }
            });
            $('#startdate').datepicker('setDate', new Date(GPS.sdate.substring(0, 4), String(parseInt(GPS.sdate.substring(4, 6)) - 1), GPS.sdate.substring(6, 8)))
            $('#enddate').datepicker('setDate', new Date(GPS.edate.substring(0, 4), String(parseInt(GPS.edate.substring(4, 6)) - 1), GPS.edate.substring(6, 8)))
        });

    }

    function QueryGPS() {
        var Station = $('#gps_station').find(":selected").text();
        var Sdate = $('#startdate').val().replace(new RegExp('-', 'g'), '');
        var Edate = $('#enddate').val().replace(new RegExp('-', 'g'), '');

        runGPS(Station, Sdate, Edate, 'GPS')
    }


    function runGPS(ID, sdate, edate, status) {
        GPSDateList.length = 0;
        GPSData_hgt.length = 0;
        GPSData_dn.length = 0;
        GPSData_de.length = 0;

        $.ajax({
            type: "POST",
            url: config_OLMapWebAPI + "/Basic/getGPSDataList",
            headers: {
                "Authorization": localStorage["token"]
            },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
                "sdate": sdate,
                "edate": edate,
                "gpsid": ID,
            }),
            success: function (data) {
                //console.log(data);

                data.forEach(function (value) {
                    var oneday = [Date.UTC(parseInt(value.year.substring(0, 4)), parseInt(value.year.substring(4, 6)) - 1, parseInt(value.year.substring(6, 8))), parseFloat(parseFloat(value.hgt).toFixed(3))];
                    //var oneday = [Date.UTC(parseInt(value.year.substring(0, 4)), parseInt(value.year.substring(4, 6)) - 1, parseInt(value.year.substring(6, 8))), parseFloat(parseFloat(value.dU).toFixed(3))];
                    var onedayn = [Date.UTC(parseInt(value.year.substring(0, 4)), parseInt(value.year.substring(4, 6)) - 1, parseInt(value.year.substring(6, 8))), parseFloat(parseFloat(value.dN).toFixed(3))];
                    var onedaye = [Date.UTC(parseInt(value.year.substring(0, 4)), parseInt(value.year.substring(4, 6)) - 1, parseInt(value.year.substring(6, 8))), parseFloat(parseFloat(value.dE).toFixed(3))];
                    GPSData_hgt.push(oneday);
                    GPSData_dn.push(onedayn);
                    GPSData_de.push(onedaye);
                    GPSDateList.push(parseInt(value.year));
                });

                var parm = Math.floor(GPSDateList.length / 5);
                if (parm > 30) {
                    parm = 31;  //至少1個月1個值
                }
                var interval = parm;
                if (parm % 2 === 1) {
                    interval = parm;
                } else {
                    interval = parm + 1;
                }
                var fitdata = fit_moveaverage(GPSData_hgt, interval, 'center');
                FitGPSData_hgt = fitdata;
                //console.log(GPSDateList, GPSData_hgt, fitdata);
                //GPSData_hgt = data;
                drawGPS(ID, GPSData_hgt, fitdata, 'gps_container', 'GPS測站高程變化量');

                var fitdata_n = fit_moveaverage(GPSData_dn, interval, 'center');
                var fitdata_e = fit_moveaverage(GPSData_de, interval, 'center');
                drawGPS(ID, GPSData_dn, fitdata_n, 'gps_containerN', 'GPS測站Y方向變化量');
                drawGPS(ID, GPSData_de, fitdata_e, 'gps_containerE', 'GPS測站X方向變化量');
            }
        });



    }

    function fit_moveaverage(data, interval, mode) {
        var half = Math.floor(interval / 2);
        var FitData = [];
        if (mode === 'center') {
            FitData.length = 0;
            data.forEach(function (value, idx) {
                if (idx >= half && idx < (data.length - half - 1)) {
                    var sum = 0;

                    for (i = idx - half; i <= idx + half; i++) {
                        sum += data[i][1];
                    };
                    FitData.push([value[0], sum / interval]);
                }

            });
        } else if (mode === 'front') {
            half = interval;
            FitData.length = 0;
            data.forEach(function (value, idx) {
                if (idx >= 0 && idx < (data.length - half - 1)) {
                    var sum = 0;

                    for (i = idx; i <= idx + half; i++) {
                        sum += data[i][1];
                    };
                    FitData.push([value[0], sum / interval]);
                }

            });
        } else {
            half = interval;
            FitData.length = 0;
            data.forEach(function (value, idx) {
                if (idx >= half && idx < (data.length - 1)) {
                    var sum = 0;

                    for (i = idx - half; i <= idx; i++) {
                        sum += data[i][1];
                    };
                    FitData.push([value[0], sum / interval]);
                }

            });
        }

        //console.log(FitData);
        return FitData

    }

    function drawGPS(gpsid, data, fitdata, container, title) {

        //var gpsstation = $('#gps_station').find(":selected").text() == "" ? window.parent.I6.contentWindow.$("#nearest_gps option:selected").val() : $('#gps_station').find(":selected").text();
        var gpsstation = gpsid;
        var s_date = GPSDateList[0];
        var e_date = GPSDateList[GPSDateList.length - 1];
        $('#gps_result').html(gpsstation + ' (' + s_date + ' ~ ' + e_date + ')');
        $('#gps_container').show();
        $('#gps_containerN').show();
        $('#gps_containerE').show();
        //畫圖
        parent.Highcharts.chart(container, {
            //chart: {
            //    backgroundColor: null, //#0b0305
            //    type: 'scatter',
            //    zoomType: 'xy'
            //},
            title: {
                text: title
            },
            //subtitle: {
            //    text: 'GPS站: ' + gpsstation + ' (' + s_date + ' ~ ' + e_date + ')'
            //},
            xAxis: {
                //title: {
                //    text: '日期'
                //},
                //type: 'datetime',
                //categories: date,
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%m/%d',
                    week: '%m/%d',
                    month: '%Y-%m',
                    year: '%Y'
                },
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                gridLineColor: '#ababab',
                title: {
                    text: '變化量(mm)'
                },
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                },
                visible: false
            },
            tooltip: {
                crosshairs: true,
                shared: true
            },
            series: [{
                type: 'scatter',
                name: 'GPS高程',
                data: data,
                color: 'rgba(47, 126, 216, 0.50)',
                marker: {
                    radius: 2
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x:%Y-%m-%d}: {point.y} mm'
                }
            }, {
                type: 'line',
                name: '移動平均擬合線',
                data: fitdata,
                color: 'rgba(255, 0, 0, 1)',
                marker: {
                    enabled: false
                }, tooltip: {
                    headerFormat: '<b>移動平均擬合線</b><br>',
                    pointFormat: '{point.x:%Y-%m-%d}: {point.y:.3f} mm'
                }
            }]
        }
        );


    }

    return {
        mapGPSInit: mapGPSInit,
        QueryGPS: QueryGPS
    };
}();