//Currently drawn feature.
var sketch;

//The help tooltip element.
var helpTooltipElement;

//Overlay to show the help messages.
var helpTooltip;

//The measure tooltip element.
var measureTooltipElement;

//Overlay to show the measurement.
var measureTooltip;

//Message to show when the user is drawing a polygon.
var continuePolygonMsg = 'Click to continue drawing the polygon';

//Message to show when the user is drawing a line.
var continueLineMsg = 'Click to continue drawing the line';

//Handle pointer move.
var pointerMoveHandler = function (evt) {
    if (evt.dragging) {
        return;
    }
    var helpMsg = 'Click to start drawing';

    if (sketch) {
        var geom = sketch.getGeometry();
        if (geom instanceof ol.geom.Polygon) {
            helpMsg = continuePolygonMsg;
        } else if (geom instanceof ol.geom.LineString) {
            helpMsg = continueLineMsg;
        }
    }

    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);

    helpTooltipElement.classList.remove('hidden');
};

var typeSelect;
var geodesicCheckbox;

var draw; // global so we can remove it later

//Format length output.
var formatLength = function (line) {
    //var length = line.getLength(line);
    var length;
    if (geodesicCheckbox.prop("checked")) {//use geodesic
        var sourceProj = map.getView().getProjection();
        length = ol.sphere.getLength(line, { "projection": sourceProj, "radius": 6378137 });
    } else {
        length = line.getLength(line);
    }
    //console.log("proj:" + ol.sphere.getLength(line, { "projection": sourceProj, "radius": 6378137 }) + ",default:" + line.getLength(line))
    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    } else {
        output = (Math.round(length * 100) / 100) + ' ' + 'm';
    }
    return output;
};


//Format area output.
var formatArea = function (polygon) {
    //var area = polygon.getArea(polygon);
    var area;
    if (geodesicCheckbox.prop("checked")) {//use geodesic
        var sourceProj = map.getView().getProjection();
        var geom = polygon.clone().transform(sourceProj, 'EPSG:4326'); //投影為EPSG:4326
        area = Math.abs(ol.sphere.getArea(geom, { "projection": sourceProj, "radius": 6378137 }));
    } else {
        area = polygon.getArea();
    }
    var output;
    if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
    } else {
        output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
    }
    return output;
};

if (map.e_getLayer("measureVectorLyr") === undefined) {
    var source = new ol.source.Vector();
    var vector = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });
    source.id = "measureSourceLyr";
    vector.id = "measureVectorLyr";
    map.addLayer(vector);
}

$("#measureBtn button").click(function () {
    typeSelect = $(this);
    geodesicCheckbox = $("#useGeodesic");
    if ($(this).hasClass("basic")) {
        $(this).siblings("button").each(function (index, item) {
            if (!$(item).hasClass("basic")) {
                $(item).addClass("basic");
            }
        });
        map.removeInteraction(draw);
        addInteraction();
        $(this).removeClass("basic");
    } else {
        $(this).addClass("basic");
        map.removeInteraction(draw);
    }
});

function addInteraction() {
    var type = (typeSelect.val() === 'area' ? 'Polygon' : 'LineString');
    draw = new ol.interaction.Draw({
        source: source,
        type: type,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });
    map.addInteraction(draw);

    createMeasureTooltip();
    createHelpTooltip();

    var listener;
    draw.on('drawstart',
        function (evt) {
            // set sketch
            sketch = evt.feature;

            var tooltipCoord = evt.coordinate;

            listener = sketch.getGeometry().on('change', function (evt) {
                var geom = evt.target;
                var output;
                if (geom instanceof ol.geom.Polygon) {
                    output = formatArea(geom);
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof ol.geom.LineString) {
                    output = formatLength(geom);
                    tooltipCoord = geom.getLastCoordinate();
                }
                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
            });
        }, this);

    draw.on('drawend',
        function () {
            measureTooltipElement.className = 'tooltip tooltip-static';
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;
            createMeasureTooltip();

            //查詢每次限制只查一次
            typeSelect.addClass("basic");
            map.removeInteraction(draw);
            ol.Observable.unByKey(listener);
        }, this);
}


//Creates a new help tooltip
function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}


//Creates a new measure tooltip
function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
}

$("#clearMeasureDrawBtn").click(function () {
    map.e_getLayer("measureVectorLyr").getSource().clear();
    map.getOverlays().clear();
});