//= require jquery
//= require jquery_ujs

var curTab;
var fileTypes = ['Main facility data', 'Refrigerator data', 'Schedule data'];
var fileTypeIDs = ['main', 'fridge', 'schedule'];
var updateTypes = ['s', 'f', 'v'];
var canUpdate = [true, false, false];

$(document).ready(function() {
    $('#tabs div').hide();
    $('#tabs div:first').show();
    $('#tabs ul li:first').addClass('active');
	curTab = $('#tabs ul li:first a').attr('href');
	console.log(curTab);
    $('#tabs ul li a').click(function(){
        $('#tabs ul li').removeClass('active');
        $(this).parent().addClass('active');
        curTab = $(this).attr('href');
        $('#tabs div').hide();
        $(curTab).show();
        return false;
    });
    
    requestUserOptions();
});

function requestHeader(userOptions, id) {
	console.log("Requesting field header");
    $.ajax({
        type: 'GET',
        url: '/facilities',
		data: 'type=h&id=' + id,
        success: function(responseText) {
							console.log('HERE');
            console.log(responseText);
            //var options = userOptions ? JSON.parse(userOptions) : null;
            setUpFileTab(userOptions);
            setUpFieldTable(responseText, userOptions);
            setUpValueTable(userOptions);
        }
    });
}
    
function requestUserOptions() {
    var urlVars = getUrlVars();
    var id = null;
    if (urlVars['id'] && urlVars['id'].match(/^\d+$/)) {
        id = urlVars['id'];
        document.cookie = 'id=' + escape(urlVars['id']);
    }
    if (id != null) {
        $.ajax({
            type: 'GET',
            url: '/user_options/' + id,
            data: id,
            success: function(responseText) {
				console.log(responseText);
                requestHeader(responseText, id);
            }
        });
    } else {
        setUpFileTab(null);
    }
}


//--------------- TAB SET UP -------------------------
function addFileRow(name, full, data, id) {
    var $tr = $('<tr>');
	$tr.attr('class', id);
    $('<td>').append('<p>' + name + '</p>').appendTo($tr);
    $('<td>').append( $('<input>', {
        type: 'text',
        val: data != null ? data.name : '',
        'class': 'text'
    })).appendTo($tr);
    $('<td>').append( $('<input>', {
        type: 'text',
        val: data != null ? data.title : '',
        'class': 'text'
    })).appendTo($tr);
	$('<td>').append( $('<input>', {
	    type: 'text',
		val: data != null ? data.join_main : '',
        'class': 'text'
    })).appendTo($tr);
    if (full) {
        $('<td>').append( $('<input>', {
            type: 'text',
            val: data != null ? data.join_secondary : '',
            'class': 'text'
        })).appendTo($tr);
    }
    return $tr
}

function setUpFileTab(options) {
	canUpdate[0] = true;
    var $table = $('<table>');
    var $thead = $('<thead>');
    var $tr = $('<tr>');
    $('<th>').append('Type of file').appendTo($tr);
    $('<th>').append('File name').appendTo($tr);
    $('<th>').append('Human-readable title').appendTo($tr);
    $('<th>').append('Join on this column from the main file').appendTo($tr);
    $('<th>').append('Join on this column from the secondary file').appendTo($tr);
    
    $thead.append($tr);
    $table.append($thead);
    
    var $tbody = $('<tbody>');
    var hasData = options != null;
	$tbody.append(addFileRow(fileTypes[0], false, hasData ? options[fileTypeIDs[0]] : null, fileTypeIDs[0]))
	$tbody.append(addFileRow(fileTypes[1], true, hasData ? options[fileTypeIDs[1]] : null, fileTypeIDs[1]))
	
	for (var i = 0; i < (hasData ? options[fileTypeIDs[2]].length : 1); i++) {
   	    $tbody.append(addFileRow(fileTypes[2], true,
   		   					     hasData ? options[fileTypeIDs[2]][i] : null,
   							     fileTypeIDs[2]));
   	}
    $table.append($tbody);
    $('#files').append($table);
    
    var $button =  $('<input>', {
        type: 'button',
        val: 'Add schedule',
        name: 'Add schedule',
        'class': 'btn',
    });
    $button.click(function() {
		$('#files tbody').append(addFileRow(fileTypes[2], true, null, fileTypeIDs[2]));
    });
    $('#files').append($button);
}

