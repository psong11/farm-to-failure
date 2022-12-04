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
        .attr("cx", 300)
        .attr("cy", 300)
        .attr("r", 200)
        .attr("fill", "red");

    svg.append("circle")
        .attr("class", "little-circle")
        .attr("id", "curve")
        .attr("cx", 300)
        .attr("cy", 300)
        .attr("r", 200)
        .attr("fill", "red")
        .attr("opacity", 0);

    // arc from (0, 300) to (600, 300)
    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(235)
        .startAngle(-180 * Math.PI / 180)
        .endAngle(Math.PI);

    // append the arc to the svg
    svg.append("path")
        .attr("d", arc)
        .attr("id", "myArc")
        .attr("transform", "translate(300, 300)")
        .attr("fill", "none");


    // add text to the circle
    let bigtext = svg
        .append("text")
        .attr("class", "big-text")
        .attr("x", 300)
        .attr("y", 300)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "20px")
        .attr("fill", "white")
        .text("With Fast Food (current): 77.3 years");

    // add title to the top
    svg
        .append("text")
        .attr("class", "title")
        .attr("x", 300)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text("Life Expectancy in the United States");



    // make a button
    d3.select(".card-fin")
        .append("button")
        .attr("id", "final-button")
        .text("View the impact of a healthy diet")
        .on("click", function() {

            // reset if the button is clicked again
            if (d3.select(".big-circle").attr("fill") == "rgb(250, 128, 114)") {
                // remove text
                d3.select(".big-text").selectAll("textPath").transition().duration(200).remove();
                // revert
                d3.select(".little-circle").attr("opacity", 0);

                d3.select(".big-circle")
                    .transition()
                    .duration(2000)
                    .attr("cx", 300)
                    .attr("cy", 300)
                    .attr("r", 200)
                    .attr("fill", "red");

                // change button text
                d3.select("#final-button").text("View the impact of a healthy diet");

            }
            else {
                //change button text
                d3.select("#final-button").text("Revert back to original");
                // make circle bigger
                d3.select(".big-circle")
                    .transition()
                    .duration(1000)
                    .attr("cx", 300)
                    .attr("cy", 300)
                    .attr("r", 270)
                    .attr('fill', 'salmon');

                // make text that curves around the circle
                d3.select(".big-text")
                    .append("textPath")
                    .transition()
                    .duration(1000)
                    .attr("xlink:href", "#myArc")
                    .attr("startOffset", "50%")
                    .text("With a Healthy Diet (ideal): 84.5 years");



                // after 2 second, make the little circle appear
                setTimeout(function() {
                    d3.select(".little-circle").attr("opacity", 1);
                });

            }


        });





}

finalVis();
