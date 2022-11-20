

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
            .attr("width", 400)
            .attr("height", 400)
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append("rect")
            .attr("width", 500)
            .attr("height", 400)
            .attr("fill", "none");

        // create a projection
        vis.projection = d3.geoAlbersUsa()
            .translate([200, 200])
            .scale(500);

        // create a path
        vis.path = d3.geoPath()
            .projection(vis.projection);


        let proj;
        // use the projection to draw the points
        for (let i = 0; i < vis.data.length; i++) {
            proj = vis.projection([vis.data[i].longitude, vis.data[i].latitude]);
            vis.svg.append("circle")
                .attr("cx", proj[0])
                .attr("cy", proj[1])
                .attr("r", 1)
                .attr("fill", "red")
                .attr("opacity", 0.5);
        };


        // load in the data
        d3.json("data/us-states.json").then(function (us) {
            // use the geometry of the states to draw
            vis.svg.selectAll("path")
                .data(us.features)
                .enter()
                .append("path")
                .attr("fill", "white")
                .attr("d", vis.path)
                .attr("class", function (d) {
                    return d.properties.name;
                });
        });







    }



}