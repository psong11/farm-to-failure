class BarChart2 {

    constructor() {
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.wrangleData();
    }

    wrangleData() {
        // Load fried food consumption data
        d3.csv("data/Fried-food-consumption.csv", d => {
            d.factors = +d.Factors;
            d.None = +d["None (n=15 166)"];
            d.con1 = +d["<1 serving/week (n=38 482)"];
            d.con2 = +d["1-2 servings/week (n=33 210)"];
            d.con3 = +d["3-6 servings/week (n=15 480)"];
            d.con4 = +d["≥1 serving/day"];


        }).then(data => {
            console.log(data);

            // convert the data into an array of dictionaries by factor (socio-economic group, race, education, etc.)
            displayData = [];
            let factor = new Set(data.map(d => d.factors));
            factor.forEach(factor => {
                let factorData = {};
                factorData["Factor"] = factor;
                data.forEach(d => {
                    if (d.Factor === factor) {
                        factorData[d.None] = d.None;
                        factorData[d.con1] = d.con1;
                        factorData[d.con2] = d.con2;
                        factorData[d.con3] = d.con3;
                        factorData[d.con4] = d.con4;
                    }
                });
                displayData.push(factorData);
            });
            console.log(displayData);

            this.createBarChart(displayData, factor);

        });
    }

    createBarChart(data, factor) {

        this.factor = factor;

        this.factor = this.factor;

        // set display data to the data for the first year
        let displayData = data.filter(d => d.Factor === this.factor)[0];
        console.log('here');
        console.log(displayData);

        // filter to only have the top ten
        let topTen = Object.keys(displayData).sort((a, b) => displayData[b] - displayData[a]).slice(0, 10);

        // append the values
        let topTenValues = topTen.map(d => displayData[d]);
        console.log(topTenValues);

        // build dictionary of country and values
        let topTenData = {};
        topTen.forEach((d, i) => {
            topTenData[d] = topTenValues[i];
        });

        displayData = topTenData;

        // make svg object
        let svg = d3.select("#fried-food-consumption")
            .append("svg")
            .attr("width", 600)
            .attr("height", 700);

        // make x axis by country
        let x = d3.scaleBand()
            .domain(Object.keys(displayData))
            .range([0, 500])
            .padding(0.1);

        // max value in array
        let max = d3.max(Object.values(displayData));

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
            .attr("transform", "translate(50, -50)")
            .call(yAxis);


        // draw bars by country value
        svg.selectAll("rect")
            .data(Object.keys(displayData).filter(d => d !== "Year"))
            .enter()
            .append("rect")
            .attr("x", d => x(d) + 50)
            .attr("y", d => y(displayData[d]) - 50)
            .attr("width", x.bandwidth())
            .attr("height", d => 600 - y(displayData[d]))
            .attr("fill", "steelblue");

        // add title
        svg.append("text")
            .attr("x", 50)
            .attr("y", 100)
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Top Ten Countries by Obesity Rate in " + this.year);

    }


    updateBarChart(year) {
        // update bar height with new data
        d3.selectAll("rect")
            .data(Object.keys(displayData).filter(d => d !== "Year"))
            .transition()
            .duration(1000)
            .attr("y", d => y(displayData[d]) - 50)
            .attr("height", d => 600 - y(displayData[d]));
    }

}