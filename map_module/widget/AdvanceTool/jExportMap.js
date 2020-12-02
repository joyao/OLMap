var exportmap = function () {
    //var scaleLine = new ol.control.ScaleLine({ bar: true, text: true, minWidth: 125 });
    //map.addControl(scaleLine);
    var dims = {
        a0: [1189, 841],
        a1: [841, 594],
        a2: [594, 420],
        a3: [420, 297],
        a4: [297, 210],
        a5: [210, 148]
    };

    var exportOptions = {
        filter: function (element) {
            var className = element.className || '';
            return (
                className.indexOf('ol-control') === -1 ||
                className.indexOf('ol-scale') > -1 ||
                (className.indexOf('ol-attribution') > -1 &&
                    className.indexOf('ol-uncollapsible'))
            );
        }
    };

    function WebMapExport (){
        //exportButton.disabled = true;
        //document.body.style.cursor = 'progress';

        var format = document.getElementById('format').value;
        var resolution = document.getElementById('resolution').value;
        var scale = document.getElementById('scale').value;
        var dim = dims[format];
        var width = Math.round((dim[0] * resolution) / 25.4);
        var height = Math.round((dim[1] * resolution) / 25.4);
        var viewResolution = map.getView().getResolution();
        var scaleResolution =
            scale /
            ol.proj.getPointResolution(
                map.getView().getProjection(),
                resolution / 25.4,
                map.getView().getCenter()
            );

        map.once('rendercomplete', function () {
            exportOptions.width = width;
            exportOptions.height = height;
            var ExportImageName = 'MapExport_' + new Date().Format("yyyyMMddhhmmss");
            var imageformat = document.getElementById('imageformat').value;
            if (imageformat === "PDF") {
                domtoimage
                    .toJpeg(map.getViewport(), exportOptions)
                    .then(function (dataUrl) {
                        var pdf = new jsPDF('landscape', undefined, format);
                        pdf.addImage(dataUrl, 'JPEG', 0, 0, dim[0], dim[1]);
                        pdf.save(ExportImageName + '.pdf');
                        // Reset original map size
                        //scaleLine.setDpi();
                        map.getTargetElement().style.width = '';
                        map.getTargetElement().style.height = '';
                        map.updateSize();
                        map.getView().setResolution(viewResolution);
                        //exportButton.disabled = false;
                        //document.body.style.cursor = 'auto';
                    });
            } else if (imageformat === "JPEG") {
                domtoimage.toJpeg(map.getViewport(), exportOptions)
                    .then(function (dataUrl) {
                        var link = document.createElement('a');
                        link.download = ExportImageName + '.jpeg';
                        link.href = dataUrl;
                        link.click();
                    });
            } else {
                domtoimage.toPng(map.getViewport(), exportOptions)
                    .then(function (dataUrl) {
                        var link = document.createElement('a');
                        link.download = ExportImageName + '.png';
                        link.href = dataUrl;
                        link.click();
                    });
            }


        });

        // Set print size
        //scaleLine.setDpi(resolution);
        map.getTargetElement().style.width = width + 'px';
        map.getTargetElement().style.height = height + 'px';
        map.updateSize();
        map.getView().setResolution(scaleResolution);

    }

    return {
        WebMapExport: WebMapExport
    };
}();