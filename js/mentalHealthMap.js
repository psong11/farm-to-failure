class MentalHealthMap {
    constructor(parentElement, geoData, mentalHealthData) {
        this.initVis();
    }

    initVis() {
<<<<<<< Updated upstream
=======
        console.log("initializing...");
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        console.log("Parent: ", document.getElementById(vis.parentElement).getBoundingClientRect());
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.colors = d3.scaleLinear()
            .range(['white', "#136D70"]);

        console.log("here");

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.projection = d3.geoOrthographic() // d3.geoStereographic()
            .translate([vis.width / 2, vis.height / 2]);

        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);


        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;

        vis.countries = vis.svg.selectAll(".country")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path);

        let m0,
            o0;

        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                })
        )
>>>>>>> Stashed changes

    }

    wrangleData() {
<<<<<<< Updated upstream
=======
        let vis = this;

        vis.countryNames = [];

        Array.from(d3.group(vis.geoData.objects.countries.geometries, d=>d.properties.name)).forEach(country => {
            vis.countryNames.push(country[0]);
        });


        vis.displayData = [];
        vis.displayDataCountryNames = [];

        d3.csv("data/prevalence-by-mental-and-substance-use-disorder.csv", d => {
            d.Year = +d.Year;
            d.PrevalenceAnxietydisorders = +d.PrevalenceAnxietydisorders;
            d.PrevalenceDepressivedisorders = +d.PrevalenceDepressivedisorders;
            d.PrevalenceAlcoholusedisorders = +d.PrevalenceAlcoholusedisorders;

            return d;
        }).then(data => {
            data.forEach(row => {
                // and push rows with proper dates into filteredData
                console.log("selectedTime ", selectedTime);
                if (selectedTime.toString() === row.Year.toString()) {
                    vis.displayData.push(row);
                    console.log("MATCHED");
                }
            });

            Array.from(d3.group(vis.displayData, d=>d.Entity)).forEach(country => {
                vis.displayDataCountryNames.push(country[0]);
            });

            vis.colors.domain([0, d3.max(vis.displayData, d => d[selectedCategory])]);
            console.log("done loading...");
            vis.updateVis();
        })

>>>>>>> Stashed changes

    }

    updateVis() {

    }
}