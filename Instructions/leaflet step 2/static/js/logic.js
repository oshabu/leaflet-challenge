// Store API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {

    // Once response received, send the data.features object to the createFeatures function
    console.log(data.features);
    createFeatures(data.features);
});

// Create legend control
var legend = L.control({
    position: 'bottomright'
});

// Add the details for the legend
legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 2, 3, 4, 5],
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

    //Create a loop to go through the density intervals and generate labels
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    console.log('div' + div);
    return div;
};

// Create function to set color based on earthquake magnitudes
function getColor(magnitude) {
    return magnitude > 5 ? "red" :
        magnitude > 4 ? "orange" :
        magnitude > 3 ? "gold" :
        magnitude > 2 ? "yellow" :
        magnitude > 1 ? "yellowgreen" :
        "greenyellow"; // <= 1 default
}

// Create function to create circular features
function createFeatures(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                    radius: feature.properties.mag * 5,
                    fillColor: getColor(feature.properties.mag),
                    color: "#000000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.9
                })
                .bindPopup("<h3>" + "Location: " + feature.properties.place +
                    "</h3><hr><p>" + "Date/Time: " + new Date(feature.properties.time) + "<br>" +
                    "Magnitude: " + feature.properties.mag + "</p>");
        }
    });
    // Sending earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
            attribution:
                "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
            tileSize: 512,
            maxZoom: 18,
            zoomOffset: -1,
            id: "mapbox/light-v11",
            accessToken: API_KEY
        })

        var darkmap = L.tileLayer(
            "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
            {
                attribution:
                    "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
                tileSize: 512,
                maxZoom: 18,
                zoomOffset: -1,
                id: "mapbox/dark-v11",
                accessToken: API_KEY
            })

    // Define a baseMaps object to hold base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create the map
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });
    console.log(myMap);

    //   Create a layer control
    //   Pass in baseMaps and overlayMaps
    //   Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add the info legend to the map
    legend.addTo(myMap);
}

