var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point([0, 0]),
    name: 'test'
});

var vectorSource = new ol.source.Vector({
});
vectorSource.addFeature(iconFeature);
var vectorLayer = new ol.layer.Vector({
});
vectorLayer.setSource(vectorSource);

map.addLayer(vectorLayer);

vectorLayer.getSource().getFeatures()[0].getGeometry().getCoordinates()

var wkt_polygon = "POLYGON((121 25,121.5 25,121.5 25.5,121 25.5,121 25))";
var format = new ol.format.WKT();
var feature1 = format.readFeature(wkt_polygon, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
});
vector.getSource().addFeature(feature1);

proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("EPSG:3826", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");

var Feature = new ol.Feature({
    geometry: new ol.geom.Point(proj4("EPSG:4326", "EPSG:3857", [121, 25])),
    name: 'test'
});