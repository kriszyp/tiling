var canvasHeight = 15;
var canvasWidth = 50;
var matrix = [];
var sizes = [
	{x: 4, y: 4},
	{x: 3, y: 3}
];
var pixelPerUnit = 20;
function createMatrix() {
	for (var y = 0; y < canvasHeight; y++) {
		var row = matrix[y] = [];
		for (var x = 0; x < canvasWidth; x++) {
			row[x] = null;
		}
	}
}
createMatrix();

function findConflicts(x, y, size) {
	var conflicts;
	for (var yi = y; yi < y + size.y; yi++) {
		var row = matrix[yi];
		for (var xi = x; xi < x + size.x; xi++) {
			var existing = row[xi];
			if (existing)	{
				(conflicts || (conflicts = {}))[existing] = true;
			}
		}
	}
	return conflicts;
}

var canvas = document.body.appendChild(document.createElement('div'));
function render() {
	canvas.innerHTML = '';
	for (var y = 0; y < canvasHeight; y++) {
		var row = matrix[y];
		for (var x = 0; x < canvasWidth; x++) {
			var tileNumber = row[x];
			if (tileNumber) {
				var unit = canvas.appendChild(document.createElement('div'));

				unit.style.width = pixelPerUnit + 'px';
				unit.style.height = pixelPerUnit + 'px';
				unit.style.position = 'absolute';
				unit.style.left = x * pixelPerUnit + 'px';
				unit.style.top = y * pixelPerUnit + 'px';
				unit.style.backgroundColor = 'rgb(' + 
					tileNumber * 325 % 256 + ',' +
					tileNumber * 54 % 256 + ',' +
					tileNumber * 67 % 256 + ')';
			}
		}
	}
}
var tileNumber = 1;
var attempt;
function eachTurn() {
	attempt = 0;
	tileNumber++;
	if (tryPlace(tileNumber, 1000)) {
		render();
		requestAnimationFrame(eachTurn, 100);
	}
}

function tryPlace(tileNumber, maxAttempts) {
	start: for (var attempt = 0; attempt < maxAttempts; attempt++) {
		var size = sizes[Math.floor(sizes.length * 0.65 * Math.random())];
		var x = Math.floor(Math.random() * (canvasWidth - size.x + 1));
		var y = Math.floor(Math.random() * (canvasHeight - size.y + 1));
		var conflicts = findConflicts(x, y, size);
		if (conflicts) {
			var numConflicts = 0;
			for (var i in conflicts) {
				numConflicts++;
			}
			if (maxAttempts > 1 && numConflicts < 1 + attempt / 4) {
				var restorePoint = matrix.slice(0);
				for (var yi = 0; yi < canvasHeight; yi++) {
					restorePoint[yi] = restorePoint[yi].slice(0);
				}
				for (var tileToRemove in conflicts) {
					for (var yi = 0; yi < canvasHeight; yi++) {
						var row = matrix[yi];
						for (var xi = 0; xi < canvasWidth; xi++) {
							if (row[xi] == tileToRemove) {
								row[xi] = null;
							}
						}
					}
				}
				// insert the new one
				for (var yi = y; yi < y + size.y; yi++) {
					for (var xi = x; xi < x + size.x; xi++) {
						matrix[yi][xi] = tileNumber;
					}
				}
				for (var i in conflicts) {
					if (!tryPlace(i, Math.min(maxAttempts, 9) - 1)) {
						matrix = restorePoint;
						continue start;
					}
				}
				return true;
			}
		} else {
			// no conflict
			for (var yi = y; yi < y + size.y; yi++) {
				for (var xi = x; xi < x + size.x; xi++) {
					matrix[yi][xi] = tileNumber;
				}
			}
			return true;
		}
	}
}

eachTurn();