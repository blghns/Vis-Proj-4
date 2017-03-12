var svg = d3.select("body").append("svg").attr("width", "100%").attr("height", "100%");
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


queue()
	.defer(d3.json, 'departements.geojson')
	.defer(d3.csv, 'Population.csv') // Population data
	.defer(d3.csv, 'Vehicles.csv') // Vehicle data
	.await(drawMap);


function drawMap(error, departements, population, vehicle) {
	var max = d3.max(population, function(d) { return +d["au 1er janvier 2016"];});
	var min = d3.min(population, function(d) { return +d["au 1er janvier 2016"];});
	var colorScale = d3.scaleLog().domain([min, max]).range(["#036899","#560332"]);
	var colorScale = d3.scaleLog().domain([min, max]).range([ "#036899","#560332"]);
    svgGroup.append("g")
            .attr("class", "departements")
            .selectAll("path")
            .data(departements.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", function(d){
            	var departmentPopulation=findPopulationOfDepartement(d.properties.nom,population);
            	return colorScale(departmentPopulation);
            })
            .on("mouseover", mouseover)
            .on("mousemove", function (d) {
	            var departmentPopulation=findPopulationOfDepartement(d.properties.nom,population);
	            mousemove(d.properties.nom, departmentPopulation);
        	})
            .on("mouseout", mouseout);

    svg.call(d3.zoom()
               .scaleExtent([1 / 2, 500])
               .on("zoom", zoomed));
};

function zoomed() {
    svgGroup.attr("transform", d3.event.transform);
}

function mouseover(){
	tooltip.transition()
        .duration(300)
        .style("opacity", 1);
}

function mousemove(departement_name, population){
	tooltip.select('.departement_name').html('<b>' + departement_name);
	tooltip.select('.population').html('Population: '+population.toLocaleString());
	tooltip.style("left", (d3.event.pageX) + 10 + "px")
        .style("top", (d3.event.pageY) + 10 + "px");
}

function mouseout() {
    tooltip.transition()
        .duration(300)
        .style("opacity", 1e-6);
}

function findPopulationOfDepartement(departement, population){
	return +population.find(function(p){
		return p["Départementales"]===departement;
	})["au 1er janvier 2016"];
}
