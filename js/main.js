let barChart, bar2, mentalHealthMap, displayData,
unsMap;

let selectedTime = 1990;
let selectedState = '';

let selectedCategory =  document.getElementById('categorySelector').value;

var slider = document.getElementById("myRange");

// load data using promises
let promises = [
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

function initMainPage(dataArray) {
    barChart = new BarChart();
    bar2 = new BarChart2();
    mentalHealthMap = new MentalHealthMap('mental-health-div', dataArray[0]);
    unsMap = new usMap();
}

// on slider change, update the bar chart
slider.oninput = function() {
    barChart.updateBarChart(this.value);
    // change html to display the year
    document.getElementById("yearId").innerHTML = this.value;
}

// hide .fp-watermark div
d3.select(".fp-watermark").style("display", "none");


// select US button behavior
function selectUS () {
    // if the stroke is red, then change it
    if (d3.select(".United.States.of.America").style("stroke") == "red") {
        d3.select(".United.States.of.America").style("stroke", "white").attr("stroke-width", 2);
        // un highlight
        d3.select("#us-button").text("Highlight the United States");
    } else {
        d3.select(".United.States.of.America")
            .style("stroke", "red")
            .attr("stroke-width", 7);

        d3.select("#us-button").text("De-highlight the United States");

        d3.select("#country-name")
            .text("United States of America");
    }
}

// select #us-map and make a 500x500 svg
d3.selectAll("#us-map")
    .append("svg")
    .attr("width", 500)
    .attr("height", 500);

// color it white
usMap.append("rect")
    .attr("width", 500)
    .attr("height", 500)
    .attr("fill", "white");


function mentalHealthMapCategoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    mentalHealthMap.wrangleData();
}

function mentalHealthMapTimeChange() {
    selectedTime = document.getElementById('mentalHealthMapSlider').value;
    document.getElementById('mentalHealthMapYearId').innerText = selectedTime;
    mentalHealthMap.wrangleData();
}
