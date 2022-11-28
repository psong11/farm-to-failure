class ProteinLinePlot {
    constructor(parentElement) {
        this.parentElement = parentElement;

        this.initVis();
    }

    initVis() {
        console.log("INITIALIZING PROTEIN LINE PLOT")
        let vis = this;

        vis.margin = {top: 50, right: 50, bottom: 50, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add the color scale for different continents

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        vis.x = d3.scaleLog()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .attr("class", "x-axis axis");

        vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + ",0)")
            .attr("class", "y-axis axis");

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

            console.log("displayData for protein chart", vis.displayData)

            vis.updateVis();
        })

    }

    updateVis() {
        let vis = this;

        vis.x
            .domain([0, d3.max(vis.displayData, d => d.GDPperCap)]);

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
            .attr('cx', d => vis.x(d.GDPperCap))
            .attr('cy', d => vis.y(d.ShareOfCalories))
            .attr('r', 10)
            .transition()
            .duration(2000);

    }

}