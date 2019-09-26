var day;

var map;
var markers = [];
var markersLayer = new L.LayerGroup();
var searchTerms = [];
var enabledTypes = [
    'american-flowers', 'antique-bottles', 'arrowhead', 'bird-eggs', 'coin', 'family-heirlooms', 'lost-bracelet',
    'lost-earrings', 'lost-necklaces', 'lost-ring', 'card-cups', 'card-pentacles', 'card-swords', 'card-wands'
];
var marathonData = [];
var polylines;
var menuOpened = false;

function init()
{
    initMenu();

    var minZoom = 2;
    var maxZoom = 7;

    // create the map
    map = L.map('map', {
        minZoom: minZoom,
        maxZoom: maxZoom,
        zoomControl: false,
        crs: L.CRS.Simple,
    }).setView([-70, 111.75], 3);

    L.control.zoom({
        position:'bottomright'
    }).addTo(map);

    L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', {
        noWrap: true
    }).addTo(map);

    map.on('click', function(e){
        var coord = e.latlng;
        var lat = coord.lat;
        var lng = coord.lng;
        //dev.push([lat, lng]);
        //L.polyline(dev).addTo(map);
        //console.log(`{"day": "${day}","icon": "american-flowers","name": "","desc": "","x": "${lat}","y": "${lng}"},`);
    });

    setCurrentDayCycle();
    loadMarkers();
    loadRoutesData();

}

function initMenu()
{
    $.each(enabledTypes, function(key, value)
    {
        $("div").find(`[data-type='${value}']`).children('span').removeClass('disabled');
    });
}

function setCurrentDayCycle()
{
    //day1: 2 4 5
    //day2: 0 3
    //day3: 1 6
    var weekDay = new Date().getUTCDay();
    switch(weekDay)
    {
        case 2: //tuesday
        case 4: //thursday
        case 5: //saturday
            day = 1;
            break;

        case 0: //sunday
        case 3: //wednesday
            day = 2;
            break;

        case 1: //monday
        case 6: //friday
            day = 3;
            break;
    }

    $('#day').val(day);
}

function loadRoutesData()
{
    marathonData = [];
    $.getJSON("routes.json", {}, function(data)
    {
        marathonData = data;
        //drawLines();
    });
}

function drawLines()
{
    var connections = [];
    $.each(marathonData, function (key, value)
    {
        if(value.day == day)
        {
            connections.push(value.data);
        }
    });

    if (polylines instanceof L.Polyline)
    {
        map.removeLayer(polylines);
    }

    polylines = L.polyline(connections, {'color': '#9a3033'});
    map.addLayer(polylines);

}


function loadMarkers()
{
    markers = [];
    $.getJSON("items.json", {}, function(data)
    {
        markers = data;

        addMarkers();
    });

}

function addMarkers()
{
    markersLayer.clearLayers();


    $.each(markers, function (key, value)
    {
        if(enabledTypes.includes(value.icon))
        {
            if (value.day == day) {
                if (searchTerms.length > 0) {
                    $.each(searchTerms, function (id, term) {
                        if (value.name.toLowerCase().indexOf(term.toLowerCase()) !== -1) {
                            markersLayer.addLayer(L.marker([value.x, value.y], {icon: L.AwesomeMarkers.icon({iconUrl: 'icon/' + value.icon + '.png', markerColor: 'day_' + value.day})}).bindPopup('<h1>' + value.name + " - Day " + value.day + '</h1><p>' + value.desc + '</p>'));
                        }
                    });
                }
                else {
                    markersLayer.addLayer(L.marker([value.x, value.y], {icon: L.AwesomeMarkers.icon({iconUrl: 'icon/' + value.icon + '.png', markerColor: 'day_' + value.day})}).bindPopup(`<h1> ${value.name} - Day ${value.day} (${key}) </h1><p> ${value.desc} </p>`).on('click', onClick));
                }
            }
        }
    });
    markersLayer.addTo(map);
}

//tests
var dev = [];
function onClick()
{
    dev.push([this._latlng.lat, this._latlng.lng]);
    L.polyline(dev, {'color': '#9a3033'}).addTo(map);
}

$("#day").on("input", function()
{
    day = $('#day').val();
    addMarkers();

    if($("#routes").val() == 1)
        drawLines();
});

$("#search").on("input", function()
{
    searchTerms = [];
    $.each($('#search').val().split(';'), function(key, value)
    {
        if($.inArray(value, searchTerms) == -1)
        {
            if(value.length > 0)
                searchTerms.push(value);
        }
    });
    addMarkers();
});

$("#routes").on("change", function()
{
    if($("#routes").val() == 0) {
        if (polylines instanceof L.Polyline) {
            map.removeLayer(polylines);
        }
    }
    else {
        drawLines();
    }
});
$('.menu-option.clickable').on('click', function ()
{
    var menu = $(this);
    menu.children('span').toggleClass('disabled');

    if(menu.children('span').hasClass('disabled'))
    {
        enabledTypes = $.grep(enabledTypes, function(value) {
            return value != menu.data('type');
        });
    }
    else {
        enabledTypes.push(menu.data('type'));
    }
    addMarkers();
});

$('.menu-toggle').on('click', function()
{
    $(this).toggleClass('menu-opened');

    if($(this).hasClass('menu-opened'))
    {
        $('.menu-toggle').text('X');
        $('.side-menu').css('left', '0px');
    }
    else {
        $('.menu-toggle').text('>');
        $('.side-menu').css('left', '-300px');
    }
});