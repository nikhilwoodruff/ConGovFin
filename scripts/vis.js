let data = [];
let svg = null;
let width = null;
let height = null;
let excludedFields = ["GDP", "Population", "TotalSpending"];
let loadData = function(d) {
    if(!excludedFields.includes(d.Name)) {
        d.x = Math.random() * width;
        d.y = Math.random() * height;
        d.radius = Math.pow(d.FY10, 0.5) * 10;
        data.push(d);
    }
    if(d.Name == "TotalSpending") {
        main();
    }
}
let getSizing = function() {
    let aspectRatio = parseInt(window.innerWidth) / parseInt(window.innerHeight);
    width = aspectRatio * 0.85 * 1000;
    height = 1000;  
    svg = d3.select("#graph").append("svg").attr("viewBox", "0 0 " + width + " 1000");
}
window.onload = getSizing;
d3.csv("https://raw.githubusercontent.com/nwoodruff149/ConGovFin/master/data/gov-spending.csv", loadData);
let main = function() {
    let tooltip = d3.select("body").append("div").attr("class", "tooltip-bubble");
    let bubbles = svg.selectAll(".bubble").data(data, function(d) {
        return d.Name;
    });
    let bubblesE = bubbles.enter().append("circle")
        .classed("tipsy", true)
        .classed("bubble", true)
        .attr("r", function(d) { return d.radius; })
        .attr("fill", "#FFFFFF")
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 2)
        .on("mouseover", function(d) {
            console.log("over")
            return tooltip.style("opacity", "100%").text(d.Name);
            
        })
        .on("mousemove", function() {
            return tooltip.style("top", (event.pageY - 20) + "px").style("left", (event.pageX + 20) + "px");
        })
        .on("mouseout", function() {
            console.log("out")
            return tooltip.style("opacity", "0%");
        });
    bubbles = bubbles.merge(bubblesE);
    let ticked = function() {
        bubbles.attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    let forceSim = d3.forceSimulation().velocityDecay(0.2).on("tick", ticked);
    forceSim.stop();
    bubbles = bubbles.merge(bubblesE);
    forceSim.nodes(data);
    let repelStrength = 0.04;
    let gravityStrength = 0.02;
    let charge = function(d) {
        return -Math.pow(d.radius, 2.0) * repelStrength;
    };
    forceSim.restart();
    forceSim.force("charge", d3.forceManyBody().strength(charge));
    forceSim.force('centerX', d3.forceX().strength(gravityStrength).x(width / 2));
    forceSim.force('centerY', d3.forceY().strength(gravityStrength).y(height / 2));
}