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
var selections = { 'considerPop' : true };

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

function displayMap(facilities, fridges, options, field_indices) {
	console.log(options);
	console.log(facilities);
	userOptions = options;
	fieldIndices = field_indices

	var latlng = new google.maps.LatLng(options.lat_center, options.lon_center);
	var myOptions = {
			zoom : 7,
			center : latlng,
			mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	infoWindow = new google.maps.InfoWindow({
		 	content : "hi there!"
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

	// add fridges
	main_index = field_indices.facility[options.fridge.main_col];
	for (var i = 0; i < fridges.length; i++) {
		var marker = markers[fridges[i][main_index]];
		marker.info.fridges.push(fridges[i]);
	}

	resize();
	for (var m in userOptions.map) {
   		console.log('Showing map: ' + m);
	   	showCategory(m);
		break;
	}
}

function requestData() {
    $.ajax({
        type: "GET",
        url: "/facilities",
        data: "type=d&id=" + getCookie('id'),
        success: function(responseText) {
            console.log(responseText);
            //var json = JSON.parse(responseText);
            userOptions = responseText.options;
            //parseUserOptions(userOptions);
            var data = responseText.facilities;
            setUpUI();
            showCategory(selections.category);
        }
    });
}

function parseUserOptions(options) {
    options.map = [];
    options.filter = [];
    options.infoBox = [];
    options.size = [];
    for (var i = 0; i < options.fields.length; i++) {
        var field = options.fields[i];
        var id = field.id;
        var display = field.displayType;
        if (display == 'MAP') {
            options.map.push(id);
        } else if (display == 'FILTER') {
            options.filter.push(id);
        } else if (display == 'SIZE') {
            options.size.push(id);
        } else if (display == 'UTMLAT') {
            options.lat = id;
        } else if (display == 'UTMLON') {
            options.lon = id;
        }
        if (field.inInfoBox) {
            console.log('Adding ' + id + ' to info box');
            options.infoBox.push(id);
        }
        var vals = {};
        for (var j = 0; j < field.values.length; j++) {
            var val = field.values[j];
            vals[val.id] = val;
        }
        field.values = vals;
        options[id] = field;
    }
    options.fields = null;
}

function addElement(element, name) {
    $tr = $('<tr>');
    $('<td>').append('<p>' + name + '</p>').append(element).appendTo($tr);
    $('#nav-bar table').append($tr);
}

function applyFilter(select) {
   	var val = $(select).val();
    var filter = $(select).attr('name');
	console.log('filter = ' + filter + ', value = ' + val);
    selections[filter] = val;
    if (markers) {
   		var conditions = parseFilterConditions(userOptions.filter[filter]);
		var options = userOptions.filter[filter]
        for (m in markers) {
            var marker = markers[m];
			var parts = options[1].split(/\s*,,,\s*/);
			var value;
			if (parts[0].length == 0) {
				// account for fridge/schedule
			   	value = marker.info[fieldIndices['facility'][parts[1]]];
				// use pre-selection
			} else {
			   	// parse user expression
			}
			if (!marker.filters[filter]) {
   				marker.filters[filter] = [];
				for (var c in conditions) {
				   	try {
					   	marker.filters[filter][c] = eval(conditions[c].replace(/\{x\}/g, '"' + value + '"'));
					} catch (e) {
   						console.log('ERROR: ' + e);
   						marker.filters[filter][c] = false;
					}
				}
			}
            var include = value == '' || marker.filters[filter][val];
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
    selections.category = category;
    if (markers) {
   		var conditions = parseMapConditions(userOptions.map[category]);
        for (m in markers) {
            var marker = markers[m];
            var thisMap = marker.getMap();
            if (category == 'pie') {
                setPie(marker);
            } else if (category == 'surplus') {
                setImage(marker, marker.info[category], category);
            } else {
   				setImage(marker, userOptions.map[category], category, conditions);
            }
            marker.setMap(thisMap);
        }
    }
    showKey(userOptions.map[category]);
}

function showSchedule(schedule) {
    selections.schedule = schedule;
    if (selections.category == 'surplus' || selections.category == 'pie') {
        showCategory(selections.category);
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

function parseExpr(data, expr) {

}

var translation = {'lt': '<',
				   'gt': '>',
				   'lte': '<=',
				   'gte': '>=',
				   '(': '(',
				   ')': ')',
				   'OR': '||',
				   'AND': '&&',
				   'NOT': '!',
				   '{x}': '{x}' };
function parseCondition(options) {
   	var c = options[0].split(/\s+/);
	var expr = '';
	for (var j = 0; j < c.length; j++) {
   	   	if (c[j] == '=') {
   			expr += '==';
		} else if (c[j] == 'lt' || c[j] == 'gt' || c[j] == 'gte' ||
				   c[j] == 'lte' || c[j] == '(' || c[j] == ')' ||
				   c[j] == 'OR' || c[j] == 'AND' || c[j] == 'NOT' ||
				   c[j] == '{x}') {
			expr += translation[c[j]];
		} else if((c[j].length > 2 && c[j][0] == '"' &&
				   c[j][c[j].length - 1] == '"')) {
		   	expr += c[j];
		} else {
   	   	   	var num = parseFloat(c[j]);
   	   		if (isNaN(num)) {
   	   			alert('Invalid expression: ' + expr + ', tried to add ' + c[j]);
   	   		} else {
   	   			expr += num;
   	   		}
		}
	}
	return expr;
}

function parseFilterConditions(options) {
   	var conditions = {};
	for (var i = 2; i < options.length; i++) {
   		var expr = parseCondition(options[i]);
		conditions[options[i][1]] = expr;
	}
	return conditions;
}

function parseMapConditions(options) {
   	var conditions = {};
	for (var i = 2; i < options.length; i++) {
   		var expr = parseCondition(options[i]);
		conditions[options[i][2]] = expr;
	}
	return conditions;
}

/*
 * Set the image of the given marker to represent the given category's value.
 */
function setImage(marker, options, category, conditions) {
		// cache computations?
   	var imageName;
	if (marker.maps[category]) {
   		imageName = marker.maps[category];
	} else {
		var parts = options[1].split(/\s*,,,\s*/);
		var value;
		if (parts[0].length == 0) {
			// account for fridge/schedule
			value = marker.info[fieldIndices['facility'][parts[1]]];
			// use pre-selection
		} else {
			// parse user expression
		}
		
		imageName = 'white';
		for (var color in conditions) {
	   		try {
					if (eval(conditions[color].replace(/\{x\}/g, value))) {
					imageName = color;
					break;
				}
			} catch (e) { }
		}
		marker.maps[category] = imageName;
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
			}
			var value = infoPoint;
            contentString += '<tr><td>' + name + '</td><td>' + value + '</td></tr>';
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
    // $('#map-canvas').css('height', height + 'px');
    // $('#map-canvas').css('width', width + 'px');
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