let barChart,
displayData;


class BarChart {

    constructor() {
        this.data = null;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.wrangleData(2000);
    }

    wrangleData(year) {
        // Loading data, and casting to integer
        d3.csv("data/obesity-cleaned.csv", d => {
            // split d.Obesity on space and take the first element
            d.Obesity = +d.Obesity.split(" ")[0];
            d.Year = +d.Year;

            // only return data for d.Country = "United States"
            return d.Sex === "Both sexes" ? d : null;

        }).then(data => {
            console.log(data);

            // convert the data into an array of dictionaries by year with country name and obesity
            displayData = [];
            let years = new Set(data.map(d => d.Year));
            years.forEach(year => {
                let yearData = {};
                yearData["Year"] = year;
                data.forEach(d => {
                    if (d.Year === year) {
                        yearData[d.Country] = d.Obesity;
                    }
                });
                displayData.push(yearData);
            });
            console.log(displayData);
            this.data = displayData;

            this.createBarChart(displayData, year);

        });
    }

    createBarChart(data, year) {

        this.year = year;

        // set this.year to the year passed in casted to an integer
        this.year = +this.year;

        // set display data to the data for the first year
        let useData = data.filter(d => d.Year === this.year)[0];

        // remove the year from the display data
        delete useData.Year;

        // filter to only have the top ten
        let topTen = Object.keys(useData).sort((a, b) => useData[b] - useData[a]).slice(0, 10);

        // append the values
        let topTenValues = topTen.map(d => useData[d]);
        console.log(topTenValues);

        // build dictionary of country and values
        let topTenData = {};
        topTen.forEach((d, i) => {
            topTenData[d] = topTenValues[i];
        });

        useData = topTenData;

        // make svg object
        let svg = d3.select("#happy-meal-graph")
            .append("svg")
            .attr("width", 600)
            .attr("height", 700);

        // make x axis by country
        let x = d3.scaleBand()
            .domain(Object.keys(useData))
            .range([0, 500])
            .padding(0.1);

        // max value in array
        let max = d3.max(Object.values(useData));

        // make y axis by obesity
        let y = d3.scaleLinear()
            .domain([0, max])
            .range([600, 200]);

        // make x axis with maximum of 30 ticks
        let xAxis = d3.axisBottom(x);

        // make y axis
        let yAxis = d3.axisLeft(y);

        // make x axis
        svg.append("g")
            .attr('class', 'x-axis')
            .attr("transform", "translate(50, 550)")
            .call(xAxis);

        // rotate x axis labels
        svg.selectAll(".x-axis text")
            .attr("transform", "translate(-10, 2) rotate(-45" +
                ")")
            .attr("size", 10)
            .style("text-anchor", "end");


        // make y axis
        svg.append("g")
            .attr('class', 'y-axis')
            .attr("transform", "translate(50, -50)")
            .call(yAxis);


        // draw bars by country value
        svg.selectAll("rect")
            .data(Object.keys(useData).filter(d => d !== "Year"))
            .enter()
            .append("rect")
            .attr("x", d => x(d) + 50)
            .attr("y", d => y(useData[d]) - 50)
            .attr("width", x.bandwidth())
            .attr("height", d => 600 - y(useData[d]))
            .attr("fill", "steelblue");

        // add title
        svg.append("text")
            .attr('class', 'title')
            .attr("x", 50)
            .attr("y", 100)
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Top Ten Countries by Obesity Rate in " + this.year);

    }


    updateBarChart(year) {

            // update the
            this.year = +year;

            // set display data to the data for the first year
            let updateData = this.data.filter(d => d.Year === this.year)[0];
            console.log(updateData);

            // update bar chart with new data
            let svg = d3.select("#happy-meal-graph").select("svg");

            // remove the year from the display data
            let newData = Object.assign({}, updateData);
            delete newData.Year;
            console.log(newData);

            // filter to only have the top ten
            let topTen = Object.keys(newData).sort((a, b) => newData[b] - newData[a]).slice(0, 10);
            console.log(topTen);

            // append the values
            let topTenValues = topTen.map(d => newData[d]);
            console.log(topTenValues);

            // build dictionary of country and values
            let topTenData = {};

            topTen.forEach((d, i) => {
                topTenData[d] = topTenValues[i];
            });

            newData = topTenData;

            console.log(newData);

            // make x axis by country
            let x = d3.scaleBand()
                .domain(Object.keys(newData))
                .range([0, 500])
                .padding(0.1);

            // max value in array
            let max = d3.max(Object.values(newData));

            // make y axis by obesity
            let y = d3.scaleLinear()
                .domain([0, max])
                .range([600, 200]);

            // make x axis with transistion
            let xAxis = d3.axisBottom(x);
            svg.select(".x-axis")
                .transition()
                .duration(1000)
                .call(xAxis);

        svg.selectAll(".x-axis text")
            .attr("transform", "translate(-10, 2) rotate(-45" +
                ")")
            .attr("size", 10)
            .style("text-anchor", "end");

            // make y axis with transistion
            let yAxis = d3.axisLeft(y);
            svg.select(".y-axis")
                .transition()
                .duration(1000)
                .call(yAxis);

            // make bars with transistion
            svg.selectAll("rect")
                .data(Object.keys(newData).filter(d => d !== "Year"))
                .transition()
                .duration(1000)
                .attr("x", d => x(d) + 50)
                .attr("y", d => y(newData[d]) - 50)
                .attr("width", x.bandwidth())
                .attr("height", d => 600 - y(newData[d]))
                .attr("fill", "steelblue");

            // update title
            svg.select(".title")
                .text("Top Ten Countries by Obesity Rate in " + this.year);
    }

}

var slider = document.getElementById("myRange");

function initMainPage() {
    barChart = new BarChart();
}

initMainPage();

// on slider change, update the bar chart
slider.oninput = function() {
    barChart.updateBarChart(this.value);
    // change html to display the year
    document.getElementById("yearId").innerHTML = this.value;

}

