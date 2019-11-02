let data = [];
let loadData = function(d) {
    data.push(d);
    if(d.Year == "2019") {
        main();
    }
}
d3.csv("https://raw.githubusercontent.com/nwoodruff149/ConGovFin/master/data/fin_data.csv", loadData);
let main = function() {
    console.log(data[3]);
}
let getSizing = function() {
    let svg = d3.select("#graph").append("svg").attr("viewBox", "0 0 10000 10000");
}
window.onload = getSizing;