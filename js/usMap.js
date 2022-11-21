

class usMap{
    constructor(){
        this.parentElement = "us-map-div";
        this.data = null
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};

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
                });
        });


        // create continuous color scale
        vis.colorScale = d3.scaleLinear()
            .domain([24.7, 40.6])
            .range(["#f7fbff", "#08306b"]);


        // use obesity by state data to fill in the states
        d3.csv("data/obesity-by-state.csv", d => {
            d.Prevalence = +d.Prevalence;
            return d

        }).then(data => {
            console.log(data);
            // fill in the state by obesity level
            for (let i = 0; i < data.length; i++) {
                let state = data[i].State;
                let obesity = data[i].Prevalence;
                // replace spaces with dots in state
                state = state.replace(/\s+/g, '.');
                d3.select("." + state
                ).attr("fill", vis.colorScale(obesity)).attr("z-index", 2)
                    .attr("id", "state-fill")
                    .attr("opacity", 1);
            }

            // set georgia color
            vis.svg.select(".Georgia").attr("fill", vis.colorScale(33.9)).attr("z-index", 2)
                .attr("id", "state-fill")
                .attr("opacity", 1);
        });

        // add legend
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20,20)");

        vis.legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 230)
            .attr("height", 100)
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
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.s = d3.select("#scatter-div")
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("transform", `translate(50,50)`);

        // create scales
        vis.xScale = d3.scaleLinear()
            .domain([20, 50])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([0, 500])
            .range([vis.height, 0]);

        // create axes
        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale);

        vis.yAxis = d3.axisRight()
            .scale(vis.yScale);

        // add axes
        vis.s.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height - vis.margin.top})`)
            .call(vis.xAxis);

        vis.s.append("g")
            .attr("class", "y-axis")
            .call(vis.yAxis);

        // x value is obesity by state
        // y value is fast food by state
        // color is state

        // add title
        vis.s.append("text")
            .attr("x", 400)
            .attr("y", 50)
            .text("Fast Food and Obesity in the US")

        // add x axis label
        vis.s.append("text")
            .attr("x", 400)
            .attr("y", 580)
            .text("Obesity Prevalence by State (%)")

        // add y axis label
        vis.s.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .text("Fast Food Restaurants per 100,000 People")

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


        d3.csv("data/obesity-by-state.csv", d => {
            d.Prevalence = +d.Prevalence;
            return d

        }).then(data => {
            console.log(data);
            // fill in the state by obesity level
            for (let i = 0; i < data.length; i++) {
                let state = data[i].State;
                let obesity = data[i].Prevalence;

                console.log(state);
                console.log(obesity);
                console.log(stateCount[state]);


                if((obesity !== null) && (stateCount[state] !== null)) {

                    // draw circles for each state
                    vis.s.append("circle")
                        .attr("cx", vis.xScale(obesity))
                        .attr("cy", vis.yScale(stateCount[state]))
                        .attr("r", 5)
                        .attr("fill", "white")
                        .attr("stroke", "black")
                        .attr("opacity", 0.5)
                        .attr("class", "state-circle")
                        .attr("id", state)
                        .on("mouseover", function (d) {
                            d3.select(this)
                                .attr("fill", "black")
                                .attr("opacity", 1);

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

                        })
                        .on("mouseout", function (d) {
                            d3.select(this)
                                .attr("fill", "white")
                                .attr("opacity", 0.5);


                            d3.select("#us-obesity-div")
                                .append("text")
                                .attr("id", "state-obesity-text")
                                .text("");

                            vis.svg.select("." + state)
                                .attr("opacity", 1);
                        });
                }

            }});

        };

    }
