let barChart, bar2, displayData;

var slider = document.getElementById("myRange");

function initMainPage() {
    barChart = new BarChart();
    bar2 = new BarChart2();
}

initMainPage();

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
