class ProteinLinePlot {
    constructor(parentElement) {
        this.parentElement = parentElement;

        this.initVis();
    }

    initVis() {
        console.log("INITIALIZING PROTEIN LINE PLOT")
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
            .attr("style", "outline: thin solid black;")
            .attr("transform", `translate(${vis.width - 112}, ${vis.height - 200})`);

        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = [];

        vis.AsiaData = [];
        vis.NorthAmericaData = [];
        vis.SouthAmericaData = [];
        vis.AfricaData = [];
        vis.OceaniaData = [];
        vis.EuropeData = [];

        d3.csv("data/shareofdietaryenergyderivedfromproteinvsgdppercapita.csv", d => {
            d.Year = +d.Year;
            d.ShareOfCalories = +d.ShareOfCalories;
            d.GDPperCap = +d.GDPperCap;

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

            console.log("Asia Data: ", vis.AsiaData);
            console.log("NA Data: ", vis.NorthAmericaData);
            console.log("SA Data: ", vis.SouthAmericaData);
            console.log("Africa Data: ", vis.AfricaData);
            console.log("Oceania Data: ", vis.OceaniaData);
            console.log("Europe Data: ", vis.EuropeData);

            vis.updateVis();
        })

    }

    updateVis() {
        let vis = this;

        let continents = [
            {
                continentName: "North America",
                continentColor: "Green",
                active: false,
                y: 0
            },
            {
                continentName: "South America",
                continentColor: "Orange",
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
                continentColor: "Red",
                active: false,
                y: 90
            },
            {
                continentName: "Oceania",
                continentColor: "Blue",
                active: false,
                y: 120
            },
            {
                continentName: "Europe",
                continentColor: "Brown",
                active: false,
                y: 150
            }
        ]

        vis.svg.append('text')
            .text('Click Box to Highlight Data by Continent')
            .attr('font-size', 12)
            .attr('fill', 'black')
            .attr("transform", `translate(${vis.width - 227}, ${vis.height - 215})`);

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

        /*
        continents.forEach((continent,i) => {
            console.log("CONTINENT: ", continent, "i: ", i);
            vis.interactiveLegend.append('rect')
                .attr('width', 20)
                .attr('height', 20)
                .attr('x', 0)
                .attr('y', 30*i)
                .attr('fill', continent.continentColor)
                .on('click', function(event, d) {
                    let activeContinent = continents.find(cont => cont.continentName === continent);
                    console.log("Active Continent: ", activeContinent);
                    if (activeContinent.active === false) {
                        activeContinent.active = true;
                        d3.selectAll(`.${continentNameToClassName(continent.continentName)}`)
                            .style('opacity', .8);
                    }
                    else {
                        activeContinent.active = false;
                        d3.selectAll(`.${continentNameToClassName(continent.continentName)}`)
                            .style('opacity', .3);
                    }
                });

            vis.interactiveLegend.append('text')
                .attr('x', 30)
                .attr('y', 30*i+15)
                .attr('font-size', 12)
                .attr('fill', 'black')
                .text(continent.continentName);
        })
         */

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
                console.log('d:', d);
                if (d.active === false) {
                    d.active = true;
                    d3.selectAll(`.${continentNameToClassName(d.continentName)}`)
                        .style('opacity', .8);
                }
                else {
                    d.active = false;
                    d3.selectAll(`.${continentNameToClassName(d.continentName)}`)
                        .style('opacity', .3);
                }
            });
        vis.interactiveLegend.selectAll('text')
            .data(continents)
            .enter()
            .append('text')
            .attr('x', 30)
            .attr('y', d => (d.y)+15)
            .attr('font-size', 12)
            .attr('fill', 'black')
            .text(d => d.continentName);

        vis.x
            .domain(d3.extent(vis.displayData, d=>d.GDPperCap));

        vis.y
            .domain([0, d3.max(vis.displayData, d => d.ShareOfCalories)]);

        vis.svg.select('.x-axis')
            .call(vis.xAxis);

        vis.svg.select('.y-axis')
            .call(vis.yAxis);

        vis.AsiaCircles = vis.svg.selectAll('.asia')
            .data(vis.AsiaData)
            .enter()
            .append('circle')
            .attr('class', 'circle asia')
            .style('fill', function(d) {
                let correspondingCont = continents.find(cont => cont.continentName === d.Continent);
                // TODO find out why all of the data circles arent showing up

                return correspondingCont.continentColor;
            })
            .style('opacity', .3)
            .style('stroke', 'black')
            .attr('cx', function(d) {
                console.log("X DATA FOR POINT: ", d.GDPperCap, ", ", vis.x(d.GDPperCap));
                console.log("type of x data", typeof(vis.x(d.GDPperCap)));
                return vis.x(d.GDPperCap);
            })
            .attr('cy', function(d) {
                console.log("Y DATA FOR POINT: ", d.ShareOfCalories, ", ", vis.y(d.ShareOfCalories));
                console.log("type of y data", typeof(vis.y(d.ShareOfCalories)));
                return vis.y(d.ShareOfCalories);
            })
            .attr('r', 10);

        vis.NorthAmericaCircles = vis.svg.selectAll('.northamerica')
            .data(vis.NorthAmericaData)
            .enter()
            .append('circle')
            .attr('class', 'circle northamerica')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .3)
            .style('stroke', 'black')
            .attr('cx', function(d) {
                console.log("X DATA FOR POINT: ", d.GDPperCap, ", ", vis.x(d.GDPperCap));
                console.log("type of x data", typeof(vis.x(d.GDPperCap)));
                return vis.x(d.GDPperCap);
            })
            .attr('cy', function(d) {
                console.log("Y DATA FOR POINT: ", d.ShareOfCalories, ", ", vis.y(d.ShareOfCalories));
                console.log("type of y data", typeof(vis.y(d.ShareOfCalories)));
                return vis.y(d.ShareOfCalories);
            })
            .attr('r', 10);

        vis.SouthAmericaData = vis.svg.selectAll('.southamerica')
            .data(vis.SouthAmericaData)
            .enter()
            .append('circle')
            .attr('class', 'circle southamerica')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .3)
            .style('stroke', 'black')
            .attr('cx', function(d) {
                console.log("X DATA FOR POINT: ", d.GDPperCap, ", ", vis.x(d.GDPperCap));
                console.log("type of x data", typeof(vis.x(d.GDPperCap)));
                return vis.x(d.GDPperCap);
            })
            .attr('cy', function(d) {
                console.log("Y DATA FOR POINT: ", d.ShareOfCalories, ", ", vis.y(d.ShareOfCalories));
                console.log("type of y data", typeof(vis.y(d.ShareOfCalories)));
                return vis.y(d.ShareOfCalories);
            })
            .attr('r', 10);

        vis.AfricaData = vis.svg.selectAll('.africa')
            .data(vis.AfricaData)
            .enter()
            .append('circle')
            .attr('class', 'circle africa')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .3)
            .style('stroke', 'black')
            .attr('cx', function(d) {
                console.log("X DATA FOR POINT: ", d.GDPperCap, ", ", vis.x(d.GDPperCap));
                console.log("type of x data", typeof(vis.x(d.GDPperCap)));
                return vis.x(d.GDPperCap);
            })
            .attr('cy', function(d) {
                console.log("Y DATA FOR POINT: ", d.ShareOfCalories, ", ", vis.y(d.ShareOfCalories));
                console.log("type of y data", typeof(vis.y(d.ShareOfCalories)));
                return vis.y(d.ShareOfCalories);
            })
            .attr('r', 10);

        vis.OceaniaData = vis.svg.selectAll('.oceania')
            .data(vis.OceaniaData)
            .enter()
            .append('circle')
            .attr('class', 'circle oceania')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .3)
            .style('stroke', 'black')
            .attr('cx', function(d) {
                console.log("X DATA FOR POINT: ", d.GDPperCap, ", ", vis.x(d.GDPperCap));
                console.log("type of x data", typeof(vis.x(d.GDPperCap)));
                return vis.x(d.GDPperCap);
            })
            .attr('cy', function(d) {
                console.log("Y DATA FOR POINT: ", d.ShareOfCalories, ", ", vis.y(d.ShareOfCalories));
                console.log("type of y data", typeof(vis.y(d.ShareOfCalories)));
                return vis.y(d.ShareOfCalories);
            })
            .attr('r', 10);

        vis.EuropeData = vis.svg.selectAll('.europe')
            .data(vis.EuropeData)
            .enter()
            .append('circle')
            .attr('class', 'circle europe')
            .style('fill', function(d) {
                let datumContinent = d.Continent;
                let correspondingCont = continents.find(cont => cont.continentName === datumContinent);

                return correspondingCont.continentColor;
            })
            .style('opacity', .3)
            .style('stroke', 'black')
            .attr('cx', function(d) {
                console.log("X DATA FOR POINT: ", d.GDPperCap, ", ", vis.x(d.GDPperCap));
                console.log("type of x data", typeof(vis.x(d.GDPperCap)));
                return vis.x(d.GDPperCap);
            })
            .attr('cy', function(d) {
                console.log("Y DATA FOR POINT: ", d.ShareOfCalories, ", ", vis.y(d.ShareOfCalories));
                console.log("type of y data", typeof(vis.y(d.ShareOfCalories)));
                return vis.y(d.ShareOfCalories);
            })
            .attr('r', 10);

    }

}