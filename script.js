var Wave = (function () {
    var TAG = "[WAVE]";
    var $win, $canvas, ctx;
    var drawTimer;
    var drawLoopIndex = 0;
    var bounceTime = 35;

    var boxCols, boxRows;
    var boxes = [];
    var forces = [];

    function boxesEach(callback) {
        for (var col = 0; col < boxCols; col++) {
            for (var row = 0; row < boxRows; row++) {
                callback(boxes[col][row], col, row);
            }
        }
    };

    var windowPadding = 100;
    var boxSize = 40;
    var boxSizePerForce = 40;
    var boxMargin = 60;
    var conductivity = 0.75;
    var conductivityTime = 200;

    var colors = {
        background: "#ffffee",
        box: "#121005"
    };

    var getCubic = function (index) {
        if (index < (bounceTime / 2)) {
            return index / (bounceTime / 2)
        } else {
            return (bounceTime - index) / (bounceTime / 2)
        }
    };

    var getForce = function (col, row, loopIndex) {
        var force = 0;
        for (var i = 0; i < forces.length; i++) {
            var curForce = forces[i].scala * getCubic(loopIndex - forces[i].loopIndex)

            if (curForce <= 0) {
                forces.shift();
                continue;
            }

            if (forces[i].col !== col || forces[i].row !== row) {
                continue;
            }

            force += curForce;
        }

        return force;
    };

    var setCanvasToFullSize = function () {
        $canvas.prop({
            "width": $win.width(),
            "height": $win.height()
        });
    };

    var setDrawLoop = function () {
        return requestAnimationFrame(function () {
            _class.prototype.run();
        });
    };

    var touchCanvas = function (e) {
        boxesEach(function (box, col, row) {
            if ((box.left < e.offsetX && (box.left + box.width) > e.offsetX) &&
                (box.top < e.offsetY && (box.top + box.height) > e.offsetY)) {
                sendForce(col, row, 1);
            }
        });
    };

    var sendForce = function (col, row, scala, vector) {
        if (col < 0 || col > boxCols ||
            row < 0 || row > boxRows) {
            return;
        }

        forces.push({
            col: col,
            row: row,
            scala: scala,
            loopIndex: drawLoopIndex
        });

        setTimeout(function () {
            if (vector) {
                if (Math.abs(vector[0]) === Math.abs(vector[1])) {
                    sendForce(col, row + vector[1], scala * conductivity, [0, vector[1]]);
                    sendForce(col + vector[0], row, scala * conductivity, [vector[0], 0]);
                    sendForce(col + vector[0], row + vector[1], scala * conductivity / Math.sqrt(2), vector);
                } else {
                    sendForce(col + vector[0], row + vector[1], scala * conductivity, vector);
                }
            } else {
                for (var vectorX = -1; vectorX <= 1; vectorX++) {
                    for (var vectorY = -1; vectorY <= 1; vectorY++) {
                        if (vectorX === 0 && vectorY === 0)
                            continue;

                        var nextScala = scala * conductivity / (Math.abs(vectorX) === Math.abs(vectorY) ? Math.sqrt(2) : 1);
                        sendForce(col + vectorX, row + vectorY, nextScala, [
                            vectorX, vectorY
                        ])
                    }
                }
            }
        }, conductivityTime);
    };

    var _class = function () {
        $canvas = $("<canvas>");
        $win = $(window);

        $win.on("resize", setCanvasToFullSize);

        $canvas.on('click', touchCanvas);

        ctx = $canvas[0].getContext("2d");
    };

    _class.prototype.showIn = function (selector) {
        if (document.querySelectorAll(selector).length < 1) {
            console.error(TAG, selector + " not found");
        }

        $canvas.appendTo(selector);
        setCanvasToFullSize();
    };

    _class.prototype.calcBoxes = function () {
        boxCols = Math.floor(($win.width() - windowPadding * 2) / (boxSize + boxMargin));
        boxRows = Math.floor(($win.height() - windowPadding * 2) / (boxSize + boxMargin));

        var minLeft = ($win.width() - boxCols * (boxSize + boxMargin)) / 2;
        var minTop = ($win.height() - boxRows * (boxSize + boxMargin)) / 2;

        var calcBoxes = [];

        for (var col = 0; col < boxCols; col++) {
            calcBoxes.push([]);

            for (var row = 0; row < boxRows; row++) {
                var forceSize = getForce(col, row, drawLoopIndex) * boxSizePerForce;

                calcBoxes[col][row] = {
                    left: minLeft + col * (boxSize + boxMargin) + boxMargin / 2 - forceSize / 2,
                    top: minTop + row * (boxSize + boxMargin) + boxMargin / 2 - forceSize / 2,
                    width: boxSize + forceSize,
                    height: boxSize + forceSize
                };
            }
        }

        return calcBoxes;
    };

    _class.prototype.run = function () {
        drawLoopIndex++;
        drawTimer = setDrawLoop();

        boxes = this.calcBoxes();

        console.log(forces.length);

        this.draw();
    };

    _class.prototype.draw = function () {
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, $canvas.width(), $canvas.height());

        ctx.fillStyle = colors.box;

        boxesEach(function (box) {
            ctx.fillRect(box.left, box.top, box.width, box.height);
        });
    };

    return _class;
})();

var wave = new Wave();

wave.showIn('body');

wave.run();