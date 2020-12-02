var draw = function () {
    var drawLyr;
    var source = new ol.source.Vector({
    });
    if (map.e_getLayer("drawLyr") === undefined) {
        drawLyr = new ol.layer.Vector({
            source: source
        });
        drawLyr.id = "drawLyr";
        map.addLayer(drawLyr);
    } else {
        drawLyr = map.e_getLayer("drawLyr");
    }

    var Modify = {
        init: function () {
            this.select = new ol.interaction.Select();
            map.addInteraction(this.select);
            this.modify = new ol.interaction.Modify({
                features: this.select.getFeatures()
            });
            map.addInteraction(this.modify);
            this.setEvents();
        },
        setEvents: function () {
            var selectedFeatures = this.select.getFeatures();
            this.select.on('change:active', function () {
                selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
            });
        },
        setActive: function (active) {
            this.select.setActive(active);
            this.modify.setActive(active);
        }
    };
    Modify.init();
    Modify.setActive(true);

    function addInteraction(value, style) {
        var geometryFunction, maxPoints;
        if (value === 'Square') {
            value = 'Circle';
            geometryFunction = ol.interaction.Draw.createRegularPolygon(4);

        } else if (value === 'Box') {
            value = 'LineString';
            maxPoints = 2;
            geometryFunction = function (coordinates, geometry) {
                var start = coordinates[0];
                var end = coordinates[1];
                if (!geometry) {
                    geometry = new ol.geom.Polygon([
                        [start, [start[0], end[1]], end, [end[0], start[1]], start]
                    ]);
                }
                geometry.setCoordinates([
                    [start, [start[0], end[1]], end, [end[0], start[1]], start]
                ]);
                return geometry;
            };
        }
        var drawtool = new ol.interaction.Draw({
            source: source,
            type: value,
            geometryFunction: geometryFunction,
            maxPoints: maxPoints,
            stopClick: true
        });
        map.addInteraction(drawtool);
        drawtool.on('drawend', function (event) {
            event.feature.setStyle(style);
            map.removeInteraction(drawtool);
        });
    }

    return {
        drawpoint: function () {
            var color = ol.color.asArray($("#pointfillcolor").spectrum("get").toHexString());
            color = color.slice();
            color[3] = $("#pointfillopacity").slider("value") / 100;
            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: color
                }),
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: $("#pointsize").val(),
                    fill: new ol.style.Fill({
                        color: color
                    })
                })
            });
            addInteraction("Point", style);
        },
        drawline: function () {
            var fillcolor = ol.color.asArray($("#linefillcolor").spectrum("get").toHexString());
            fillcolor = fillcolor.slice();
            fillcolor[3] = $("#linefillopacity").slider("value") / 100;
            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: fillcolor
                }),
                stroke: new ol.style.Stroke({
                    color: fillcolor,
                    width: $("#linewidth").val()
                })
            });
            addInteraction("LineString", style);

        },
        drawpolygon: function (type) {
            var fillcolor = ol.color.asArray($("#polygonfillcolor").spectrum("get").toHexString());
            fillcolor = fillcolor.slice();
            fillcolor[3] = $("#polygonfillopacity").slider("value") / 100;
            var strokecolor = ol.color.asArray($("#polygonoutlinecolor").spectrum("get").toHexString());
            strokecolor = strokecolor.slice();
            strokecolor[3] = $("#polygonoutlineopacity").slider("value") / 100;
            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: fillcolor
                }),
                stroke: new ol.style.Stroke({
                    color: strokecolor,
                    width: $("#polygonoutlinewidth").val()
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: strokecolor
                    })
                })
            });
            addInteraction(type, style);
        },
        drawtext: function () {
            var fillcolor = ol.color.asArray($("#textfillcolor").spectrum("get").toHexString());
            fillcolor = fillcolor.slice();
            fillcolor[3] = $("#textfillopacity").slider("value") / 100;
            var style = new ol.style.Style({
                text: new ol.style.Text({
                    text: $("#textcontent").val(),
                    font: 'bold ' + $("#textsize").val() + 'px Times New Roman',
                    fill: new ol.style.Fill({
                        color: fillcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: fillcolor,
                        width: 0.5
                    })
                })
            });
            addInteraction("Point", style);
        },
        clearalldraw: function () {
            if (map.e_getLayer("drawLyr") !== undefined) {
                map.e_getLayer("drawLyr").getSource().clear();
            }
        },
        exportfeature: function (f) {
            var geomstring = JSON.stringify(new ol.format.GeoJSON().writeGeometryObject(f.getGeometry()));
            var stylestring = JSON.stringify(f.getStyle());

            return {
                geom: geomstring,
                style: stylestring
            };
        },
        savedraw: function () {
            var drawsaveobj = {
                "SQLtype": "Add",
                "title": $("#savetitle").val(),
                "info": $("#savecontent").val(),
                "features": []
            };
            var featureall = map.e_getLayer("drawLyr").getSource().getFeatures();
            if (featureall.length !== 0 && confirm("是否要儲存圖面繪圖？")) {
                featureall.forEach(function (item, idx) {
                    var stringObj = draw.exportfeature(item);
                    drawsaveobj.features.push(stringObj);
                    if (idx === featureall.length - 1) {
                        $.ajax({
                            type: "POST",
                            url: config_OLMapWebAPI + "/Basic/UserDrawFeatures_SQL",
                            headers: {
                                "Authorization": localStorage["token"]
                            },
                            data: JSON.stringify(drawsaveobj),
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            success: function (d) {
                                //var data = $.parseJSON(d.d);
                                var data = d;
                                console.log(data);
                                alert("繪圖儲存成功！");
                                draw.getUserDrawCaseList();
                            },
                            error: function (jqXHR, exception) {
                                ajaxError(jqXHR, exception);
                            }
                        });
                    }
                });
                console.log(drawsaveobj);
            } else {
                alert("無繪圖圖形！");
            }
        },
        getUserDrawCaseList: function () {
            $("#drawcasescards").html("");
            $.ajax({
                type: "GET",
                url: config_OLMapWebAPI + "/Basic/getUserDrawCase",
                headers: {
                    "Authorization": localStorage["token"]
                },
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (d) {
                    //var data = $.parseJSON(d.d);
                    var data = d;
                    console.log(data);

                    data.forEach(function (item, idx) {
                        //var cardstr = '<div class="card" id="' + item.drawsaveid + '"><div class="content"><div class="header">' + item.title + '</div><div class="meta"><span>' + item.DDate + '</span></div><div class="description">' + item.info + '</div></div><div class="ui bottom attached button" onclick="draw.getUserDrawGeom(\'' + item.drawsaveid + '\')"><i class="add icon"></i>加到地圖</div></div>';
                        var cardstr = '<div class="card" id="' + item.drawsaveid + '"><div class="content"><div class="header">' + item.title + '</div><div class="meta"><span>' + item.DDate + '</span></div><div class="description">' + item.info + '</div></div><div class="extra content"><div class="ui two buttons"><div class="ui basic green button" onclick="draw.getUserDrawGeom(\'' + item.drawsaveid + '\')">加到地圖</div><div class="ui basic red button" onclick="draw.delUserDrawCase(\'' + item.drawsaveid + '\')">刪除</div></div></div></div>';
                        $("#drawcasescards").append(cardstr);
                    });

                    $("#drawcasescards").parents(" div.segment").show();


                },
                error: function (jqXHR, exception) {
                    ajaxError(jqXHR, exception);
                }
            });
        },
        getUserDrawGeom: function (drawsaveid) {
            var drawsaveobj = {
                "SQLtype": "Select",
                "title": "",
                "info": "",
                "features": []
            };
            $.ajax({
                type: "POST",
                url: config_OLMapWebAPI + "/Basic/UserDrawFeatures_SQL",
                headers: {
                    "Authorization": localStorage["token"]
                },
                data: JSON.stringify(drawsaveobj),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (d) {
                    var data = d;
                    console.log(data);
                    var onecasegeom = data.filter(o => o.drawsaveid === drawsaveid);
                    onecasegeom.forEach(function (item, idx) {
                        var f = GraphicTrans.GraphicFromString(item.geom, item.style);
                        f.id = drawsaveid;
                        map.e_getLayer("drawLyr").getSource().addFeature(f);
                        if (onecasegeom.length-1 === idx) {
                            var extent = map.e_getLayer("drawLyr").getSource().getExtent();
                            map.getView().fit(extent, map.getSize());
                        }
                    });
                    console.log(onecasegeom);
                },
                error: function (jqXHR, exception) {
                    ajaxError(jqXHR, exception);
                }
            });

        },
        delUserDrawCase: function (drawsaveid) {
            if (confirm("確定刪除此儲存圖形？")) {
                var drawsaveobj = {
                    "SQLtype": "Del",
                    "title": "",
                    "info": "",
                    "drawsaveid": drawsaveid,
                    "features": []
                };
                $.ajax({
                    type: "POST",
                    url: config_OLMapWebAPI + "/Basic/UserDrawFeatures_SQL",
                    headers: {
                        "Authorization": localStorage["token"]
                    },
                    data: JSON.stringify(drawsaveobj),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (d) {
                        var data = d;
                        console.log(data);
                        draw.getUserDrawCaseList();
                        alert("已刪除完成！");
                    },
                    error: function (jqXHR, exception) {
                        ajaxError(jqXHR, exception);
                    }
                });

            }

        }
    };
}();