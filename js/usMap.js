

class usMap{
    constructor(){
        this.parentElement = "us-map-div";
        this.data = null
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

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
            .attr("width", 400)
            .attr("height", 400)
            .attr("fill", "white");

        let us = vis.svg.append("g")
            .attr("class", "us")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);


        vis.svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("fill", function(d) { return color(d.properties.density); })
            .attr("d", path)
            .attr("class", function(d) { return d.properties.name; })
            .on("click", function(d) {
                console.log(d.properties.name);

            } )
    }



}