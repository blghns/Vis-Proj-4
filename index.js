var svg = d3.select("body").append("svg").attr("width", "100%").attr("height", "100%");
var svgGroup = svg.append("g");
var width = parseInt(svg.style('width'));
var height = parseInt(svg.style('height'));
var projection = d3.geoMercator().scale(3400).center([2.5, 46.5]).translate([width / 2, height / 2]);
var path = d3.geoPath().projection(projection);

queue()
	.defer(d3.json, 'departements.geojson')
	.defer(d3.csv, 'Population.csv') // Population data
	.defer(d3.csv, 'Vehicles.csv') // Vehicle data
	.await(drawMap);

function drawMap(error, departements, population, vehicle) {
	debugger;
    svgGroup.append("g")
            .attr("class", "departements")
            .selectAll("path")
            .data(departements.features)
            .enter().append("path")
            .attr("d", path);

    svg.call(d3.zoom()
               .scaleExtent([1 / 2, 500])
               .on("zoom", zoomed));
};

function zoomed() {
    svgGroup.attr("transform", d3.event.transform);
}
