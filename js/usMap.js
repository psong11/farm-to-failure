

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
        })

    }

    updateVis() {
        let vis = this;
        vis.svg = d3.select("#us-map-div")
            .append("svg")
            .attr("width", 800)
            .attr("height", 800)
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append("rect")
            .attr("width", 800)
            .attr("height", 800)
            .attr("fill", "none");

        // create a projection
        vis.projection = d3.geoAlbersUsa()
            .translate([400, 400])
            .scale(1000);

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
                    .attr("opacity", 0.5);
            }

            // set georgia color
            vis.svg.select(".Georgia").attr("fill", vis.colorScale(33.9)).attr("z-index", 2)
                .attr("id", "state-fill")
                .attr("opacity", 0.5);
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
                    .attr("opacity", 0.5)
                    .attr("z-index", 99);
            }

        }
        ;

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

}