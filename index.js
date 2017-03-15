var svg = d3.select("body").append("svg").attr("class", "mapSvg").attr("width", "100%").attr("height", "100%");
var textInfo = d3.select("body").append("div").attr("width", "100%").attr("height", "100%");
var svgGroup = svg.append("g");
var width = parseInt(svg.style('width'));
var height = parseInt(svg.style('height'));
var projection = d3.geoMercator().scale(3400).center([2.5, 46.5]).translate([width / 2, height / 2]);
var path = d3.geoPath().projection(projection);

var tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 1e-6);

tooltip.append('div')
       .attr('class', 'departement_name');
tooltip.append('div')
       .attr('class', 'population');

// Véhicules particuliers Nombre - Special Vehicles
// Véhicules utilitaires légers Nombre - Light commercial vehicles
// Véhicules industriels à moteur et de transports en commun Nombre - Industrial motor vehicles and public transport
// Ensemble des véhicules Nombre - All vehicles

var vehicleTypes = ["Véhicules particuliers Nombre",
                    "Véhicules utilitaires légers Nombre",
                    "Véhicules industriels à moteur et de transports en commun Nombre",
                    "Ensemble des véhicules Nombre"];
var selectedVehicleType = vehicleTypes[3];

d3.queue()
  .defer(d3.json, 'departements.geojson')
  .defer(d3.csv, 'Population.csv') // Population data
  .defer(d3.csv, 'Vehicles.csv') // Vehicle data
  .await(drawMap);

function drawMap(error, departements, population, vehicle) {
    var max = d3.max(population, function (d) {
        return +d["au 1er janvier 2016"];
    });
    var min = d3.min(population, function (d) {
        return +d["au 1er janvier 2016"];
    });
    var colorScale = d3.scaleLog().domain([min, max]).range(["#036899", "#560332"]);

    svgGroup.append("g")
            .attr("class", "departements")
            .selectAll("path")
            .data(departements.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", function (d) {
                var departmentPopulation = findPopulationOfDepartement(d.properties.nom, population);
                return colorScale(departmentPopulation);
            })
            .on("mouseover", mouseover)
            .on("mousemove", function (d) {
                var departmentPopulation = findPopulationOfDepartement(d.properties.nom, population);
                mousemove(d.properties.nom, departmentPopulation);
            })
            .on("mouseout", mouseout);

    var vehicleMin = d3.min(vehicle, function (d) {
        return +d[selectedVehicleType];
    });
    var vehicleMax = d3.max(vehicle, function (d) {
        return +d[selectedVehicleType];
    });
    var vehicleScale = d3.scaleLinear().domain([vehicleMin, vehicleMax]).range([1, 10]);

    svgGroup.append("g")
            .attr("class", "vehicles")
            .selectAll("circle")
            .data(departements.features)
            .enter().append("circle")
            .attr("cx", function (d) {
                return path.centroid(d)[0];
            })
            .attr("cy", function (d) {
                return path.centroid(d)[1];
            })
            .attr("r", function (d) {
                var found = vehicle.find(function (v) {
                    return v["Départements"] === d.properties.nom;
                });
                return vehicleScale(found[selectedVehicleType]);
            })
            .attr("fill", "none")
            .attr("stroke-width", "0.5px")
            .attr("stroke", "white");

    svg.call(d3.zoom()
               .scaleExtent([1 / 2, 500])
               .on("zoom", zoomed));

    writeInformation(colorScale);
}

function zoomed() {
    svgGroup.attr("transform", d3.event.transform);
}

function mouseover() {
    tooltip.transition()
           .duration(300)
           .style("opacity", 1);
}

function mousemove(departement_name, population) {
    tooltip.select('.departement_name').html('<b>' + departement_name);
    tooltip.select('.population').html('Population: ' + population.toLocaleString());
    tooltip.style("left", (d3.event.pageX) + 10 + "px")
           .style("top", (d3.event.pageY) + 10 + "px");
}

function mouseout() {
    tooltip.transition()
           .duration(300)
           .style("opacity", 1e-6);
}

function findPopulationOfDepartement(departement, population) {
    return +population.find(function (p) {
        return p["Départementales"] === departement;
    })["au 1er janvier 2016"];
}

function writeInformation(colorScale) {
    textInfo.append("text").attr("class", "title").text("France Population");
    textInfo.append("text").attr("class", "subtitle").text("2016 Estimate by Départements")
    textInfo.append("text").attr("class", "info")
            .text("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum");

    var legend = textInfo.append("svg").attr("class", "legend");

    var legendData = [75000, 100000, 250000, 500000, 750000, 1000000, 1500000, 2000000, 2500000];

    legend.selectAll("rect")
          .data(legendData)
          .enter()
          .append("rect")
          .attr("x", 10)
          .attr("y", function (d, i) {
              return i * 25;
          })
          .attr("width", 25)
          .attr("height", 25)
          .attr("fill", colorScale);

    legend.selectAll("text")
          .data(legendData)
          .enter()
          .append("text")
          .attr("font-size", 12)
          .attr("font-family", "Courier")
          .attr("text-anchor", "start")
          .attr("x", 45)
          .attr("y", function (d, i) {
              return i * 25 + 5 + 12;
          })
          .text(function (d) {
              return d3.format(",d")(d);
          })
          .attr("stroke-width", 1)
          .attr("stroke", colorScale);
}