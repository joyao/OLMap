function initBasemapPage() {
    var tablestring = "";
    $.each(config_basemap, function (index, item) {
        if (item.initVisible === true) {
            tablestring += "<tr onclick='changeBasemap(\"" + item.id + "\")'><td><div><img id='img_" + item.id + "' class='selected' src='images/BasicTool/Basemap/" + item.image + "' width='60%'></div><div>" + item.name + "</div></td></tr>";
        } else {
            tablestring += "<tr onclick='changeBasemap(\"" + item.id + "\")'><td><div><img id='img_" + item.id + "' src='images/BasicTool/Basemap/" + item.image + "' width='60%'></div><div>" + item.name + "</div></td></tr>";
        }
    });
    $("#basemaplist").html(tablestring);
}

function changeBasemap(id) {
    console.log("t");
    $("#basemaplist img").removeClass("selected");
    $("#basemaplist #img_" + id).addClass("selected");
    //$.each(config_basemap, function (index, item) {
    //    map.e_getLayers().forEach(function (layer) {
    //        if (layer.id === item.id) {
    //            if (layer.id === id) {
    //                layer.setVisible(true);
    //                layer.setZIndex(0);
    //                config_basemap[index].initVisible = true;
    //            } else {
    //                layer.setVisible(false);
    //                config_basemap[index].initVisible = false;
    //            }
    //        }

    //    });
    //});
    map.e_changeBasemap(id);
}