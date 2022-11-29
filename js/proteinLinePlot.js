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
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

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
            .attr("transform", `translate(0, ${vis.height-20})`);

        vis.svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(15, 0)`);

        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = [];

        d3.csv("data/shareofdietaryenergyderivedfromproteinvsgdppercapita.csv", d => {
            d.Year = +d.Year;
            d.ShareOfCalories = +d.ShareOfCalories;
            d.GDPperCap = +d.GDPperCap;

            return d;
        }).then(data => {
            data.forEach(row => {
                vis.displayData.push(row);
            });

            // potentially wrangle data according to continent

            console.log("displayData for protein chart", vis.displayData)

            vis.updateVis();
        })

    }

    updateVis() {
        let vis = this;

        vis.x
            .domain(d3.extent(vis.displayData, d=>d.GDPperCap));

        vis.y
            .domain([0, d3.max(vis.displayData, d => d.ShareOfCalories)]);

        vis.svg.select('.x-axis')
            .call(vis.xAxis);

        vis.svg.select('.y-axis')
            .call(vis.yAxis);

        vis.circles = vis.svg.selectAll('circle')
            .data(vis.displayData)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .style('fill', '#136D70')
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
            .attr('r', 10)
            .transition()
            .duration(2000);

    }

}