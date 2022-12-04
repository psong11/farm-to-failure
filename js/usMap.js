

class usMap{
    constructor(){
        this.parentElement = "us-map-div";
        this.data = null
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.stateCount = [];

        vis.wrangleData();

    }

    wrangleData() {
        d3.csv("data/FastFoodRestaurants.csv", d => {
            d.latitude = +d.latitude;
            d.longitude = +d.longitude;
            return d

        }).then(data => {
            console.log(data);
            this.data = data;
            this.updateVis();
            this.makeScatter();
        })

    }

    updateVis() {
        let vis = this;
        vis.svg = d3.select("#us-map-div")
            .append("svg")
            .attr("width", 800)
            .attr("height", 600)
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append("rect")
            .attr("width", 800)
            .attr("height", 600)
            .attr("fill", "none");

        // create a projection
        vis.projection = d3.geoAlbersUsa()
            .translate([400, 300])
            .scale(800);

        // create a path
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // load in the data
        d3.json("data/us-states.json").then(function (us) {

            // use the geometry of the states to draw
            vis.svg.selectAll("path")
                .data(us.features)
                .enter()
                .append("path")
                .attr("d", vis.path)
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-width", 2)
                .attr("class", function (d) {
                    return d.properties.name;
                })
                .attr("id", "state-stroke");

        });


        // create continuous color scale
        vis.colorScale = d3.scaleLinear()
            .domain([24.7, 40.6])
            .range(["#f7fbff", "#08306b"]);

        // add tooltip for states
        vis.tooltip = d3.select("#us-map-div")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        // use obesity by state data to fill in the states
        d3.csv("data/obesity-by-state.csv", d => {
            d.Prevalence = +d.Prevalence;
            return d

        }).then(data => {
            console.log(data);
            // set georgia color
            // fill in the state by obesity level
            for (let i = 0; i < data.length; i++) {
                let state = data[i].State;
                let obesity = data[i].Prevalence;
                // replace spaces with dots in state
                state = state.replace(/\s+/g, '.');
                d3.select("." + state
                ).attr("fill", vis.colorScale(obesity)).attr("z-index", 2)
                    .attr("id", "state-fill")
                    .attr("opacity", 1)
                    .on("mouseover", function (d) {
                        // get the opacity of the state
                        vis.opac = d3.select(this).attr("opacity");

                        // make the state name appear
                        // replace dot with space
                        let state2 = state.replace(/\./g, ' ');

                        // make opacity 0.5
                        d3.select(this).attr("opacity", vis.opac*0.5);

                        // make #state-stroke opacity 1
                        d3.select("#state-stroke").attr("opacity", 1);

                        // make the state name appear
                        d3.select("#state-name").text(state2);

                        // make the obesity rate appear
                        // select scatter plot dot
                        d3.select("#"+state).attr("fill", "black")
                            .attr("r", 10);

                        // make the tooltip appear on the state
                        vis.tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);

                        // let number of restaurants
                        vis.tooltip.html("State: " + state2 + "<br/>" + "Obesity Rate: " + obesity + "%"
                            + "<br/>" + "Restaurants (per 100k): " + vis.stateCount[state2]);


                    })
                    .on("mouseout", function (d) {
                        // make the state name disappear
                        d3.select("#state-name").text("");
                        // make the obesity rate disappear
                        d3.select("#obesity-rate").text("");
                        // make opacity 1
                        d3.select(this).attr("opacity", vis.opac*0.5);

                        d3.select("#"+state)
                            .attr("fill", "white")
                            .attr("opacity", 0.5)
                            .attr("r", 5);


                        vis.svg.select("." + state)
                            .attr("opacity", 1);

                        // make the tooltip disappear
                        vis.tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            }

            vis.svg.select(".Georgia").attr("fill", vis.colorScale(33.9)).attr("z-index", 2)
                .attr("id", "state-fill")
                .attr("opacity", 1)
                .on("mouseover", function (d) {
                    // get the opacity of the state
                    vis.opac = d3.select(this).attr("opacity");

                    // make the state name appear
                    // replace dot with space
                    let state2 = "Georgia";

                    // make opacity 0.5
                    d3.select(this).attr("opacity", vis.opac*0.5);

                    // make #state-stroke opacity 1
                    d3.select("#state-stroke").attr("opacity", 1);

                    // make the state name appear
                    d3.select("#state-name").text(state2);

                    // make the obesity rate appear
                    // select scatter plot dot
                    d3.select("#Georgia").attr("fill", "black")
                        .attr("r", 10);

                    // make the tooltip appear on the state
                    vis.tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);

                    // let number of restaurants
                    vis.tooltip.html("State: Georgia" + "<br/>" + "Obesity Rate: " + 33.9 + "%"
                        + "<br/>" + "Restaurants (per 100k): 347");
                })
                .on("mouseout", function (d) {
                    // make the state name disappear
                    d3.select("#state-name").text("");
                    // make the obesity rate disappear
                    d3.select("#obesity-rate").text("");
                    // make opacity 1
                    d3.select(this).attr("opacity", 1);

                    vis.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);

                    d3.select("#Georgia")
                        .attr("fill", "white")
                        .attr("opacity", 0.5)
                        .attr("r", 5);

                });

        });

