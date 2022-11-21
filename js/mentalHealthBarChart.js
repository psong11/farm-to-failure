class MentalHealthBarChart {
    constructor(parentElement){
        this.parentElement = parentElement;

        // parse date method
        // this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom - 10;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('Top 10 Countries By Prevalence')
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle')
            .attr('font-weight', 'bold')
            .attr('fill', 'white');

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // Scales and Axes
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);// <-- Also enables rounding .paddingInner(0.05);

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
            .attr("class", "y-axis axis");

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        vis.displayData = [];
        vis.topTenData = [];
        vis.topTenDataNames = [];
        d3.csv("data/prevalence-by-mental-and-substance-use-disorder.csv", d => {
            d.Year = +d.Year;
            d.PrevalenceAnxietydisorders = +d.PrevalenceAnxietydisorders;
            d.PrevalenceDepressivedisorders = +d.PrevalenceDepressivedisorders;
            d.PrevalenceAlcoholusedisorders = +d.PrevalenceAlcoholusedisorders;
            d.PrevalenceDrugusedisorders = +d.PrevalenceDrugusedisorders;

            return d;
        }).then(data => {
            data.forEach(row => {
                if (selectedTime.toString() === row.Year.toString()) {
                    vis.displayData.push(row);
                }
            });
            // console.log("barchart's display data", vis.displayData);
            vis.displayData.sort((a, b) => {
                return b[selectedCategory] - a[selectedCategory]
            })

            vis.topTenData = vis.displayData.slice(0, 10);
            vis.topTenData.forEach(function (country) {
                vis.topTenDataNames.push(country.Entity);
            })
            // console.log('final data structure for bar charts', vis.topTenData);
            vis.updateVis();
        })

    }

    updateVis() {
        let vis = this;

        vis.x
            .domain(vis.topTenDataNames);

        vis.y
            .domain([0, d3.max(vis.topTenData, d => d[selectedCategory])]);

        vis.svg.select('.x-axis')
            .call(vis.xAxis);

        vis.svg.select('.y-axis')
            .call(vis.yAxis);

        vis.bars = vis.svg.selectAll('rect')
            .data(vis.topTenData);

        vis.bars.exit().remove()
            .transition()
            .duration(2000);

        vis.bars
            .enter()
            .append('rect')
            .merge(vis.bars)
            .attr('class', 'bar')
            .style('fill', '#136D70')
            .attr('x', d => vis.x(d.Entity) + 5)
            .attr('y', d => vis.y(d[selectedCategory]))
            .attr('height', d => vis.height - vis.y(d[selectedCategory]))
            .attr('width', vis.x.bandwidth() - 10)
            .transition()
            .duration(2000);
    }
}