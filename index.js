var svg = d3.select("body").append("svg").attr("width", "100%").attr("height", "100%");
var svgGroup = svg.append("g");
var width = parseInt(svg.style('width'));
var height = parseInt(svg.style('height'));
var projection = d3.geoMercator().scale(1).center([-74,4.5]).translate(width/2, height/2);
var path = d3.geoPath();

d3.json("departements.geojson", function (error, departements){
	svgGroup.append("g")
      .attr("class", "departements")
    .selectAll("path")
    .data(departements.features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", "borders");	      

  svg.call(d3.zoom()
        .scaleExtent([1/2, 500])
        .on("zoom", zoomed));
});

function zoomed() {
    svgGroup.attr("transform", d3.event.transform);
}