        // add legend
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20,20)");

        vis.legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 230)
            .attr("height", 90)
            .attr("fill", "white")
            .attr("opacity", 0.5);

        vis.legend.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .text("Obesity Prevalence by State")
            .attr("font-size", 14)
            .attr("font-weight", "bold");

        vis.legend.append("text")
            .attr("x", 40)
            .attr("y", 50)
            .text("40.6%")
            .attr("font-size", 12);

        vis.legend.append("text")
            .attr("x", 40)
            .attr("y", 70)
            .text("24.7%")
            .attr("font-size", 12);

        vis.legend.append("rect")
            .attr("x", 10)
            .attr("y", 40)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "#08306b");

        vis.legend.append("rect")
            .attr("x", 10)
            .attr("y", 60)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "#f7fbff");







        let proj;

        // use the projection to draw the points
        for (let i = 0; i < vis.data.length; i++) {
            proj = vis.projection([vis.data[i].longitude, vis.data[i].latitude]);
            // if lat and long are not null
            if (proj !== null) {
                vis.svg.insert("circle")
                    .attr("id", "restaurant-circle")
                    .attr("cx", proj[0])
                    .attr("cy", proj[1])
                    .attr("r", 1.5)
                    .attr("fill", "red")
                    .attr("opacity", 1)
                    .attr("z-index", 99);
            }
        };

        // put circles on top of states
        vis.svg.select("#state-fill").attr("z-index", 1);

        // add title
        vis.svg.append("text")
            .attr("x", 450)
            .attr("y", 50)
            .text("Fast Food and Obesity in the US")
            .attr("font-size", 20)
            .attr("font-weight", "bold")
            .attr('fill', 'white')
            .attr("text-anchor", "middle");

    }

    makeScatter() {
        // create scatter plot
        let vis = this;
        vis.margin = {top: 20, right: 10, bottom: 10, left: 20};
        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        vis.s = d3.select("#scatter-div")
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("transform", `translate(150,50)`);

        // create scales
        vis.xScale = d3.scaleLinear()
            .domain([20, 50])
            .range([vis.margin.left, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([0, 500])
            .range([vis.height-vis.margin.top, 0]);

        // create axes
        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale);

        vis.yAxis = d3.axisLeft()
            .scale(vis.yScale);

        // add axes
        vis.s.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(${vis.margin.left}, ${vis.height})`)
            .call(vis.xAxis);

        vis.s.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${2*vis.margin.left}, ${vis.margin.top})`)
            .call(vis.yAxis);

        // add y axis label
        vis.s.append("text")
            .attr("x", -vis.height/2 + 20)
            .attr("y", 9)
            .attr("transform", "rotate(-90)")
            .attr("fill", "white")
            .attr("font-size", 10)
            .text("Number of Restaurants per 100,000 People");

        // add x axis label
        vis.s.append("text")
            .attr("x", 380)
            .attr("y", 496)
            .attr("fill", "white")
            .attr("font-size", 10)
            .text("Obesity Prevalence (%)");

        // count how many observations there are for each state
        let stateCount = {};

        for (let i = 0; i < vis.data.length; i++) {
            let state = vis.data[i].province;
            if (state in stateCount) {
                stateCount[state]++;
            } else {
                stateCount[state] = 1;
            }
        }
        ;

        let stateNames = {
            "AL": "Alabama",
            "AK": "Alaska",
            "AZ": "Arizona",
            "AR": "Arkansas",
            "CA": "California",
            "CO": "Colorado",
            "CT": "Connecticut",
            "DE": "Delaware",
            "DC": "District of Columbia",
            "FL": "Florida",
            "GA": "Georgia",
            "HI": "Hawaii",
            "ID": "Idaho",
            "IL": "Illinois",
            "IN": "Indiana",
            "IA": "Iowa",
            "KS": "Kansas",
            "KY": "Kentucky",
            "LA": "Louisiana",
            "ME": "Maine",
            "MD": "Maryland",
            "MA": "Massachusetts",
            "MI": "Michigan",
            "MN": "Minnesota",
            "MS": "Mississippi",
            "MO": "Missouri",
            "MT": "Montana",
            "NE": "Nebraska",
            "NV": "Nevada",
            "NH": "New Hampshire",
            "NJ": "New Jersey",
            "NM": "New Mexico",
            "NY": "New York",
            "NC": "North Carolina",
            "ND": "North Dakota",
            "OH": "Ohio",
            "OK": "Oklahoma",
            "OR": "Oregon",
            "PA": "Pennsylvania",
            "RI": "Rhode Island",
            "SC": "South Carolina",
            "SD": "South Dakota",
            "TN": "Tennessee",
            "TX": "Texas",
            "UT": "Utah",
            "VT": "Vermont",
            "VA": "Virginia",
            "WA": "Washington",
            "WV": "West Virginia",
            "WI": "Wisconsin",
            "WY": "Wyoming"
        };

        // iterate through stateCount and change key name to keyname in state_names.js
        for (let key in stateCount) {
            let newKey = stateNames[key];
            stateCount[newKey] = stateCount[key];
            delete stateCount[key];
        }

        // drop if key is undefined
        for (let key in stateCount) {
            if (key === "undefined") {
                delete stateCount[key];
            }
        }

        vis.stateCount = stateCount;


        d3.csv("data/obesity-by-state.csv", d => {
            d.Prevalence = +d.Prevalence;
            return d

        }).then(data => {
            vis.obesityData = data;
            console.log(data);
            // fill in the state by obesity level
            for (let i = 0; i < data.length; i++) {
                let state = data[i].State;
                let obesity = data[i].Prevalence;


                if((obesity !== null) && (stateCount[state] !== null) && (state !== "Virgin Islands")
                    && (state !== "Puerto Rico")
                ) {

                    // draw circles for each state
                    vis.s.append("circle")
                        .attr("cx", vis.xScale(obesity) + vis.margin.left)
                        .attr("cy", vis.yScale(stateCount[state]) + vis.margin.top)
                        .attr("r", 5)
                        .attr("fill", "white")
                        .attr("stroke", "black")
                        .attr("opacity", 0.5)
                        .attr("class", "state-circle")
                        .attr("id", state)
                        .on("mouseover", function (d) {
                            d3.select(this)
                                .attr("fill", "black")
                                .attr("opacity", 1)
                                .attr("r", 10);

                            d3.select("#us-obesity-div")
                                .append("text")
                                .attr("id", "state-obesity-text")
                                .text(state + ": " + obesity + "%")
                                .attr("x", 100)
                                .attr("y", 100)
                                .attr("font-size", 20)
                                .attr("font-weight", "bold")
                                .attr("fill", "black")
                                .attr("opacity", 1);

                            vis.svg.select("." + state)
                                .attr("opacity", 0);

                            vis.tooltip.transition()
                                .duration(200)
                                .style("opacity", .9);


                            vis.tooltip.html("State: " + state + "<br/>" + "Obesity Rate: " + obesity + "%" +
                                "<br/>" + "Restaurants (per 100k): " + stateCount[state]);

                        })
                        .on("mouseout", function (d) {
                            d3.select(this)
                                .attr("fill", "white")
                                .attr("opacity", 0.5)
                                .attr("r", 5);


                            d3.select("#us-obesity-div")
                                .text("");

                            vis.svg.select("." + state)
                                .attr("opacity", 1);

                            vis.tooltip.transition()
                                .duration(200)
                                .style("opacity", 0);
                        });
                }

            }});

        };

    }
