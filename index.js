var svg = d3.select("body").append("svg").attr("width", "100%").attr("height", "100%");
var svgGroup = svg.append("g");

d3.queue()
  .defer(d3.json, "departements.geojson")
  .defer(d3.csv, "TCRD_044.csv")
  .defer(d3.csv, "TCRD_075.csv")
  .awaitAll(ready);

function ready(err, results) {
    if (err) {
        throw err;
    }
    results.forEach(function(d){
        console.log(d);
    });
}