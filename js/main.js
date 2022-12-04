let barChart, bar2, mentalHealthMap, displayData,
unsMap, mentalHealthBarChart, proteinLinePlot;

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
    mentalHealthMap = new MentalHealthMap('mental-health-div', dataArray[0]);
    mentalHealthBarChart = new MentalHealthBarChart('mentalHealthBarChart');
    proteinLinePlot = new ProteinLinePlot('proteinSupplyScatterLinePlot')
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
        d3.select(".United.States.of.America").attr("opacity", 0.5);
        // un highlight
        d3.select("#us-button").text("Highlight the United States");
    } else {
        d3.select(".United.States.of.America")
            .style("stroke", "red")
            .attr("opacity", 1)
            .attr("stroke-width", 10);

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


function mentalHealthMapCategoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    mentalHealthMap.wrangleData();
    mentalHealthBarChart.wrangleData();
}

function mentalHealthMapTimeChange() {
    selectedTime = document.getElementById('mentalHealthMapSlider').value;
    document.getElementById('mentalHealthMapYearId').innerText = selectedTime;
    mentalHealthMap.wrangleData();
    mentalHealthBarChart.wrangleData();
}



// on slider change, update the bar chart
function opacSliderChange(value) {
    d3.selectAll("#state-fill").attr("opacity", value / 100);
}


// on button click, slowly move the slider value from 100 to 0
function opacSliderAnimate() {
    // call opacSliderChange with from 100 to 0 in 10 seconds
    d3.transition()
        .duration(3000)
        .tween("slider", function() {
            var i = d3.interpolate(100, 0);
            return function(t) {
                // set the slider value to the interpolated value
                d3.select(".myRange2").property("value", i(t).toFixed(0));
                opacSliderChange(i(t));
            };
        })
        .on("end", function() {
            // set the slider value to 100
            d3.select(".myRange2").property("value", 100);
            opacSliderChange(100);
        });

}

function finalVis() {
    // make an svg in the final-vis div
    let svg = d3.selectAll(".final-vis")
        .append("svg")
        .attr("width", 600)
        .attr("height", 600);

    // color the circle red
    svg
        .append("circle")
        .attr("class", "big-circle")
        .attr("cx", 250)
        .attr("cy", 250)
        .attr("r", 200)
        .attr("fill", "red");

    // make another circle in the middle
    svg
        .append("circle")
        .attr("class", "little-circle")
        .attr("opacity", 0)
        .attr("cx", 250)
        .attr("cy", 250)
        .attr("r", 133)
        .attr("fill", "salmon");

    // make a button
    d3.select(".card-fin")
        .append("button")
        .attr("id", "final-button")
        .text("Click to see the final visualization")
        .on("click", function() {

            // reset if the button is clicked again
            if (d3.select(".big-circle").attr("fill") == "rgb(250, 128, 114)") {
                // remove text
                d3.select(".final-vis").selectAll("text").remove();
                // revert
                d3.select(".little-circle").attr("opacity", 0);

                d3.select(".big-circle")
                    .transition()
                    .duration(1000)
                    .attr("cx", 250)
                    .attr("cy", 250)
                    .attr("r", 200)
                    .attr("fill", "red");

                // change button text
                d3.select("#final-button").text("Click to see the final visualization");

            }
            else {
                //change button text
                d3.select("#final-button").text("Revert");
                // transition the big circle to be smaller
                d3.select(".big-circle")
                    .transition()
                    .duration(1000)
                    .attr("fill", "salmon")
                    .attr("r", 100)
                    .attr("cx", 150)
                    .attr("cy", 150);

                // make a different circle appear next to the big circle
                d3.select(".little-circle")
                    .transition()
                    .duration(1000)
                    .attr("opacity", 1)
                    .attr("r", 149)
                    .attr("fill", "red")
                    .attr("cx", 350)
                    .attr("cy", 350);

                // add text to circles
                svg
                    .append("text")
                    .transition()
                    .duration(1000)
                    .attr("class", "big-text")
                    .attr("x", 150)
                    .attr("y", 150)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "10px")
                    .attr("fill", "white")
                    .text("Risk of Death without Fast Food");

                svg
                    .append("text")
                    .transition()
                    .duration(1000)
                    .attr("class", "little-text")
                    .attr("x", 350)
                    .attr("y", 350)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "20px")
                    .attr("fill", "white")
                    .text("Risk of Death with Fast Food");
            }


        });





}

finalVis();
