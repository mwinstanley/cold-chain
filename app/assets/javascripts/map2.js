//= require jquery
//= require jquery_ujs

/*
 * Code for rendering a Google Map with vaccine cold chain data.
 * Author: Melissa Winstanley
 */

// The map itself.
var map;

// All markers that are displayed on the map - one per facility.
// marker.info stores the raw data associated with the marker.
var markers = {};

// The pop-up window to be displayed on the map.
var infoWindow;

var userOptions;
var fieldIndices;

// User-selected display options. By default, display considering population.
var selections = {};

var electricityCodes = [ [ 'None', 'images/red.png' ],
        [ 'Under 8 hours / day', 'images/orange.png' ],
        [ '8-16 hours / day', 'images/yellow.png' ],
        [ 'Over 16 hours / day', 'images/green.png' ] ];
var keroseneCodes = [ [ 'N/A', null ],
        [ 'Always Available', 'images/green.png' ],
        [ 'Sometimes Available', 'images/yellow.png' ],
        [ 'Not Available', 'images/red.png' ],
        [ 'Unknown', 'images/white.png' ] ];
var gasCodes = [ [ 'N/A', null ], [ 'Always Available', 'images/green.png' ],
        [ 'Sometimes Available', 'images/yellow.png' ],
        [ 'Not Available', 'images/red.png' ],
        [ 'Unknown', 'images/white.png' ] ];
var stockOutCodes = [ [ 'No', 'images/green.png' ], [ 'Yes', 'images/red.png' ] ];
var surplusCodes = [ [ 'Over 30% shortage', 'images/red.png' ],
                     [ '10-30% shortage', 'images/yellow.png' ],
                     [ '+- 10%', 'images/white.png' ],
                     [ '10-30% surplus', 'images/blue.png' ],
                     [ 'Over 30% surplus', 'images/green.png' ] ];

var schedules = [ 'base', 'pcv', 'rota' ];

var facilityTypeCodes = [ 'N/A', 'National vaccine store',
        'Regional vaccine store', 'District vaccine store',
        'District hospital - MoH', 'Central hospital - MoH',
        'Rural hospital - MoH', 'Hospital - CHAM', 'Community hospital - CHAM',
        'Hospital - private', 'Health centre - MoH', 'Health centre - CHAM',
        'Health centre - private', 'Maternity - local government',
        'Maternity - MoH', 'Dispensary - local government', 'Dispensary - MoH',
        'Health post - MoH' ];

var facilityTypes = {
        'all' : [],
        'national-regional' : [ 1, 2 ],
        'district' : [ 3 ],
        'health-center' : [ 10, 11 ],
        'health-post' : [ 16, 17 ],
        'other' : [ 4, 5, 6, 7, 8, 9, 12, 13, 14, 15 ]
    };