function setUpFieldTableSection(header, options, fileID, fileName) {
    var $table = $('<table>');
    $table.attr('id', 'fields_' + fileID);
    var $thead = $('<thead>');
    var $tr = $('<tr>');
    $('<th>').append('Field name').appendTo($tr);
    $('<th>').append('Rename field').appendTo($tr);
    $('<th>').append('Include in map?').appendTo($tr);
    $('<th>').append('Type of field').appendTo($tr);

    $thead.append($tr);
    $table.append($thead);

	console.log(options);
    var $tbody = $('<tbody>');
    var fields = options == null ? null : options[fileID]['field_options'];
    var num = 0;
    for (var i = 0; i < header.length; i++) {
        var found = fields && fields[header[i]];
        $tr = $('<tr>');
        $('<td>').append('<p>' + header[i] + '</p>').appendTo($tr);
        $('<td>').append( $('<input>', {
            type: 'text',
            val: found ? fields[header[i]].name : header[i],
            name: header[i],
            'class': 'text'
        })).appendTo($tr);
        var $checkbox =  $('<input>', {
            type: 'checkbox',
            val: found ? fields[header[i]].name : header[i],
            name: header[i],
            'class': 'check'
        });
        if (found) {
            $checkbox.attr('checked','checked');
            updateButton = true;
        }
        $('<td>').append($checkbox).appendTo($tr);
        var $select = $('<select>', {
            name: header[i] + '_type'
        });
        var typeOptions = ['None', 'Discrete', 'Continuous', 'Unique', 'String'];
        $.each(typeOptions, function(val, text) {
            $select.append(
                    $('<option></option>').val(text.toUpperCase()).html(text)
            );
        });
        $select.val(found ? fields[header[i]].field_type.toUpperCase() : 0);
        $('<td>').append($select).appendTo($tr);
        $tbody.append($tr);
        if (found) {
            num++;
        }
    }
    $table.append($tbody);
    $('#fields').append('<h2>' + fileName + '</h2>')
    $('#fields').append($table);
}

function setUpFieldTable(headers, options, fileID, fileName) {
	canUpdate[1] = true;
    for (var i = 0; i < 3; i++) {
        setUpFieldTableSection(headers[fileTypeIDs[i]], options, fileTypeIDs[i], fileTypes[i]);
    }
}

function setUpValueTableSection(options, fileID, fileName) {
    var $table = $('<table>');
    $table.attr('id', 'values_' + fileID);
    var $thead = $('<thead>');
    
    var $tr = $('<tr>');
    $('<th>').append('Field name').appendTo($tr);
    $('<th>').append('Type of field').appendTo($tr);
    $('<th>').append('Include in facility info box').appendTo($tr);
    $('<th>').append('Display type of field').appendTo($tr);
    $('<th>').append('Possible values (comma separated)').appendTo($tr);
    $('<th>').append('Names of values (comma separated, in order)').appendTo($tr);
    $('<th>').append('Value colors (comma separated, in order)').appendTo($tr);
    $thead.append($tr);
    $table.append($thead);
    
    var $tbody = $('<tbody>');
    var fields;
	if (fileID == 'schedule') {
		fields = options == null ? null : options[fileID][0]['field_options'];
	} else {
		fields = options == null ? null : options[fileID]['field_options'];
	}
    if (fields == null) {
        return;
    }
    for (f in fields) {
        
        //var found = fields != null && num < fields.length && fields[num]["id"] == header[i];
        $tr = $('<tr>');
        $('<td>').append('<p>' + f + '</p>').appendTo($tr);
        
        $('<td>').append('<p>' + fields[f]['field_type'] + '</p>').appendTo($tr);
        
        var $checkbox =  $('<input>', {
            type: 'checkbox',
            val: 'show_in_box',
            name: 'show_in_box',
            'class': 'check'
        });
        if (fields[f].in_info_box) {
            $checkbox.attr('checked','checked');
        }
        $('<td>').append($checkbox).appendTo($tr);
        
        var $select = $('<select>', {
            name: 'display_type'
        });
        var typeOptions = ['None', 'Map', 'Filter', 'Size', 'UTMLat', 'UTMLon'];
        $.each(typeOptions, function(val, text) {
            $select.append(
                    $('<option></option>').val(text.toUpperCase()).html(text)
            );
        });
        $select.val('NONE');
        if (fields[f].display_type) {
			$select.val(fields[f].display_type.toUpperCase());
        }
        $('<td>').append($select).appendTo($tr);
        
        var colors = '';
        var ids = '';
        var names = '';
        var j = 0;
        for (v in fields[f].value_options) {
            var vals = fields[f].value_options[v];
            if (vals.color) {
                colors += (j != 0 ? ',' : '') + vals.color;
            }
            if (vals.name) {
                names += (j != 0 ? ',' : '') + vals.name;
            }
			ids += (j != 0 ? ',' : '') + v;
			j++;
        }
        
        
        $('<td>').append( $('<input>', {
            type: 'text',
            val: ids,
            name: f + '_id',
            'class': 'text'
        })).appendTo($tr);
        
        $('<td>').append( $('<input>', {
            type: 'text',
            val: names,
            name: f + '_name',
            'class': 'text'
        })).appendTo($tr);
        
        $('<td>').append( $('<input>', {
            type: 'text',
            val: colors,
            name: f + '_color',
            'class': 'text'
        })).appendTo($tr);
        
        $tbody.append($tr);
        console.log('Appended another row to value tab');
    }
    $table.append($tbody);
    $('#values').append('<h2>' + fileName + '</h2>')
    $('#values').append($table);
}

