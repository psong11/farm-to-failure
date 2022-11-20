let barChart,
displayData;

var slider = document.getElementById("myRange");

function initMainPage() {
    barChart = new BarChart();
<<<<<<< Updated upstream
=======
    mentalHealthMap = new MentalHealthMap('mental-health-div', dataArray[0]);
    unsMap = new usMap();
>>>>>>> Stashed changes
}

initMainPage();

// on slider change, update the bar chart
slider.oninput = function() {
    barChart.updateBarChart(this.value);
    // change html to display the year
    document.getElementById("yearId").innerHTML = this.value;

<<<<<<< Updated upstream
=======
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

        d3.select("#country-obesity")
            .text("Obesity Level in 2016: " + "36.2%");

        d3.select("#country-initial")
            .text("Obesity Level in 1975: " + "11.9%");

        d3.select("#country-change")
            .text("Change in Obesity Level: " + "24.3%");

        d3.select("#country-percent")
            .text("Percent Change in Obesity Level: " + "204.2%");
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
>>>>>>> Stashed changes
}

