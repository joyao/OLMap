var toc = function () {

    var projection = ol.proj.get('EPSG:3857');

    var image = new ol.style.Circle({
        radius: 5,
        fill: null,
        stroke: new ol.style.Stroke({ color: 'red', width: 1 })
    });

    var styles = {
        'Point': [
            new ol.style.Style({
                image: image
            })
        ],
        'LineString': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 1
                })
            })
        ],
        'MultiLineString': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 1
                })
            })
        ],
        'MultiPoint': [
            new ol.style.Style({
                image: image
            })
        ],
        'MultiPolygon': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 1
                }),
                //多区的填充样式
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 0, 0.1)'
                })
            })
        ],
        'Polygon': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    lineDash: [4],
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)'
                })
            })
        ],
        'GeometryCollection': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'magenta',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'magenta'
                }),
                image: new ol.style.Circle({
                    radius: 10,
                    fill: null,
                    stroke: new ol.style.Stroke({
                        color: 'magenta'
                    })
                })
            })
        ],
        'Circle': [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,0.2)'
                })
            })
        ]
    };


    var styleFunction = function (feature, resolution) {
        return styles[feature.getGeometry().getType()];
    };

    function initTOCLayer() {
        var typehasExtent = ['GeoJSON', 'GPX', 'KML'];
        if (TOCArray.length !== 0) {
            console.log(TOCArray);
            var layerlisthtml = "";
            $.each(TOCArray, function (index, item) {
                var checked = false;
                if (map.e_getLayer(item.LayerID) === undefined) {
                    loadLayer(item);
                    checked = false;
                } else {
                    if (item.OpenOpacity !== "0") {
                        checked = true;
                    } else {
                        checked = false;
                    }
                }
                var checkboxhtml = (checked === false ? '<div class="ui checkbox"><input type="checkbox" name="example" onclick="toc.toggleTocLayer(\'' + item.LayerID + '\', this)">' : '<div class="ui checkbox"><input type="checkbox" name="example" onclick="toc.toggleTocLayer(\'' + item.LayerID + '\', this)" checked="' + checked + '">');
                var layerlisthtml_part = '<div class="item">' + checkboxhtml + '<label></label></div><div class="content"><a class="header">' + item.LayerTitle + '</a><div class="description">' + item.DataType + '</div>';
                if (typehasExtent.includes(item.DataType)) {
                    layerlisthtml_part += '<img class="layerBtns info" src="images/TOCpage/info.png" title="點擊定位圖層" onclick="toc.zoomTocLayer(\'' + item.LayerID + '\')">';
                }
                layerlisthtml_part += '</div></div>';
                layerlisthtml += layerlisthtml_part;
            });
            $("#layerlist").html(layerlisthtml);
        } else {
            $.ajax({
                type: "GET",
                url: config_OLMapWebAPI + "/Layers/getLayerResource",
                headers: {
                    "Authorization": localStorage["token"]
                },
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (d) {
                    //var data = $.parseJSON(d.d);
                    var data = d;
                    console.log(data);
                    var layerlisthtml = "";
                    TOCArray = [];
                    $.each(data, function (index, item) {
                        loadLayer(item);
                        if (typehasExtent.includes(item.DataType)) {
                            layerlisthtml += '<div class="item"><div class="ui checkbox"><input type="checkbox" name="example" onclick="toc.toggleTocLayer(\'' + item.LayerID + '\', this)"><label></label></div><div class="content"><a class="header">' + item.LayerTitle + '</a><div class="description">' + item.DataType + '</div><img class="layerBtns info" src="images/TOCpage/info.png" title="點擊定位圖層" onclick="toc.zoomTocLayer(\'' + item.LayerID + '\')"></div></div>';
                        } else {
                            layerlisthtml += '<div class="item"><div class="ui checkbox"><input type="checkbox" name="example" onclick="toc.toggleTocLayer(\'' + item.LayerID + '\', this)"><label></label></div><div class="content"><a class="header">' + item.LayerTitle + '</a><div class="description">' + item.DataType + '</div></div></div>';
                        }
                        TOCArray.push(item);
                    });
                    $("#layerlist").html(layerlisthtml);
                },
                error: function (jqXHR, exception) {
                    ajaxError(jqXHR, exception);
                }
            });
        }
    }

    function zoomTocLayer(layerid) {
        var extent = map.e_getLayer(layerid).getSource().getExtent();
        map.getView().fit(extent, map.getSize());
    }

    function toggleTocLayer(layerid, checkbox) {
        if ($(checkbox).prop("checked")) {
            map.e_getLayer(layerid).setOpacity(1);
            console.log("open layer:" + layerid);
            TOCArray.filter(i => i.LayerID === layerid)[0].OpenOpacity = "1";
        } else {
            map.e_getLayer(layerid).setOpacity(0);
            console.log("close layer:" + layerid);
            TOCArray.filter(i => i.LayerID === layerid)[0].OpenOpacity = "0";
        }
    }


    function loadLayer(json) {
        var layer;
        var source;
        if (json.DataType === "WMS") {
            var Layer_split = json.LayerVisibleCode.split('/');
            source = new ol.source.TileWMS({
                url: json.DataURL,
                params: {
                    'map': Layer_split.length === 2 ? Layer_split[0] : '',
                    'LAYERS': Layer_split[Layer_split.length - 1],
                    'TILED': true,
                    'FORMAT': 'image/png',
                    'VERSION': '1.1.1'
                },
                serverType: 'geoserver',
                // Countries have transparency, so do not fade tiles:
                transition: 0

            });

        } else if (json.DataType === "WMTS") {
            var projection = ol.proj.get('EPSG:3857');
            var projectionExtent = projection.getExtent();
            var size = ol.extent.getWidth(projectionExtent) / 256;
            var resolutions = new Array(14);
            var matrixIds = new Array(14);
            for (let z = 0; z < 14; ++z) {
                // generate resolutions and matrixIds arrays for this WMTS
                resolutions[z] = size / Math.pow(2, z);
                matrixIds[z] = z;
            }

            source = new ol.source.WMTS({
                url: json.DataURL,
                layer: json.LayerVisibleCode,
                matrixSet: 'EPSG:3857',
                format: 'image/png',
                projection: projection,
                tileGrid: new ol.tilegrid.WMTS({
                    origin: ol.extent.getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                }),
                style: 'default',
                wrapX: true
            });
        } else if (json.DataType === "WFS") {
            source = new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function (extent) {
                    return json.DataURL + '?service=WFS&' +
                        'version=1.1.0&request=GetFeature&typename=' + json.LayerVisibleCode + '&' +
                        'outputFormat=application/json&srsname=EPSG:3857&' +
                        'bbox=' + extent.join(',') + ',EPSG:3857';
                },
                strategy: ol.loadingstrategy.bbox
            });

        } else if (json.DataType === "GeoJSON") {
            source = new ol.source.Vector({
                url: json.DataURL + '/' + json.LayerVisibleCode,
                format: new ol.format.GeoJSON()
            });
        } else if (json.DataType === "KML") {
            source = new ol.source.Vector({
                url: json.DataURL + '/' + json.LayerVisibleCode,
                format: new ol.format.KML()
            });
        } else if (json.DataType === "GPX") {

            source = new ol.source.Vector({
                url: json.DataURL + '/' + json.LayerVisibleCode,
                format: new ol.format.GPX()
            });
        }
        if (json.LayerType === "Tile") {
            layer = new ol.layer.Tile({
                opacity: 0,
                source: source
            });
        } else if (json.LayerType === "Vector") {
            layer = new ol.layer.Vector({
                source: source,
                style: styleFunction
            });
        } else if (json.LayerType === "Heatmap") {
            layer = new ol.layer.Heatmap({
                source: source,
                blur: parseInt(15, 10),
                radius: parseInt(2, 10)
            });
        } else if (json.LayerType === "Cluster") {
            var styleCache = {};
            layer = new ol.layer.Vector({
                source: new ol.source.Cluster({
                    distance: parseInt(30, 10),
                    source: source
                }),
                style: function (feature) {
                    var size = feature.get('features').length;
                    var style = styleCache[size];
                    if (!style) {
                        style = new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 15,
                                stroke: new ol.style.Stroke({
                                    color: '#fff'
                                }),
                                fill: new ol.style.Fill({
                                    color: '#3E5E7E'
                                })
                            }),
                            text: new ol.style.Text({
                                text: size.toString(),
                                fill: new ol.style.Fill({
                                    color: '#fff'
                                })
                            })
                        });
                        styleCache[size] = style;
                    }
                    return style;
                }
            });
        }
        layer.id = json.LayerID;
        layer.setOpacity(0);
        map.addLayer(layer);
    }

    return {
        initTOCLayer: initTOCLayer,
        toggleTocLayer: toggleTocLayer,
        zoomTocLayer: zoomTocLayer
    };
}();