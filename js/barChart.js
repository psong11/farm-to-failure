class BarChart {

    constructor() {
        this.data = null;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // get year from slider
        vis.year = d3.select("#myRange").property("value");

        vis.wrangleData(vis.year);
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
            console.log("data here", displayData);
            this.data = displayData;

            this.createBarChart(displayData, year);
            this.createAreaChart(displayData);

        });
    }

    createBarChart(data, year) {
        let vis = this;
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
            .attr("width", 800)
            .attr("height", 500);


        // add rectangle in back
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 780)
            .attr("height", 650)
            .attr("fill", "#ff7777")
            .attr("opacity", 1);


        svg.append("rect")
            .attr("x", 70)
            .attr("y", 60)
            .attr("width", 660)
            .attr("height", 560)
            .attr("fill", "white")
            .attr("opacity", 1);

        // add 30 red vertical lines to the rectangle above
        for (let i = 0; i < 45; i++) {
            svg.append("line")
                .attr("x1", 70 + i * 15)
                .attr("y1", 60)
                .attr("x2", 70 + i * 15)
                .attr("y2", 620)
                .attr("stroke", "red")
                .attr("stroke-width", 2);
        }

        // add rectangle
        svg.append("rect")
            .attr("class", "fry-box")
            .attr("x", 50)
            .attr("y", 350)
            .attr("width", 700)
            .attr("height", 150)
            .attr("fill", "#ff7777")

        // add y-axis label
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(20, 200) rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .text("Obesity Rate (%)");



        // make x axis by country
        let x = d3.scaleBand()
            .domain(Object.keys(useData))
            .range([0, 700])
            .padding(0.1);

        // max value in array
        let max = d3.max(Object.values(useData));

        // make y axis by obesity
        let y = d3.scaleLinear()
            .domain([0, max])
            .range([500, 200]);

        // make x axis with maximum of 30 ticks
        let xAxis = d3.axisBottom(x);

        // make y axis
        let yAxis = d3.axisLeft(y);

        // make x axis
        svg.append("g")
            .attr('class', 'x-axis')
            .attr("transform", "translate(50, 350)")
            .call(xAxis);

        // rotate x axis labels
        svg.selectAll(".x-axis text")
            .attr("transform", "translate(-10, 2) rotate(-45" +
                ")")
            .attr("size", 14)
            .attr("font-weight", "bold")
            .style("text-anchor", "end");


        // make y axis
        svg.append("g")
            .attr('class', 'y-axis')
            .attr("transform", "translate(50, -150)")
            .call(yAxis);


        // draw bars by country value
        svg.selectAll("rect.fry")
            .data(Object.keys(useData).filter(d => d !== "Year"))
            .enter()
            .append("rect")
            .attr("class", "fry")
            .attr("x", d => x(d) + 50)
            .attr("y", d => y(useData[d]) - 150)
            .attr("val", d => useData[d])
            .attr("width", x.bandwidth())
            .attr("height", d => 500 - y(useData[d]))
            .attr("fill", "#f5b51e");

        svg.selectAll("rect.fry")
            .on("mouseover", function (d) {
                // get bar y value
                let yValue = d3.select(this).attr("val");

                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("height", d => 500 - y(useData[d]) + 150)
                    .attr("y", d => y(useData[d]) - 300);

                // get x value of this
                let xPosition = parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2;

                    svg.append("text")
                        .attr("class", "value")
                        .attr("x", xPosition)
                        .attr("y", 330)
                        .attr("text-anchor", "middle")
                        .attr("font-size", "12px")
                        .attr("fill", "white")
                        .text(yValue + "%");

            })
            .on("mouseout", function (d) {
                // remove text
                svg.select(".value").remove("text");
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("height", d => 500 - y(useData[d]))
                    .attr("y", d => y(useData[d]) - 150);

            });

        // add title
        svg.append("text")
            .attr('class', 'title')
            .attr("x", 160)
            .attr("y", 35)
            .attr("font-size", "22px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Top Ten Countries by Obesity Rate in " + this.year);

        // add text
        svg.append("text")
            .attr("x", 400)
            .attr("y", 450)
            .attr('font-size', 20)
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .text("Country")

    }


    updateBarChart(year) {

        // update the
        this.year = +year;

        // set display data to the data for the first year
        let updateData = this.data.filter(d => d.Year === this.year)[0];

        // update bar chart with new data
        let svg = d3.select("#happy-meal-graph").select("svg");

        // remove the year from the display data
        let newData = Object.assign({}, updateData);
        delete newData.Year;

        // filter to only have the top ten
        let topTen = Object.keys(newData).sort((a, b) => newData[b] - newData[a]).slice(0, 10);

        // append the values
        let topTenValues = topTen.map(d => newData[d]);

        // build dictionary of country and values
        let topTenData = {};

        topTen.forEach((d, i) => {
            topTenData[d] = topTenValues[i];
        });

        newData = topTenData;


        // make x axis by country
        let x = d3.scaleBand()
            .domain(Object.keys(newData))
            .range([0, 700])
            .padding(0.1);

        // max value in array
        let max = d3.max(Object.values(newData));

        // make y axis by obesity
        let y = d3.scaleLinear()
            .domain([0, max])
            .range([500, 200]);

        // make x axis with transistion
        let xAxis = d3.axisBottom(x);
        svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(xAxis);

        svg.selectAll(".x-axis text")
            .attr("transform", "translate(-10, 2) rotate(-45" +
                ")")
            .attr("size", 14)
            .attr("font-weight", "bold")
            .style("text-anchor", "end");


        let yAxis = d3.axisLeft(y);
        svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(yAxis);

        // make bars with transistion
        svg.selectAll("rect.fry")
            .data(Object.keys(newData).filter(d => d !== "Year"))
            .transition()
            .duration(1000)
            .attr("class", "fry")
            .attr("x", d => x(d) + 50)
            .attr("y", d => y(newData[d]) - 150)
            .attr("val", d => newData[d])
            .attr("width", x.bandwidth())
            .attr("height", d => 500 - y(newData[d]))
            .attr("fill", "#f5b51e");

        // on hover make the bar longer
        svg.selectAll("rect.fry")
            .on("mouseover", function (d) {
                // get bar y value
                let yValue = d3.select(this).attr("val");

                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("height", d => 500 - y(newData[d]) + 150)
                    .attr("y", d => y(newData[d]) - 300);

                // get x value of this
                let xPosition = parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2;

                svg.append("text")
                        .attr("class", "value")
                        .attr("x", xPosition)
                        .attr("y", 330)
                        .attr("text-anchor", "middle")
                        .attr("font-size", "12px")
                        .attr("fill", "white")
                        .text(yValue + "%");

            })
            .on("mouseout", function (d) {
                // remove text
                svg.select(".value").remove("text");

                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("height", d => 500 - y(newData[d]))
                    .attr("y", d => y(newData[d]) - 150);

            });

        svg.select(".title")
            .text("Top Ten Countries by Obesity Rate in " + this.year);
    }

    createAreaChart(data) {
        console.log(data);
        // create a new svg
        let svg = d3.select("#happy-area-graph")
            .append("svg")
            .attr("width", 650)
            .attr("height", 600);

        // make x axis by year
        let x = d3.scaleLinear()
            .domain([1975, 2016])
            .range([0, 600]);

        // make y axis by values of data
        let y = d3.scaleLinear()
            .domain([0, 60])
            .range([550, 0]);

        // make x axis
        let xAxis = d3.axisBottom(x)
            .tickFormat(d3.format("d"));
        svg.append("g")
            .attr('class', 'x-axis')
            .attr("transform", "translate(50, 580)")
            .call(xAxis);

        // make y axis
        let yAxis = d3.axisLeft(y);
        svg.append("g")
            .attr('class', 'y-axis')
            .attr("transform", "translate(50, 30)")
            .call(yAxis);

        // add y axis label
        svg.append("text")
            .attr("x", -300)
            .attr("y", 20)
            .attr('font-size', 12)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr("transform", "rotate(-90)")
            .text("Obesity Rate (%)");

        // iterate through data[0]
        let keys = Object.keys(data[0]).filter(d => d !== "Year");
        console.log(keys);

        // for each key make a dictionary of value
        let dataDict = {};
        for (let i = 0; i < keys.length; i++) {
            dataDict[keys[i]] = data.map(d => d[keys[i]]);
        };
        console.log(dataDict);

        // make an array from 1975 to 2016
        let years = [];
        for (let i = 1975; i < 2017; i++) {
            years.push(i);
        }

        // make an area chart for all of the countries




        let colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'];

        // grab all the keys from the key value pairs in data (filter out 'year' ) to get a list of categories
        this.dataCategories = Object.keys(this.data[0]).filter(d=>d !== "Year")

        // prepare colors for range
        let colorArray = this.dataCategories.map( (d,i) => {
            return colors[i%10]
        })

        // Set ordinal color scale
        this.colorScale = d3.scaleOrdinal()
            .domain(this.dataCategories)
            .range(colorArray);


        let line = d3.line()
            .x((d, i) => x(i+1975))
            .y(d => y(d));

        // make a path for each line
        svg.selectAll("path")
            .data(Object.keys(dataDict))
            .enter()
            .append("path")
            .attr("d", d => line(dataDict[d]))
            .attr("stroke", "white")
            .attr("fill", "none")
            .attr("opacity", 0.5)
            .attr("stroke-width", 2)
            .attr("transform", "translate(50, 30)")
            .attr("class", d => d)
            .attr("id", "country-path");


        // add title
        svg.append("text")
            .attr('class', 'title')
            .attr("x", 50)
            .attr("y", 20)
            .attr("font-size", "22px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Obesity Rate by Country");

        // make sure that all lines are white
        svg.selectAll("path")
            .attr("stroke", "white");





        // add a tooltip to each line
        svg.selectAll("#country-path")
            .on("mouseover", function(d) {
                d3.select(this).style("stroke", "red");
                d3.select(this).attr("stroke-width", 10);
                d3.select(this).attr("opacity", 1);
                let className = d3.select(this).attr("class");

                // if country is not us, unhighlight us
                if (className !== "United.States.of.America") {
                    d3.select(".United.States.of.America")
                        .attr("stroke", "white")
                        .attr("stroke-width", 2)
                        .attr("opacity", 0.5);
                } else {
                    d3.select(".United.States.of.America")
                        .attr("stroke", "red")
                        .attr("stroke-width", 10)
                        .attr("opacity", 1);
                }

                d3.select("#us-button")
                    .text("Highlight the United States");


                d3.select("#country-name")
                    .text(className);

                d3.select("#country-obesity")
                    .text("Obesity Level in 2016: " + dataDict[className][dataDict[className].length - 1]);

                d3.select("#country-initial")
                    .text("Obesity Level in 1975: " + dataDict[className][0]);

                d3.select("#country-change")
                    .text("Change in Obesity Level: " + (dataDict[className][dataDict[className].length - 1] - dataDict[className][0]).toFixed(2));

                d3.select("#country-percent")
                    .text("Percent Change in Obesity Level: " + ((dataDict[className][dataDict[className].length - 1] - dataDict[className][0]) / dataDict[className][0] * 100).toFixed(2) + "%");


            })
            .on("mouseout", function() {
                d3.select(this).style("stroke", "white");
                d3.select(this).attr("stroke-width", 2);
                d3.select(this).attr("opacity", 0.5);
            });


    }


}