function setUpValueTable(options, fileID, fileName) {
	canUpdate[2] = true;
    // set up headers
    $('#instructions').html('<p>Select how to display your data. Colors are only applicable for mapping data. Possible ' +
                        'colors are blue, green, orange, red, white, and yellow.</p>');
    for (var i = 0; i < 3; i++) {
        setUpValueTableSection(options, fileTypeIDs[i], fileTypes[i]);
    }
}

function submitUserOptions(useID) {
	var data = {};
	var type;
	var fns = [submitFiles, submitFields, submitValues];
	for (var i = 0; i < canUpdate.length; i++) {
	    if (canUpdate[i]) {
		    data[updateTypes[i]] = fns[i]();
		} else {
			break;
		}
	}
	var cookieID = useID ? getCookie('id') : null;
	makeRequest(makeData(data), useID, cookieID);	
}

function submitFiles() {
	var table = {};
	table[fileTypeIDs[2]] = {};
	$('#files tbody tr').map(function() {
        var $row = $(this);
		var res = {'name': $row.find(':nth-child(2)').find('input').val(),
				   'title': $row.find(':nth-child(3)').find('input').val(),
				   'join_main': $row.find(':nth-child(4)').find('input').val(),
				   'join_secondary': $row.find(':nth-child(5)').find('input').val()
		          };
		if (res != null && res.name != null) {
			if ($row.attr('class') == fileTypeIDs[2]) {
				table[fileTypeIDs[2]][res.name] = res;
			} else {
	  			table[$row.attr('class')] = res;
			}
	    }
		return res;
    });
	return table;
}

function submitFields() {
    var table = undefined;
    for (var i = 0; i < fileTypes.length; i++) {
	    $('#fields_' + fileTypeIDs[i] + ' tbody tr').map(function() {
		    var $row = $(this);
			var res;
			if ($row.find(':nth-child(3)').find('input').is(':checked')) {
                res = {'field' : $row.find(':nth-child(1)').find('p').text(),
                       'name' : $row.find(':nth-child(2)').find('input').val(),
                       'type' : $row.find(':nth-child(4)').find('select').val()
                      };
				if (!table) {
					table = {};
				}
				if (!table[fileTypeIDs[i]]) {
	   				table[fileTypeIDs[i]] = {};
				}
		        table[fileTypeIDs[i]][res.field] = res;
            } else {
                res = null;
		    }
            return res;
	    });
    }
	return table;
}

function submitValues() {
	var table = undefined;
    for (var i = 0; i < fileTypes.length; i++) {
	    $('#values_' + fileTypeIDs[i] + ' tbody tr').map(function() {
            var $row = $(this);
			var res = {'id': $row.find(':nth-child(1)').find('p').text(),
			  	       'display_type': $row.find(':nth-child(4)').find('select').val(),
					   'values': $row.find(':nth-child(5)').find('input').val(),
					   'names': $row.find(':nth-child(6)').find('input').val(),
					   'colors': $row.find(':nth-child(7)').find('input').val(),
					   'in_info_box': $row.find(':nth-child(3)').find('input').is(':checked') ? 'true' : 'false'
			};
			if (!table) {
				table = {};
			}
			if (!table[fileTypeIDs[i]]) {
				table[fileTypeIDs[i]] = {};
			}
			table[fileTypeIDs[i]][res.id] = res;
			return null;
        });
	}
	return table;
}

function addCell(value) {
    $('#fields').append($('<td>')).append(value);
}

function makeData(table) {
    return 'data=' + JSON.stringify(table);
}

function makeRequest(table, update, id) {
    console.log(table);
    $.ajax({
        type: (update ? "PUT" : "POST"),
        url: "/user_options" + (update ? "/" + id : ""),
        data: table,
        success: function(responseText) {
            console.log(responseText);
            $('#your_id').empty();
            $('#your_id').append('<p>Your user ID is ' + responseText + '</p>');
            document.cookie = 'id=' + escape(responseText);
            console.log(getCookie('id'));
            scrollTo(0,0);
        }
    });
}
