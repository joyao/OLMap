$(function () {
    if (ol.Map.prototype.e_getLayer === undefined) {
        ol.Map.prototype.e_getLayer = function (id) {
            var layer;
            this.getLayers().forEach(function (lyr) {
                if (id === lyr.id) {
                    layer = lyr;
                }
            });
            return layer;
        };
    }

    if (ol.Map.prototype.e_getLayerIndex === undefined) {
        ol.Map.prototype.e_getLayerIndex = function (id) {
            var index;
            this.getLayers().forEach(function (lyr, idx) {
                if (id === lyr.id) {
                    index = idx;
                }
            });
            return index;
        };
    }

    if (ol.Map.prototype.e_changeBasemap === undefined) {
        ol.Map.prototype.e_changeBasemap = function (id) {
            var thismap = this;
            $.each(config_basemap, function (index, item) {
                if (id === item.id) {
                    thismap.e_getLayer(item.id).setVisible(true);
                    thismap.e_getLayer(item.id).setZIndex(0);
                    config_basemap[index].initVisible = true;
                } else {
                    thismap.e_getLayer(item.id).setVisible(false);
                    config_basemap[index].initVisible = false;
                }
            });
        };
    }

    if (ol.Map.prototype.e_getBasemap === undefined) {
        ol.Map.prototype.e_getBasemap = function () {
            var thismap = this;
            var basemap;
            $.each(config_basemap, function (index, item) {
                if (item.initVisible === true) {
                    basemap = {
                        "index": thismap.e_getLayerIndex(item.id),
                        "id": item.id
                    };
                }

            });
            return basemap;
        };
    }

    if (ol.Map.prototype.e_centerAndZoom === undefined) {
        ol.Map.prototype.e_centerAndZoom = function (mapPoint, resolution_min) {
            map.getView().fit(mapPoint.getGeometry(), { padding: [80, 30, 80, 350], minResolution: resolution_min });
        };
    }
});