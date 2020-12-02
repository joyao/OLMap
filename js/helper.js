var helper = function () {
    proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
    proj4.defs("EPSG:3826", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");

    return {
        transOlGeometry: function (obj, transFunc) {
            var geomJsonStr = JSON.stringify(obj.getGeometry().getCoordinates());
            var tempgeom = JSON.parse(geomJsonStr);
            var feature;
            if (obj.getGeometry().getType() === "Point") {
                tempgeom = transFunc(tempgeom);
                feature = new ol.Feature({
                    geometry: new ol.geom.Point(tempgeom),
                    name: obj.getGeometryName()
                });
            } else if (obj.getGeometry().getType() === "MultiPoint") {
                tempgeom.map(function (coorpair) {
                    return transFunc(coorpair);
                });
                feature = new ol.Feature({
                    geometry: new ol.geom.MultiPoint(tempgeom),
                    name: obj.getGeometryName()
                });
            } else if (obj.getGeometry().getType() === "LineString") {
                tempgeom.map(function (coorpair) {
                    return transFunc(coorpair);
                });
                feature = new ol.Feature({
                    geometry: new ol.geom.LineString(tempgeom),
                    name: obj.getGeometryName()
                });
            } else if (obj.getGeometry().getType() === "MultiLineString") {
                tempgeom = tempgeom.map(function (temparr) {
                    return temparr.map(function (coorpair) {
                        return transFunc(coorpair);
                    });
                });
                feature = new ol.Feature({
                    geometry: new ol.geom.MultiLineString(tempgeom),
                    name: obj.getGeometryName()
                });
            } else if (obj.getGeometry().getType() === "Polygon") {
                tempgeom = tempgeom.map(function (temparr) {
                    return temparr.map(function (coorpair) {
                        return transFunc(coorpair);
                    });
                });
                //tempgeom = tempgeom.map(function (coorpair) { return transFunc(coorpair); });
                feature = new ol.Feature({
                    geometry: new ol.geom.Polygon(tempgeom),
                    name: obj.getGeometryName()
                });
            } else if (obj.getGeometry().getType() === "MultiPolygon") {
                //for (let i = 0; i < tempgeom[0].length; i++) {
                //    for (let j = 0; j < tempgeom[0][i].length; j++) {
                //        tempgeom[0][i][j] = transFunc(tempgeom[0][i][j]);
                //    }
                //}
                tempgeom = tempgeom.map(function (temparr) {
                    return temparr.map(function (temparr1) {
                        return temparr1.map(function (coorpair) {
                            return transFunc(coorpair);
                        });
                    });
                });

                feature = new ol.Feature({
                    geometry: new ol.geom.MultiPolygon(tempgeom),
                    name: obj.getGeometryName()
                });
            }
            return feature;
        },
        epsg4326to3857: function (arr) {
            return proj4("EPSG:4326", "EPSG:3857", arr);
        },
        epsg4326to3826: function (arr) {
            return proj4("EPSG:4326", "EPSG:3826", arr);
        },
        epsg3826to3857: function (arr) {
            return proj4("EPSG:3826", "EPSG:3857", arr);
        },
        epsg3826to4326: function (arr) {
            return proj4("EPSG:3826", "EPSG:4326", arr);
        },
        epsg3857to3826: function (arr) {
            return proj4("EPSG:3857", "EPSG:3826", arr);
        },
        epsg3857to4326: function (arr) {
            return proj4("EPSG:3857", "EPSG:4326", arr);
        },
        transOlGeometry_4326to3857: function (obj) {
            return helper.transOlGeometry(obj, helper.epsg4326to3857);
        },
        transOlGeometry_4326to3826: function (obj) {
            return helper.transOlGeometry(obj, helper.epsg4326to3826);
        },
        transOlGeometry_3826to3857: function (obj) {
            return helper.transOlGeometry(obj, helper.epsg3826to3857);
        },
        transOlGeometry_3826to4326: function (obj) {
            return helper.transOlGeometry(obj, helper.epsg3826to4326);
        },
        transOlGeometry_3857to3826: function (obj) {
            return helper.transOlGeometry(obj, helper.epsg3857to3826);
        },
        transOlGeometry_3857to4326: function (obj) {
            return helper.transOlGeometry(obj, helper.epsg3857to4326);
        }
    };
}();