class ProteinScatterPlot {
    constructor(parentElement) {
        this.parentElement = parentElement;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 40, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add the color scale for different continents

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        vis.x = d3.scaleLog()
            .range([1, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis");

        vis.interactiveLegend = vis.svg.append('g')
            .attr("class", "interactiveLegend")
            .attr("style", "outline: thin solid white;")
            .attr("transform", `translate(${vis.width - 112}, ${vis.height - 200})`);

        vis.title = vis.svg.append('g')
            .attr('class', 'title')
            .attr("transform", `translate(${(vis.width / 2)-170}, 0)`)
            .append('text');

        this.wrangleData(1990);
    }

    wrangleData(year) {
        let vis = this;

        vis.displayData = [];

        vis.AsiaData = [];
        vis.NorthAmericaData = [];
        vis.SouthAmericaData = [];
        vis.AfricaData = [];
        vis.OceaniaData = [];
        vis.EuropeData = [];

        d3.csv("data/shareofdietaryenergyderivedfromproteinvsgdppercapita.csv", d => {

            d.GDPperCap2013 = +d.GDPperCap2013;
            d.ShareOfCalories2013 = +d.ShareOfCalories2013;
            d.ShareOfCalories1990 = +d.ShareOfCalories1990;
            d.GDPperCap1990 = +d.GDPperCap1990;

            return d;
        }).then(data => {
            data.forEach(row => {
                if (row.Continent === "Asia") {
                    vis.AsiaData.push(row);
                }
                if (row.Continent === "North America") {
                    vis.NorthAmericaData.push(row);
                }
                if (row.Continent === "South America") {
                    vis.SouthAmericaData.push(row);
                }
                if (row.Continent === "Africa") {
                    vis.AfricaData.push(row);
                }
                if (row.Continent === "Oceania") {
                    vis.OceaniaData.push(row);
                }
                if (row.Continent === "Europe") {
                    vis.EuropeData.push(row);
                }
                vis.displayData.push(row);
            });

            // potentially wrangle data according to continent

            /*console.log("Asia Data: ", vis.AsiaData);
            console.log("NA Data: ", vis.NorthAmericaData);
            console.log("SA Data: ", vis.SouthAmericaData);
            console.log("Africa Data: ", vis.AfricaData);
            console.log("Oceania Data: ", vis.OceaniaData);
            console.log("Europe Data: ", vis.EuropeData);*/

            vis.updateVis(year);
        })

    }

    updateVis(year) {
        let vis = this;

        let continents = [
            {
                continentName: "North America",
                continentColor: "#7ef211",
                active: false,
                y: 0
            },
            {
                continentName: "South America",
                continentColor: "#9b69ff",
                active: false,
                y: 30
            },
            {
                continentName: "Asia",
                continentColor: "Yellow",
                active: false,
                y: 60
            },
            {
                continentName: "Africa",
                continentColor: "#ff4d4d",
                active: false,
                y: 90
            },
            {
                continentName: "Oceania",
                continentColor: "#21edcf",
                active: false,
                y: 120
            },
            {
                continentName: "Europe",
                continentColor: "#ff26be",
                active: false,
                y: 150
            }
        ]

        vis.svg.append('text')
            .text('Click Box to Highlight Data by Continent')
            .attr('font-size', 15)
            .attr('fill', 'white')
            .attr("transform", `translate(${vis.width - 280}, ${vis.height - 215})`);

        function continentNameToClassName(continentName) {
            if (continentName === 'Asia') {
                return 'asia';
            }
            if (continentName === 'North America') {
                return 'northamerica';
            }
            if (continentName === 'South America') {
                return 'southamerica';
            }
            if (continentName === 'Africa') {
                return 'africa';
            }
            if (continentName === 'Oceania') {
                return 'oceania';
            }
            if (continentName === 'Europe') {
                return 'europe';
            }
        }

        vis.interactiveLegend.selectAll('rect')
            .data(continents)
            .enter()
            .append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('x', 0)
            .attr('y', d => d.y)
            .attr('fill', d => d.continentColor)
            .on('click', function(event, d) {
                if (d.active === false) {
                    d.active = true;
                    d3.selectAll(`.${continentNameToClassName(d.continentName)}`)
                        .style('opacity', 0.9);
                }
                else {
                    d.active = false;
                    d3.selectAll(`.${continentNameToClassName(d.continentName)}`)
                        .style('opacity', .5);
                }
            });
        vis.interactiveLegend.selectAll('text')
            .data(continents)
            .enter()
            .append('text')
            .attr('x', 30)
            .attr('y', d => (d.y)+15)
            .attr('font-size', 12)
            .attr('fill', 'white')
            .text(d => d.continentName);

        /*if (year === 1990) {
            vis.x
                .domain(d3.extent(vis.displayData, d=>d.GDPperCap1990));
            vis.y
                .domain([0, d3.max(vis.displayData, d => d.ShareOfCalories1990)]);
        }
        else if (year === 2013) {
            vis.x
                .domain(d3.extent(vis.displayData, d=>d.GDPperCap2013));
            vis.y
                .domain([0, d3.max(vis.displayData, d => d.ShareOfCalories2013)]);
        }*/
        vis.x
            .domain(d3.extent(vis.displayData, d=>d.GDPperCap1990));
        vis.y
            .domain([0, d3.max(vis.displayData, d => d.ShareOfCalories1990)]);

        vis.svg.select('.x-axis')
            .transition().duration(2000).call(vis.xAxis);
        vis.svg.select('.x-axis')
            .append('text')
            .text('GDP PER CAPITA IN INTL $')
            .attr('x', (vis.width / 2))
            .attr('y', 27)
            .attr('fill', 'white')
            .attr('font-size', 12);

        vis.svg.select('.y-axis')
            .transition().duration(2000).call(vis.yAxis);
        vis.svg.select('.y-axis')
            .append('text')
            .text('SHARE OF CALORIES BASED ON PROTEIN IN %')
            .attr('x', 260)
            .attr('y', -10)
            .attr('fill', 'white')
            .attr('font-size', 12);

        vis.title
            .text(`Effect of GDP on Protein Intake (${year})`)
            .attr('fill', 'white');

        vis.AsiaCircles = vis.svg.selectAll('.asia')
            .data(vis.AsiaData);
        vis.NorthAmericaCircles = vis.svg.selectAll('.northamerica')
            .data(vis.NorthAmericaData);
        vis.SouthAmericaCircles = vis.svg.selectAll('.southamerica')
            .data(vis.SouthAmericaData);
        vis.AfricaCircles = vis.svg.selectAll('.africa')
            .data(vis.AfricaData);
        vis.OceaniaCircles = vis.svg.selectAll('.oceania')
            .data(vis.OceaniaData);
        vis.EuropeCircles = vis.svg.selectAll('.europe')
            .data(vis.EuropeData);

        vis.AsiaCircles.exit().remove().transition().duration(2000)

        vis.NorthAmericaCircles.exit().remove().transition().duration(2000)

        vis.SouthAmericaCircles.exit().remove().transition().duration(2000)

        vis.AfricaCircles.exit().remove().transition().duration(2000)

        vis.OceaniaCircles.exit().remove().transition().duration(2000)

        vis.EuropeCircles.exit().remove().transition().duration(2000)


        vis.AsiaCircles
            .enter()
            .append('circle')
            .merge(vis.AsiaCircles)
            .attr('class', 'circle asia')
            .style('fill', function(d) {
                let correspondingCont = continents.find(cont => cont.continentName === d.Continent);
                return correspondingCont.continentColor;
            })
            .style('opacity', .5)
            .attr('stroke-width', '1px')
            .style('stroke', 'black')
            .attr('r', 10)
            .on('mouseover', function(event, d) {
                // console.log("Country BEING TOOLTIPPED", d);
                d3.select(this)
                    .attr('stroke-width', '4px')
                    .attr('fill', 'white')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3> ${d.Entity} <h3>
                     <h4> Continent: ${d.Continent} </h4>
                     <h4> GDP Per Capita (1990): ${"$"+d.GDPperCap1990.toFixed(2)} </h4>
                     <h4> GDP Per Capita (2013): ${"$"+d.GDPperCap2013.toFixed(2)} </h4>
                     <h4> Share of Dietary Calories Derived From Protein (1990): ${d.ShareOfCalories1990.toFixed(2)+"%"}</h4>
                     <h4> Share of Dietary Calories Derived From Protein (2013): ${d.ShareOfCalories2013.toFixed(2)+"%"}</h4>
                 </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr("fill", function(d){
                        let correspondingCont = continents.find(cont => cont.continentName === d.Continent);
                        // TODO find out why all of the data circles arent showing up
                        return correspondingCont.continentColor;
                    })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition().duration(2000)
            .attr('cx', function(d) {
                if (year === 1990) {return vis.x(d.GDPperCap1990);}
                else {return vis.x(d.GDPperCap2013);}
            })
            .attr('cy', function(d) {
                if (year === 1990) {return vis.y(d.ShareOfCalories1990);}
                else {return vis.y(d.ShareOfCalories2013)}
            });

        vis.NorthAmericaCircles
            .enter()
            .append('circle')
            .merge(vis.NorthAmericaCircles)
            .attr('class', 'circle northamerica')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .5)
            .attr('stroke-width', '1px')
            .style('stroke', 'black')
            .attr('r', 10)
            .on('mouseover', function(event, d) {
                // console.log("Country BEING TOOLTIPPED", d);
                d3.select(this)
                    .attr('stroke-width', '4px')
                    .attr('fill', 'white')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3> ${d.Entity} <h3>
                     <h4> Continent: ${d.Continent} </h4>
                     <h4> GDP Per Capita (1990): ${"$"+d.GDPperCap1990.toFixed(2)} </h4>
                     <h4> GDP Per Capita (2013): ${"$"+d.GDPperCap2013.toFixed(2)} </h4>
                     <h4> Share of Dietary Calories Derived From Protein (1990): ${d.ShareOfCalories1990.toFixed(2)+"%"}</h4>
                     <h4> Share of Dietary Calories Derived From Protein (2013): ${d.ShareOfCalories2013.toFixed(2)+"%"}</h4>
                 </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr("fill", function(d){
                        let correspondingCont = continents.find(cont => cont.continentName === d.Continent);
                        // TODO find out why all of the data circles arent showing up
                        return correspondingCont.continentColor;
                    })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition().duration(2000)
            .attr('cx', function(d) {
                if (year === 1990) {return vis.x(d.GDPperCap1990);}
                else {return vis.x(d.GDPperCap2013);}
            })
            .attr('cy', function(d) {
                if (year === 1990) {return vis.y(d.ShareOfCalories1990);}
                else {return vis.y(d.ShareOfCalories2013)}
            });

        vis.SouthAmericaCircles
            .enter()
            .append('circle')
            .merge(vis.SouthAmericaCircles)
            .attr('class', 'circle southamerica')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .5)
            .attr('stroke-width', '1px')
            .style('stroke', 'black')
            .attr('r', 10)
            .on('mouseover', function(event, d) {
                // console.log("Country BEING TOOLTIPPED", d);
                d3.select(this)
                    .attr('stroke-width', '4px')
                    .attr('fill', 'white')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3> ${d.Entity} <h3>
                     <h4> Continent: ${d.Continent} </h4>
                     <h4> GDP Per Capita (1990): ${"$"+d.GDPperCap1990.toFixed(2)} </h4>
                     <h4> GDP Per Capita (2013): ${"$"+d.GDPperCap2013.toFixed(2)} </h4>
                     <h4> Share of Dietary Calories Derived From Protein (1990): ${d.ShareOfCalories1990.toFixed(2)+"%"}</h4>
                     <h4> Share of Dietary Calories Derived From Protein (2013): ${d.ShareOfCalories2013.toFixed(2)+"%"}</h4>
                 </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr("fill", function(d){
                        let correspondingCont = continents.find(cont => cont.continentName === d.Continent);
                        // TODO find out why all of the data circles arent showing up
                        return correspondingCont.continentColor;
                    })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition().duration(2000)
            .attr('cx', function(d) {
                if (year === 1990) {return vis.x(d.GDPperCap1990);}
                else {return vis.x(d.GDPperCap2013);}
            })
            .attr('cy', function(d) {
                if (year === 1990) {return vis.y(d.ShareOfCalories1990);}
                else {return vis.y(d.ShareOfCalories2013)}
            });

        vis.AfricaCircles
            .enter()
            .append('circle')
            .merge(vis.AfricaCircles)
            .attr('class', 'circle africa')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .5)
            .attr('stroke-width', '1px')
            .style('stroke', 'black')
            .attr('r', 10)
            .on('mouseover', function(event, d) {
                // console.log("Country BEING TOOLTIPPED", d);
                d3.select(this)
                    .attr('stroke-width', '4px')
                    .attr('fill', 'white')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3> ${d.Entity} <h3>
                     <h4> Continent: ${d.Continent} </h4>
                     <h4> GDP Per Capita (1990): ${"$"+d.GDPperCap1990.toFixed(2)} </h4>
                     <h4> GDP Per Capita (2013): ${"$"+d.GDPperCap2013.toFixed(2)} </h4>
                     <h4> Share of Dietary Calories Derived From Protein (1990): ${d.ShareOfCalories1990.toFixed(2)+"%"}</h4>
                     <h4> Share of Dietary Calories Derived From Protein (2013): ${d.ShareOfCalories2013.toFixed(2)+"%"}</h4>
                 </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr("fill", function(d){
                        let correspondingCont = continents.find(cont => cont.continentName === d.Continent);
                        // TODO find out why all of the data circles arent showing up
                        return correspondingCont.continentColor;
                    })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition().duration(2000)
            .attr('cx', function(d) {
                if (year === 1990) {return vis.x(d.GDPperCap1990);}
                else {return vis.x(d.GDPperCap2013);}
            })
            .attr('cy', function(d) {
                if (year === 1990) {return vis.y(d.ShareOfCalories1990);}
                else {return vis.y(d.ShareOfCalories2013)}
            });

        vis.OceaniaCircles
            .enter()
            .append('circle')
            .merge(vis.OceaniaCircles)
            .attr('class', 'circle oceania')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .5)
            .attr('stroke-width', '1px')
            .style('stroke', 'black')
            .attr('r', 10)
            .on('mouseover', function(event, d) {
                // console.log("Country BEING TOOLTIPPED", d);
                d3.select(this)
                    .attr('stroke-width', '4px')
                    .attr('fill', 'white')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3> ${d.Entity} <h3>
                     <h4> Continent: ${d.Continent} </h4>
                     <h4> GDP Per Capita (1990): ${"$"+d.GDPperCap1990.toFixed(2)} </h4>
                     <h4> GDP Per Capita (2013): ${"$"+d.GDPperCap2013.toFixed(2)} </h4>
                     <h4> Share of Dietary Calories Derived From Protein (1990): ${d.ShareOfCalories1990.toFixed(2)+"%"}</h4>
                     <h4> Share of Dietary Calories Derived From Protein (2013): ${d.ShareOfCalories2013.toFixed(2)+"%"}</h4>
                 </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr("fill", function(d){
                        let correspondingCont = continents.find(cont => cont.continentName === d.Continent);
                        // TODO find out why all of the data circles arent showing up
                        return correspondingCont.continentColor;
                    })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition().duration(2000)
            .attr('cx', function(d) {
                if (year === 1990) {return vis.x(d.GDPperCap1990);}
                else {return vis.x(d.GDPperCap2013);}
            })
            .attr('cy', function(d) {
                if (year === 1990) {return vis.y(d.ShareOfCalories1990);}
                else {return vis.y(d.ShareOfCalories2013)}
            });

        vis.EuropeCircles
            .enter()
            .append('circle')
            .merge(vis.EuropeCircles)
            .attr('class', 'circle europe')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .5)
            .attr('stroke-width', '1px')
            .style('stroke', 'black')
            .attr('r', 10)
            .on('mouseover', function(event, d) {
                // console.log("Country BEING TOOLTIPPED", d);
                d3.select(this)
                    .attr('stroke-width', '4px')
                    .attr('fill', 'white')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3> ${d.Entity} <h3>
                     <h4> Continent: ${d.Continent} </h4>
                     <h4> GDP Per Capita (1990): ${"$"+d.GDPperCap1990.toFixed(2)} </h4>
                     <h4> GDP Per Capita (2013): ${"$"+d.GDPperCap2013.toFixed(2)} </h4>
                     <h4> Share of Dietary Calories Derived From Protein (1990): ${d.ShareOfCalories1990.toFixed(2)+"%"}</h4>
                     <h4> Share of Dietary Calories Derived From Protein (2013): ${d.ShareOfCalories2013.toFixed(2)+"%"}</h4>
                 </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr("fill", function(d){
                        let correspondingCont = continents.find(cont => cont.continentName === d.Continent);
                        // TODO find out why all of the data circles arent showing up
                        return correspondingCont.continentColor;
                    })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition().duration(2000)
            .attr('cx', function(d) {
                if (year === 1990) {return vis.x(d.GDPperCap1990);}
                else {return vis.x(d.GDPperCap2013);}
            })
            .attr('cy', function(d) {
                if (year === 1990) {return vis.y(d.ShareOfCalories1990);}
                else {return vis.y(d.ShareOfCalories2013)}
            });

    }

}