function displayMap(facilities, fridges, schedules, options, field_indices) {
	console.log(options);
	console.log(field_indices);
	userOptions = options;
	fieldIndices = field_indices;
	selections.considerSize = true;

	$('#overlay').hide();

	var latlng = new google.maps.LatLng(options.lat_center, options.lon_center);
	var myOptions = {
			zoom : 7,
			center : latlng,
			mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	infoWindow = new google.maps.InfoWindow({
		 	content : 'hi there!'
    });
	var mapDiv = document.getElementById('map-canvas');
	map = new google.maps.Map(mapDiv, myOptions);
	google.maps.event.addListener(map, 'zoom_changed', function() {
					if (selections.category_is_map) {
						showCategory(selections.category);
					} else {
						showPie(selections.category);
					}
	});

	var main_index = field_indices.facility[options.facility.main_col];
	for (var i = 0; i < facilities.length; i++) {
		var lat = facilities[i][field_indices.facility[options.lat]];
		var lon = facilities[i][field_indices.facility[options.lon]];
		if (lat != null && lon != null) {
			var latlng2 = null;
			if (options.is_utm) {
				latlng2 = parseUTM(lat, lon, options.zone, options.south_hemi);
			} else {
				latlng2 = new google.maps.LatLng(parseFloat(lat), parseFloat(lon));
			}
			addMarker(latlng2, facilities[i], main_index);
		}
	}

	// TODO: take into account already-set options
	selections.schedule = $('#schedule_chooser').val();

	resize();
	showCategory($('#category_mapper').val());

	// add fridges
	main_index = field_indices.fridge[options.fridge.main_col];
	for (var i = 0; i < fridges.length; i++) {
		var marker = markers[fridges[i][main_index]];
		if (!marker.info.fridges) {
			marker.info.fridges = [];
		}
		marker.info.fridges.push(fridges[i]);
	}

	// add schedules
	main_index = field_indices.schedule[options.schedule.main_col];
	for (var schedType in schedules) {
   		for (var i = 0; i < schedules[schedType].length; i++) {
		   	var marker = markers[schedules[schedType][i][main_index]];
			if (!marker.info.schedules) {
   				marker.info.schedules = {};
			}
			marker.info.schedules[schedType] = schedules[schedType][i];
		}
	}
}

function toggleSize() {
	if (selections.considerSize) {
		selections.considerSize = false;
	} else {
		selections.considerSize = true;
	}
	if (selections.category_is_map) {
		showCategory(selections.category);
	} else {
		showPie(selections.category);
	}
}

function applyFilter(select) {
   	var val = $(select).val();
    var filter = $(select).attr('name');
   	console.log('Filtering ' + filter + ' by ' + val);
    selections[filter] = val;
    if (markers) {
   		var conditions = parseFilterConditions(userOptions.filter[filter]);
		var options = userOptions.filter[filter];
		var parts = options[1].split(/\s*,,,\s*/);
		var expr = parts[0].length == 0 ?
				new Expression('{' + parts[2] + '::' + parts[1] + '}') :
				new Expression(parts[0]);
		console.log(expr);
        for (m in markers) {
            var marker = markers[m];
			var include;
			var cached = marker.filters[filter];
			if (expr.isScheduleDependent && cached != undefined && cached[selections.schedule] != undefined) {
				include = cached[selections.schedule][val];
			} else if (cached != undefined && !expr.isScheduleDependent) {
				include = cached[val];
			} else {
				var value = expr.evaluate(marker.info, null);
				if (marker.filters[filter] == undefined) {
					marker.filters[filter] = [];
				}
				var toUpdate = expr.isScheduleDependent ?
						marker.filters[filter][selections.schedule] :
						marker.filters[filter];
				if (expr.isScheduleDependent && toUpdate == undefined) {
					markers.filters[filter][selections.schedule] = [];
				}
				for (var c in conditions) {
				   	try {
					   	toUpdate[c] = eval(conditions[c].replace(/x/g, '"' + value + '"'));
					} catch (e) {
   						console.log('ERROR: ' + e);
   						toUpdate[c] = false;
					}
				}
				include = toUpdate[val];
			}
			for (var filt in userOptions.filter) {
                var curFilter = userOptions.filter[filt];
                include = include && (!selections[filt] ||
                                      marker.filters[filt][selections[filt]]);
            }
            if (include) {
                marker.setMap(map);
            } else {
                marker.setMap(null);
            }
        }
    }
}

function alterSize(sizing, field) {
    
}

function mapData(select) {
	var $opt = $('option:selected', $(select));
	var group = $opt.closest('optgroup').attr('label');
	var value = $(select).val();
	if (group == 'Pies') {
		showPie(value);
	} else {
		showCategory(value);
	}
}

function showCategory(category) {
   	console.log('Displaying category map: ' + category);
    selections.category = category;
	selections.category_is_map = true;
    if (markers) {
   		var conditions = parseMapConditions(userOptions.map[category]);
		var parts = userOptions.map[category][1].split(/\s*,,,\s*/);
		var expr = parts[0].length == 0 ?
				new Expression('{' + parts[2] + '::' + parts[1] + '}') :
				new Expression(parts[0]);
		console.log(expr);
        for (m in markers) {
            var marker = markers[m];
            var thisMap = marker.getMap();
			setImage(marker, userOptions.map[category],
					 category, expr, conditions);
            marker.setMap(thisMap);
        }
    }
    showKey(userOptions.map[category]);
}

function showPie(category) {
   	console.log('Displaying category pie: ' + category);
    selections.category = category;
	selections.category_is_map = false;
    if (markers) {
   		var outerConditions = parsePieConditions(userOptions.pie[category][2]);
   		var innerConditions = parsePieConditions(userOptions.pie[category][3]);
		var variables = userOptions.pie[category][1];
		var varExprs = {};
		for (var i = 0; i < variables.length; i++) {
			varExprs[variables[i][0]] = new Expression(variables[i][1]);
		}
		console.log(varExprs);
        for (m in markers) {
            var marker = markers[m];
            var thisMap = marker.getMap();
			setPie(marker, userOptions.pie[category],
				   category, varExprs, outerConditions, innerConditions);
            marker.setMap(thisMap);
        }
    }
	showPieKey(userOptions.pie[category]);
}

function mapSchedule(select) {
   	showSchedule($(select).val());
}

function showSchedule(schedule) {
   	console.log('Displaying schedule: ' + schedule);
    selections.schedule = schedule;
	if (selections.category_is_map) {
		showCategory(selections.category);
	} else {
		showPie(selections.category);
	}
}

/*
 * Sets up the UI, including the map itself, the buttons, and the markers.
 */
function setUpUI() {
    // Set up the map
    
    // TODO: Allow changes to center of map.
    // Set up mapping.
    var categories = {};
	/*    for (var i = 0; i < userOptions.map.length; i++) {
        var mapCategory = userOptions.map[i];
        if (!selections.category) {
            selections.category = mapCategory;
        }
        console.log(userOptions);
        categories[mapCategory] = userOptions[mapCategory].name;
    }
    addDropBoxOptions('Category', 'category', categories, function(type, category) {
        showCategory(category);
        showKey(category);
    });

    // Set up size options
    /*var sizes = {};
    for (var i = 0; i < userOptions.size.length; i++) {
        var size = userOptions.size[i];
        if (!selections.size) {
            selections.size = size;
        }
        sizes[size] = userOptions[size].name;
    }
    addDropBoxOptions('Size', 'size', sizes, alterSize);
    
    $button =  $('<input>', {
        type: 'button',
        val: 'Consider Size',
        name: 'update-size',
        'class': 'btn',
    });
    $button.click(function() {
        if (selections.considerSize) {
            $button.html('Consider size');
        } else {
            $button.html('Ignore size');
        }
        selections.considerSize = !selections.considerSize;
        showCategory(selections.category);
    });
    addElement($button, 'Sizing');
    
    addDropBoxOptions('#schedule', schedule, showSchedule);*/
}

// ------------------ KEY ----------------------------------------
/*
 * Display the key based on the current type of information being displayed.
 */
function showKey(options) {
    var panelText = '<table class="table-key"><tr><td>(KEY) ' + options[0] + ':</td>';
    for (var i = 2; i < options.length; i++) {
        var color = options[i][2];
        var name = options[i][1];
        panelText += '<td><img src="assets/' + color + '.png" width="15px" height="15px"/> ' + name + '</td>'
    }
    panelText += '</tr></table>';

    $('#footer').html(panelText);
}

/*
 * Display the pie key based on the current type of information being displayed.
 */
function showPieKey(options) {
    var panelText = '<table class="table-key"><tr><td>(KEY) ' + options[0] + ':</td>';
    for (var i = 0; i < options[2].length; i++) {
		var color = options[2][i][2];
        var name = options[2][i][1];
        panelText += '<td><img src="assets/' + color + '_0_100_0.png" width="15px" height="15px"/> ' + name + '</td>';
    }
	for (var i = 0; i < options[3].length; i++) {
		var color = options[3][i][2];
		var name = options[3][i][1];
		var image = '_' + (color == 'green' ? 100 : 0) + '_' + (color == 'white' ? 100 : 0) + '_' + (color == 'red' ? 100 : 0);
        panelText += '<td><img src="assets/black' + image + '.png" width="15px" height="15px"/> ' + name + '</td>';
	}
    panelText += '</tr></table>';

    $('#footer').html(panelText);
}

// ------------------ MARKERS ------------------------------------
/*
 * Add a new marker to the map corresponding with the given location and
 * representing the given data.
 */
function addMarker(location, data, index) {
    markers[data[index]] = makeMarker(location, data);
}

/*
 * Creates and returns a new marker corresponding with the given location
 * and representing the given information.
 */
function makeMarker(location, info) {
    // TODO: how to make markers so they aren't cut off, without using "optimized"
    var marker = new google.maps.Marker({
        position : location,
        map : map,
        optimized : false
    });
    marker.info = info;
	marker.maps = [];
	marker.filters = [];
	marker.pies = [];
    imageName = 'assets/red.png';
	var zoom = map.getZoom();
	var scale =  (zoom - 7) * 3 + 6;
    var image = new google.maps.MarkerImage(imageName, new google.maps.Size(
            scale, scale),
            // The origin for this image is 0,0.
            new google.maps.Point(0, 0), new google.maps.Point(scale / 2, scale / 2),
            new google.maps.Size(scale, scale));
    marker.setIcon(image);

    // Marker starts out displaying electrictiy information
    //setImage(marker, parseInt(info['fi_electricity']), 'fi_electricity');

    var listener = makeInfoBoxListener(marker);
    google.maps.event.addListener(marker, 'click', listener);
    // google.maps.event.addListener(marker, 'mouseover', listener);
    return marker;
}

/*
 * Set the image of the given marker to represent the given category's value.
 */
function setImage(marker, options, category, expr, conditions) {
   	var imageName;
	var cached = marker.maps[category];
	if (expr.isScheduleDependent && cached && cached[selections.schedule]) {
   		imageName = cached[selections.schedule];
	} else if (cached && !expr.isScheduleDependent) {
   		imageName = cached;
	} else {
		var value = expr.evaluate(marker.info, null);
		imageName = 'white';
		for (var color in conditions) {
	   		try {
				if (eval(conditions[color].replace(/x/g, value))) {
					imageName = color;
					break;
				}
			} catch (e) { }
		}
		if (expr.isScheduleDependent) {
   			if (!marker.maps[category]) {
				marker.maps[category] = {};
			}
			marker.maps[category][selections.schedule] = imageName;
		} else {
			marker.maps[category] = imageName;
		}
	}

    var zoom = map.getZoom();
    var factor = 40000 / (zoom / 7) / (zoom / 7) / (zoom / 7);
    var pop = marker.info[fieldIndices.facility['fi_tot_pop']];
    var scale = pop / factor;
    if (!selections.considerSize) {
        scale = (zoom - 7) * 3 + 6;
    } else if (pop < factor * ((zoom - 7) * 3 + 3)) {
        scale = (zoom - 7) * 3 + 3;
    } else if (pop > factor * ((zoom - 7) * 8 + 15)) {
        scale = (zoom - 7) * 8 + 15;
	}

    imageName = 'assets/' + imageName + '.png';
    var image = new google.maps.MarkerImage(imageName, new google.maps.Size(
            scale, scale),
            // The origin for this image is 0,0.
            new google.maps.Point(0, 0), new google.maps.Point(scale / 2, scale / 2),
            new google.maps.Size(scale, scale));
	marker.setIcon(image);
}

function check2(proportions, c1, c2, not) {
		if (proportions[c1] != 0 && proportions[c2] != 0 &&
			proportions[not] == 0 && proportions[c1] + proportions[c2] != 100) {
				proportions[c2] = 100 - proportions[c1];
		}
}

function checkProportions(proportions) {
    // border_green_white_red.png
	if (!proportions.green) {
		proportions.green = 0;
	}
	if (!proportions.red) {
		proportions.red = 0;
	}
	if (!proportions.white) {
		proportions.white = 0;
	}
	check2(proportions, 'green', 'red', 'white');
	check2(proportions, 'green', 'white', 'red');
	check2(proportions, 'white', 'red', 'green');


	if (proportions.green + proportions.red + proportions.white != 100) {
		proportions.white = 100 - proportions.green - proportions.red;
	}

}

/*
 * Set the given marker's image to be a pie chart representing the
 * requirements and capacity of the facility represented by the marker.
 */
function setPie(marker, options, category, varExprs,
				outerConditions, innerConditions) {
   	var imageName;
	var cached = marker.pies[category];
	var schedDependent = false;
	for (var x in varExprs) {
		if (varExprs[x].isScheduleDependent) {
			schedDependent = true;
		}
	}
	if (schedDependent && cached && cached[selections.schedule]) {
   		imageName = cached[selections.schedule];
	} else if (cached && !schedDependent) {
   		imageName = cached;
	} else {
		var values = {};
		for (var x in varExprs) {
			values[x] = varExprs[x].evaluate(marker.info, null);
		}
		
		var outerColor = 'black';
		for (var color in outerConditions) {
	   		try {
				var newCond = outerConditions[color];
				for (var x in values) {
					var re = new RegExp(x, "g");
					newCond = newCond.replace(re, values[x]);
				}
				if (eval(newCond)) {
					outerColor = color;
					break;
				}
			} catch (e) { }
		}

		var proportions = {};
		for (var color in innerConditions) {
	   		try {
				var newCond = innerConditions[color];
				for (var x in values) {
					var re = new RegExp(x, "g");
					newCond = newCond.replace(re, values[x]);
				}
				proportions[color] = eval(newCond);
				proportions[color] = Math.floor(proportions[color] * 10) / 10 * 100;
			} catch (e) { }
		}

		checkProportions(proportions);

        imageName = outerColor;
		imageName += '_' + Math.floor(proportions['green']) +
				    '_' + Math.floor(proportions['white']) + '_' +
				    Math.floor(proportions['red']);


		if (schedDependent) {
   			if (!marker.pies[category]) {
				marker.pies[category] = {};
			}
			marker.pies[category][selections.schedule] = imageName;
		} else {
			marker.pies[category] = imageName;
		}
	}

    var zoom = map.getZoom();
    var factor = 40000 / (zoom / 7) / (zoom / 7) / (zoom / 7);
    var pop = marker.info[fieldIndices.facility['fi_tot_pop']];
    var scale = pop / factor;
    if (!selections.considerSize) {
        scale = (zoom - 7) * 6 + 6;
    } else if (pop < factor * ((zoom - 7) * 5 + 5)) {
        scale = (zoom - 7) * 5 + 5;
    } else if (pop > factor * ((zoom - 7) * 10 + 20)) {
        scale = (zoom - 7) * 10 + 20;
	}

    imageName = 'assets/' + imageName + '.png';
    var image = new google.maps.MarkerImage(imageName, new google.maps.Size(
            scale, scale),
            // The origin for this image is 0,0.
            new google.maps.Point(0, 0), new google.maps.Point(scale / 2, scale / 2),
            new google.maps.Size(scale, scale));
	marker.setIcon(image);
}

function getTranslatedValue(value, type, field) {
	var val_opt = userOptions[type]['field_options'][field]['value_options'];
	if (val_opt) {
		var val_translated = val_opt[value];
		if (val_translated != undefined && val_translated != null) {
			value = val_translated;
		}
	}
	return value;
}

/*
 * Sets up the info box listener to show up for a particular marker.
 */
function makeInfoBoxListener(marker) {
    return function() {
        var info = marker.info;
        var contentString = '<div id="popup-content">';
		contentString += '<h3>' + info[fieldIndices['facility'][userOptions.info_box.title_field]] + '</h3>';
		contentString += '<table>';
        for (var i = 0; i < userOptions.info_box.data.length; i++) {
            var infoBoxField = userOptions.info_box.data[i];
			var field_opt = userOptions[infoBoxField.type]['field_options'][infoBoxField.field];
            console.log(userOptions[infoBoxField.type]['field_options']);
			console.log(infoBoxField.field);
			var name = field_opt['readable_name'];
            var infoPoint;
			if (infoBoxField.type == 'fridge') {
				contentString += '<tr><td>' + name + '</td><td>';
				var first = true;
   				for (var fridge in info.fridges) {
   					infoPoint = info.fridges[fridge][fieldIndices['fridge'][infoBoxField.field]];
					infoPoint = getTranslatedValue(infoPoint, infoBoxField.type, infoBoxField.field);
					contentString += (first ? '' : ', ') + infoPoint;
					first = false;
				}
				contentString += '</td></tr>';
            } else if (infoBoxField.type == 'facility') {
				infoPoint = info[fieldIndices[infoBoxField.type][infoBoxField.field]];
				infoPoint = getTranslatedValue(infoPoint, infoBoxField.type, infoBoxField.field);
				contentString += '<tr><td>' + name + '</td><td>' + infoPoint + '</td></tr>';
			} else if (infoBoxField.type == 'schedule') {
				contentString += '<tr><td>' + name + ':</td><td></td></tr>';
   				for (var sched in info.schedules) {
   					infoPoint = info.schedules[sched][fieldIndices['schedule'][infoBoxField.field]];
					infoPoint = getTranslatedValue(infoPoint, infoBoxField.type, infoBoxField.field);
					contentString += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
							         userOptions.schedule.file_readable_names[sched] +
							         '</td><td>' + infoPoint + '</td></tr>';
				}
			}
			var value = infoPoint;
        }
        contentString += '</table></div>';
        
        infoWindow.content = contentString;
        infoWindow.open(map, marker);
    };
}

function computeHeight() {
    var content = $('#content').outerHeight();
    var header = $('#header').outerHeight();
    var footer = $('#footer').outerHeight();

    return Math.floor(content - header - footer);
}

function computeWidth() {
    var content = $('#content').outerWidth();
    var navBar = $('#nav-bar').outerWidth();

    return Math.floor(content - navBar - 10);
}

function resize() {
    $('#map-canvas').height(computeHeight());
    $('#map-canvas').width(computeWidth());
}

$(window).resize(function() {
    resize();
});

/*
 * Returns a string version of the object for debugging
 * purposes. The string contains each field of the object
 * and its corresponding value.
 */
function getString(obj) {
    var res = '';
    for (f in obj) {
        res = res + ', ' + f + ': ' + obj[f];
    }
    return res;
}