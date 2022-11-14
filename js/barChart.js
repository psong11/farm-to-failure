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
            console.log("data here", displayData);
            this.data = displayData;

            this.createBarChart(displayData, year);
            this.createAreaChart(displayData);

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
            .attr("height", 500);


        // add rectangle in back
        svg.append("rect")
            .attr("x", 50)
            .attr("y", 40)
            .attr("width", 500)
            .attr("height", 600)
            .attr("fill", "red")
            .attr("opacity", 1);

        svg.append("rect")
            .attr("x", 70)
            .attr("y", 60)
            .attr("width", 460)
            .attr("height", 560)
            .attr("fill", "white")
            .attr("opacity", 1);

        // add 30 red vertical lines to the rectangle above
        for (let i = 0; i < 30; i++) {
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
            .attr("width", 500)
            .attr("height", 150)
            .attr("fill", "red")



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
            .attr("size", 10)
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
            .attr("width", x.bandwidth())
            .attr("height", d => 500 - y(useData[d]))
            .attr("fill", "#f5b51e");

        svg.selectAll("rect.fry")
            .on("mouseover", function (d) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("height", d => 500 - y(useData[d]) + 150)
                    .attr("y", d => y(useData[d]) - 300);
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("height", d => 500 - y(useData[d]))
                    .attr("y", d => y(useData[d]) - 150);
            });

        // add title
        svg.append("text")
            .attr('class', 'title')
            .attr("x", 50)
            .attr("y", 20)
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
            .attr("size", 10)
            .style("text-anchor", "end");

        // make y axis with transistion
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
            .attr("width", x.bandwidth())
            .attr("height", d => 500 - y(newData[d]))
            .attr("fill", "#f5b51e");

        // on hover make the bar longer
        svg.selectAll("rect.fry")
            .on("mouseover", function (d) {
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("height", d => 500 - y(newData[d]) + 150)
                    .attr("y", d => y(newData[d]) - 300);

            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("height", d => 500 - y(newData[d]))
                    .attr("y", d => y(newData[d]) - 150);
            });


        // update title
        console.log(this.year);
        svg.select(".title")
            .text("Top Ten Countries by Obesity Rate in " + this.year);
    }

    createAreaChart(data) {
        console.log(data);
        // create a new svg
        let svg = d3.select("#happy-area-graph")
            .append("svg")
            .attr("width", 600)
            .attr("height", 400);

        // make x axis by year
        let x = d3.scaleLinear()
            .domain([1975, 2016])
            .range([0, 550]);

        // make y axis by values of data
        let y = d3.scaleLinear()
            .domain([0, 60])
            .range([350, 0]);

        // make x axis
        let xAxis = d3.axisBottom(x);
        svg.append("g")
            .attr('class', 'x-axis')
            .attr("transform", "translate(50, 380)")
            .call(xAxis);

        // make y axis
        let yAxis = d3.axisLeft(y);
        svg.append("g")
            .attr('class', 'y-axis')
            .attr("transform", "translate(50, 30)")
            .call(yAxis);

        // iterate through data[0]
        let keys = Object.keys(data[0]).filter(d => d !== "Year");
        console.log(keys);

        // for each key make a dictionary of value
        let dataDict = {};
        for (let i = 0; i < keys.length; i++) {
            dataDict[keys[i]] = data.map(d => d[keys[i]]);
        };
        console.log(dataDict);

        // for each key in dataDict make a line
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
            .attr("stroke-width", 2)
            .attr("transform", "translate(50, 30)")
            .attr("class", d => d)
            .attr("id", "country-path");

        // add title
        svg.append("text")
            .attr('class', 'title')
            .attr("x", 50)
            .attr("y", 20)
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("Obesity Rate by Country");


        // add a tooltip to each line
        svg.selectAll("#country-path")
            .on("mouseover", function(d) {
                d3.select(this).style("stroke", "red");
                d3.select(this).attr("stroke-width", 5);
                let className = d3.select(this).attr("class");

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
            });

    }

}
