var GraphicTrans = function () {


    return {
        GraphicGeomTrans: function (geostring) {
            var geoObj = new ol.format.GeoJSON().readGeometry(geostring);
            var newgeo = new ol.Feature({
                geometry: geoObj
            });
            return newgeo;
        },
        GraphicStyleTrans: function (stylestring) {
            var styleObj = JSON.parse(stylestring);
            var stylejson = createStyle(styleObj);
            var newstyle = new ol.style.Style(stylejson);
            function createStyle(Obj1) {
                var styleArr = ["fill", "stroke", "image", "geometry", "renderer", "text"];
                var styleAll = {};
                if (Obj1 === null) {
                    styleAll = null;
                } else {
                    Object.keys(Obj1).forEach(function (item, idx) {

                        var newkey = item.replace(/\_$/g, '');
                        if (Obj1[item] !== null) {
                            if (typeof Obj1[item] === 'object' && Array.isArray(Obj1[item]) === false) {
                                if (newkey === "fill") {
                                    styleAll[newkey] = new ol.style.Fill(createStyle(Obj1.fill_));
                                } else if (newkey === "stroke") {
                                    styleAll[newkey] = new ol.style.Stroke(createStyle(Obj1.stroke_));
                                } else if (newkey === "image") {
                                    styleAll[newkey] = new ol.style.Circle(createStyle(Obj1.image_));
                                } else if (newkey === "geometry") {
                                    styleAll[newkey] = new ol.style.Circle(createStyle(Obj1.geometry_));
                                } else if (newkey === "renderer") {
                                    styleAll[newkey] = new ol.style.Renderer(createStyle(Obj1.renderer_));
                                } else if (newkey === "text") {
                                    styleAll[newkey] = new ol.style.Text(createStyle(Obj1.text_));
                                } else {
                                    styleAll[newkey] = createStyle(Obj1[item]);
                                }
                            } else {
                                styleAll[newkey] = Obj1[item];
                            }
                        } else {
                            styleAll[newkey] = null;
                        }

                    });

                }
                return styleAll;
            }

            return newstyle;
        },
        GraphicFromString: function (geostring, stylestring) {
            var feature = GraphicTrans.GraphicGeomTrans(geostring);
            feature.setStyle(GraphicTrans.GraphicStyleTrans(stylestring));
            return feature;
        }
    };


}();