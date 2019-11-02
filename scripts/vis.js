let data = [];
let svg = null;
let loadData = function(d) {
    d.x = Math.random() * 1000;
    d.y = Math.random() * 1000;
    d.radius = Math.pow(d.2010, 0.5);
    data.push(d);
    if(d.Year == "TotalSpending") {
        main();
    }
}
let getSizing = function() {
    svg = d3.select("#graph").append("svg").attr("viewBox", "0 0 1000 1000");
}
window.onload = getSizing;
d3.csv("https://raw.githubusercontent.com/nwoodruff149/ConGovFin/master/data/gov-spending.csv", loadData);
let main = function() {
    
    let bubbles = svg.selectAll(".bubble").data(data, function(d) {
        return d.Year;
    });
    let bubblesE = bubbles.enter().append("circle")
        .classed("bubble", true)
        .attr("r", function(d) { return d.radius; })
        .attr("fill", "#FFFFFF")
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 2);
    bubbles = bubbles.merge(bubblesE);
    let ticked = function() {
        console.log(data[0].x);
        bubbles.attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    let forceSim = d3.forceSimulation().velocityDecay(0.2).on("tick", ticked);
    forceSim.stop();
    bubbles = bubbles.merge(bubblesE);
    forceSim.nodes(data);
    let charge = function(d) {
        return -Math.pow(d.radius, 2.0);
    };
    forceSim.restart();
    forceSim.force("charge", d3.forceManyBody().strength(charge));
    
}