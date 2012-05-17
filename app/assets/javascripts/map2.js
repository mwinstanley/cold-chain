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
	fieldIndices = field_indices

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
					showCategory(selections.category);
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
					   	toUpdate[c] = eval(conditions[c].replace(/\{x\}/g, '"' + value + '"'));
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
	showCategory($(select).val());
}

function showCategory(category) {
   	console.log('Displaying category map: ' + category);
    selections.category = category;
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
            if (category == 'pie') {
                setPie(marker);
            } else {
				setImage(marker, userOptions.map[category],
						 category, expr, conditions);
            }
            marker.setMap(thisMap);
        }
    }
    showKey(userOptions.map[category]);
}

function mapSchedule(select) {
   	showSchedule($(select).val());
}

function showSchedule(schedule) {
   	console.log('Displaying schedule: ' + schedule);
    selections.schedule = schedule;
	showCategory(selections.category);
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
    var panelText = '<table><tr><td>(KEY) ' + options[0] + ':</td>';
    for (var i = 2; i < options.length; i++) {
        var color = options[i][2];
        var name = options[i][1];
        panelText += '<td><img src="assets/' + color + '.png" width="15px" height="15px"/> ' + name + '</td>'
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
	var parts = options[1].split(/\s*,,,\s*/);
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
				if (eval(conditions[color].replace(/\{x\}/g, value))) {
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
	var scale = (zoom - 7) * 3 + 6;

	/*    var factor = 40000 / (zoom / 7) / (zoom / 7) / (zoom / 7);
    var scale = marker.info['fi_tot_pop'] / factor;
    if (!selections.considerSize) {
        scale = (zoom - 7) * 3 + 6;
    } else if (marker.info[selections.size] < factor * ((zoom - 7) * 3 + 3)) {
        scale = (zoom - 7) * 3 + 3;
    } else if (marker.info[selections.size] > factor * ((zoom - 7) * 8 + 15)) {
        scale = (zoom - 7) * 8 + 15;
		}*/

    imageName = 'assets/' + imageName + '.png';
    var image = new google.maps.MarkerImage(imageName, new google.maps.Size(
            scale, scale),
            // The origin for this image is 0,0.
            new google.maps.Point(0, 0), new google.maps.Point(scale / 2, scale / 2),
            new google.maps.Size(scale, scale));
			marker.setIcon(image);
}

/*
 * Set the given marker's image to be a pie chart representing the
 * requirements and capacity of the facility represented by the marker.
 */
function setPie(marker) {
    var imageName = 'images/';
    var electricity = parseInt(marker.info['fi_electricity']);
    var gas = parseInt(marker.info['fi_bottled_gas']);
    var kerosene = parseInt(marker.info['fi_kerosene']);
    if (electricity > 1) {
        imageName += 'green';
    } else if (gas == 1 || gas == 2) {
        imageName += 'blue';
    } else if (kerosene == 1 || kerosene == 2) {
        imageName += 'black';
    } else {
        imageName += 'red';
    }
    var reqs = marker.info[selections.schedule];
    // TODO: Incorporate not just 4 degree schedules
    if (reqs) {
        var perCapacity = parseFloat(reqs['Net Storage (Litres): Actual'])
                / parseFloat(reqs['Net Storage (Litres): Required']);
        var percent = Math.floor(perCapacity * 10) / 10 * 100;
        if (perCapacity > 1) {
            percent = 100;
            perCapacity = 1;
        }
        var fridges = marker.info.fridges;
        var total = 0;
        var elec = 0;
        if (fridges) {
            for (f in fridges) {
                var nrg = fridges[f]['ft_power_source'];
                var capacity = parseFloat(fridges[f]['fn_net_volume_4deg']);
                if (nrg == 'E') {
                    elec += capacity;
                }
                total += capacity;
            }
        }
        var red = 0;
        var green = 0;
        if (total == 0) {
            green = percent;
        } else {
            green = Math.floor(perCapacity * (elec / total) * 10) / 10 * 100;
            if (green > 100) {
                alert('percapacity=' + perCapacity + ', elec=' + elec
                        + ', total=' + total + ', reqs1='
                        + reqs['Net Storage (Litres): Actual']
                        + ', reqs2='
                        + reqs['Net Storage (Litres: Required']);
            }
            red = percent - green;
        }

    } else {
        percent = 0;
    }
    if (isNaN(percent)) {
        // alert('NaN, code=' + marker.info[i_facility_code] + ',' +
        // reqs[reqsIndex][0] + ',' + reqs[reqsIndex][1]+','+marker.info);
        imageName += '_0_100_0.png';
    } else {
        // border_green_white_red.png
        imageName += '_' + Math.floor(green) + '_' + Math.floor(100 - percent)
                + '_' + Math.floor(red) + '.png';
    }
    var zoom = map.getZoom();
    var factor = 40000 / (zoom / 7) / (zoom / 7) / (zoom / 7);
    var scale = marker.info['fi_tot_pop'] / factor;
    if (!selections.considerPop) {
        scale = (zoom - 7) * 6 + 6;
    } else if (marker.info['fi_tot_pop'] < factor * ((zoom - 7) * 5 + 5)) {
        scale = (zoom - 7) * 5 + 5;
    } else if (marker.info['fi_tot_pop'] > factor * ((zoom - 7) * 10 + 20)) {
        scale = (zoom - 7) * 10 + 20;
    }

    var image = new google.maps.MarkerImage(imageName, new google.maps.Size(
            scale, scale),
    // The origin for this image is 0,0.
    new google.maps.Point(0, 0), new google.maps.Point(scale / 2, scale / 2),
            new google.maps.Size(scale, scale));
    marker.setIcon(image);
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
            var name = userOptions[infoBoxField.type]['field_options'][infoBoxField.field]['readable_name'];
            var infoPoint;
			if (infoBoxField.type == 'fridge') {
				
            } else if (infoBoxField.type == 'facility') {
				infoPoint = info[fieldIndices[infoBoxField.type][infoBoxField.field]];
				contentString += '<tr><td>' + name + '</td><td>' + infoPoint + '</td></tr>';
			} else if (infoBoxField.type == 'schedule') {
				contentString += '<tr><td>' + name + ':</td><td></td></tr>';
   				for (var sched in info.schedules) {
   					infoPoint = info.schedules[sched][fieldIndices['schedule'][infoBoxField.field]];
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
    var content = $('#content').height();
    var header = $('#header').height();
    var footer = $('#footer').height();

    return Math.floor(content - header - footer);
}

function computeWidth() {
    var content = $('#content').width();
    var navBar = $('#nav-bar').width();

    return Math.floor(content - navBar);
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