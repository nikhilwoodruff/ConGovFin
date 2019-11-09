let data = [];
let svg = null;
let width = null;
let height = null;
let colMode = "cat";
let categories = ["Summary", "Pensions", "Healthcare", "Education", "Defence", "Welfare", "Protection", "Transport", "General Government", "Interest", "Other"];
let colours = {"Pensions": "#5a5a22", "Healthcare": "#5a5a22", "Education": "#22585a", "Defence": "#5a2922", "Welfare": "#22365a", "Protection": "#4a225a", "Transport": "#5a2243", "General Government": "#225a49", "Interest": "#5a5922", "Other": "#64645f"};
let loadData = function(d) {
    if(d.Category !== "Summary") {
        d.x = Math.random() * width;
        d.y = Math.random() * height;
        d.radius = Math.pow(d.FY14 / 10, 0.5) * 10;
        d.colour = colours[d.Category];
        d.set = 0;
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
        .attr("r", 0)
        .attr("fill", function(d) { return d3.rgb(d.colour).brighter().brighter(); })
        .attr("stroke", "#000000")
        .attr("stroke-width", 2)
        .on("mouseover", function(d) {
            nyr = parseInt(Math.floor(document.getElementById("yearSlide").value * 0.99) / 10 + 10);
            nyearString = "FY" + yr.toString();
            if(colMode == "delta") {
                nyr = parseInt(Math.floor(document.getElementById("yearSlide").value * 0.99) / 10 + 10);
                nyearString = "FY" + yr.toString();
                let preYear = "FY" + document.getElementById("prevYear").innerHTML.substring(2, 4);
                let newFig = d[nyearString];
                let oldFig = d[preYear];
                let diff = newFig - oldFig;
                let percentDiff = diff / oldFig * 100;
                let out1 = (Math.round(diff * 10) / 10);
                let out2 = (Math.round(percentDiff * 10) / 10);
                if(out1 >= 0) {
                    out1 = "+\u00A3" + out1.toString();
                    out2 = "+" + out2.toString();
                }
                else {
                    out1 = "-\u00A3" + out1.toString().substring(1, out1.length);
                    out2 = out2.toString();
                }
                return tooltip.style("opacity", "100%").text(d.Name + ": \u00A3" + Math.round(newFig) + " per capita (" + out1 + ", " + out2 + "%)");
            }
            return tooltip.style("opacity", "100%").text(d.Name + ": \u00A3" + (Math.round(d[nyearString])) + " per capita");
        })
        .on("mousemove", function() {
            return tooltip.style("top", (event.pageY - 20) + "px").style("left", (event.pageX + 20) + "px");
        })
        .on("mouseout", function() {
            return tooltip.style("opacity", "0%");
        });
    bubbles = bubbles.merge(bubblesE);
    bubbles.transition().attr("r", function(d) { return d.radius; });
    let ticked = function() {
        bubbles.attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
    }
    let forceSim = d3.forceSimulation().velocityDecay(0.2).on("tick", ticked);
    forceSim.stop();
    bubbles = bubbles.merge(bubblesE);
    forceSim.nodes(data);
    let repelStrength = 0.25;
    let gravityStrength = 0.2;
    let charge = function(d) {
        return -Math.pow(d.radius, 2.0) * repelStrength;
    };
    forceSim.restart();
    let regOrg = function() {
        forceSim.alpha(1).restart();
        forceSim.force("charge", d3.forceManyBody().strength(charge));
        forceSim.force('posX', d3.forceX().strength(gravityStrength).x(width / 2));
        forceSim.force('poxY', d3.forceY().strength(gravityStrength).y(height / 2));
    }
    regOrg();
    let padding = 0.2;
    let catOrg = function() {
        forceSim.alpha(1).restart();
        forceSim.force("charge", d3.forceManyBody().strength(charge));
        forceSim.force("posX", d3.forceX().strength(gravityStrength).x(function(d) {
            return width * (padding + (1 - 2 * padding) * (categories.indexOf(d.Category) / categories.length));
        }));
    }
    let currentYear = null;
    let prevYear = null;
    
    document.getElementById("regularOrg").onclick = regOrg;
    document.getElementById("categoricalOrg").onclick = catOrg;
    yr = parseInt(Math.floor(document.getElementById("yearSlide").value * 0.99) / 10 + 10);
    yearString = "FY" + yr.toString();
    document.getElementById("year").innerHTML = (yr + 2000).toString();
    document.getElementById("yearSlide").oninput = function() {
        yr = parseInt(Math.floor(document.getElementById("yearSlide").value * 0.99) / 10 + 10);
        yearString = "FY" + yr.toString();
        if(currentYear == null) {
            currentYear = yearString;
        }
        data.forEach(function(d) {
            d.radius = Math.pow(d[yearString] / 10, 0.5) * 10;
        })
        document.getElementById("year").innerHTML = (yr + 2000).toString();
        bubbles.transition().attr("r", function(d) { return d.radius; }).duration(1000);
    }
    document.getElementById("yearSlide").onchange = function() {
        if(colMode == "delta") {
            yr = parseInt(Math.floor(document.getElementById("yearSlide").value * 0.99) / 10 + 10);
            yearString = "FY" + yr.toString();
            if(prevYear == null) {
                prevYear = yearString;
            }
            data.forEach(function(d) {
                d.colour = d3.interpolateLab("red", "green")(0.5 * (1 + Math.tanh(5 * (-1 + d[yearString] / d[prevYear]))));
            })
            bubbles.transition().attr("fill", function(d) { return d.colour; }).duration(1000);
            
            document.getElementById("prevYear").innerHTML = "20" + prevYear.substring(2, 4) + " \u2192";
            prevYear = yearString;
        }
    }
    document.getElementById("changeCol").onclick = function() {
        colMode = "delta";
        document.getElementById("yearSlide").onchange();
    }
    document.getElementById("categoricalCol").onclick = function() {
        colMode = "cat";
        data.forEach(function(d) {
            d.colour = d3.rgb(colours[d.Category]).brighter().brighter();
        })
        document.getElementById("prevYear").innerHTML = "";
        bubbles.transition().attr("fill", function(d) { return d.colour; }).duration(1000);
    }
}