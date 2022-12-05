class MentalHealthMap {
    constructor(parentElement, geoData) {
        this.parentElement = parentElement;
        this.geoData = geoData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 5, right: 5, bottom: 5, left: 5};
        // console.log("Parent: ", document.getElementById(vis.parentElement).getBoundingClientRect());
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.colors = d3.scaleLinear()
            .range(['white', "#136D70"]);

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

        // console.log("vis.geoData: ", vis.geoData);
        // console.log("vis.geoData.objects: ", vis.geoData.objects);

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

        // add title to top of map
        vis.title = vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .attr('fill', 'white');


        // legend group
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 1 / 2}, ${vis.height - 80})`)
        vis.legendLabelMin = vis.legend.append('text')
            .text('0%')
            .attr('x', -5)
            .attr('y', 45)
            .attr('fill', 'white');
        vis.legendLabelMax = vis.legend.append('text')
            .attr('x', 175)
            .attr('y', 45)
            .attr('fill', 'white');
        vis.legendTitle = vis.legend.append('text')
            .text('Prevalence Legend (Black = No Data)')
            .attr('x', 0)
            .attr('y', -10)
            .attr('fill', 'white');

        // Global Averages group
        vis.globalAverages = vis.svg.append("g")
            .attr('class', 'globalAverages')
            .attr('transform', `translate(${0}, ${60})`);
        vis.globalAverageText = vis.globalAverages.append('div');

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip');

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.countryNames = [];

        Array.from(d3.group(vis.geoData.objects.countries.geometries, d=>d.properties.name)).forEach(country => {
            vis.countryNames.push(country[0]);
        });

        // console.log("countries on map: ", vis.countryNames);

        vis.displayData = [];
        vis.displayDataCountryNames = [];
        vis.anxietyAvg = 0;
        vis.depressiveAvg = 0;
        vis.alcAvg = 0;
        vis.drugAvg = 0;
        // console.log("loading...");

        d3.csv("data/prevalence-by-mental-and-substance-use-disorder.csv", d => {
            d.Year = +d.Year;
            d.PrevalenceAnxietydisorders = +d.PrevalenceAnxietydisorders;
            d.PrevalenceDepressivedisorders = +d.PrevalenceDepressivedisorders;
            d.PrevalenceAlcoholusedisorders = +d.PrevalenceAlcoholusedisorders;
            d.PrevalenceDrugusedisorders = +d.PrevalenceDrugusedisorders;

            return d;
        }).then(data => {
            // console.log("mental health data", data);
            data.forEach(row => {
                // and push rows with proper dates into filteredData
                // console.log("candidate for displaydata addition: ", row);
                // console.log("selectedTime ", selectedTime);
                if (selectedTime.toString() === row.Year.toString()) {
                    vis.displayData.push(row);
                    // console.log("MATCHED");
                    vis.anxietyAvg += row.PrevalenceAnxietydisorders;
                    vis.depressiveAvg += row.PrevalenceDepressivedisorders;
                    vis.alcAvg += row.PrevalenceAlcoholusedisorders;
                    vis.drugAvg += row.PrevalenceDrugusedisorders;
                }
            });
            vis.anxietyAvg = vis.anxietyAvg / vis.displayData.length;
            vis.depressiveAvg = vis.depressiveAvg / vis.displayData.length;
            vis.alcAvg = vis.alcAvg / vis.displayData.length;
            vis.drugAvg = vis.drugAvg / vis.displayData.length;

            // console.log("filtered mental health data", vis.displayData);

            Array.from(d3.group(vis.displayData, d=>d.Entity)).forEach(country => {
                vis.displayDataCountryNames.push(country[0]);
            });
            // console.log("displayDataCountryNames in wrangle: ", vis.displayDataCountryNames);

            vis.colors.domain([0, d3.max(vis.displayData, d => d[selectedCategory])]);
            // console.log("done loading...");
            vis.updateVis();
        })


    }

    updateVis() {
        // console.log("updating...");
        let vis = this;

        vis.title
            .text(translateSelectedCategory(selectedCategory) + " Around The World");

        function translateSelectedCategory(selectedCategory) {
            if (selectedCategory === "PrevalenceAnxietydisorders") {
                return "Anxiety Disorder Prevalence";
            }
            else if (selectedCategory === "PrevalenceDepressivedisorders") {
                return "Depression Disorder Prevalence";
            }
            else if (selectedCategory === "PrevalenceAlcoholusedisorders") {
                return "Alcohol Disorder Prevalence";
            }
            else {
                return "Drug Use Disorder Prevalence";
            }
        }


        document.getElementById('globalAverages').innerText =
            'Global Disorder Averages For ' + selectedTime + " |" +
            ' Anxiety: ' + vis.anxietyAvg.toFixed(2) + '% |' +
            ' Depression: ' + vis.depressiveAvg.toFixed(2) + '% |' +
            ' Alcohol: ' + vis.alcAvg.toFixed(2) + '% |' +
            ' Drug Use: ' + vis.drugAvg.toFixed(2) + '%';

        vis.gradientRange = d3.range(0,
            d3.max(vis.displayData, d => d[selectedCategory]),
            d3.max(vis.displayData, d => d[selectedCategory])/200);
        // Update the legend fill
        vis.legendBar = vis.legend.selectAll(".rect")
            .data(vis.gradientRange)
            .enter()
            .append("rect")
            .attr("y", 0)
            .attr("height", 25)
            .attr("x", (d,i) => i*1)
            .attr("width", 1)
            .attr("fill", d=>vis.colors(d));
        vis.legendLabelMax.text(d3.max(vis.displayData, d => d[selectedCategory]).toFixed(2) + "%");

        vis.countries
            .attr("fill", function(d){
                // console.log("what happend: ", vis.displayDataCountryNames.includes(d.properties.name));
                if(!vis.displayDataCountryNames.includes(d.properties.name)) {
                    // console.log("in if case for ", d.properties.name);
                    return "black";
                }
                else {
                    let country = vis.displayData.find(c => c.Entity === d.properties.name);
                    // console.log("country", country);
                    // console.log("selected category", selectedCategory);
                    return vis.colors(country[selectedCategory]);
                }
            })
            .on('mouseover', function(event, d) {
                let country = vis.displayData.find(o => o.Entity === d.properties.name);
                // console.log("COUNTRY BEING TOOLTIPPED", country);
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'black')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3> ${country.Entity} <h3>      
                     <h4> Prevalence of Anxiety Disorder: ${(country.PrevalenceAnxietydisorders).toFixed(2) + "%"}</h4>   
                     <h4> Prevalence of Depressive Disorder: ${(country.PrevalenceDepressivedisorders).toFixed(2) + "%"}</h4> 
                     <h4> Prevalence of Alcohol Use Disorder: ${(country.PrevalenceAlcoholusedisorders).toFixed(2) + "%"}</h4>
                     <h4> Prevalence of Drug Use Disorder: ${(country.PrevalenceDrugusedisorders).toFixed(2) + "%"}</h4>
                     <h4> Year: ${country.Year}</h4>              
                 </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", function(d){
                        let country = vis.displayData.find(o => o.Entity === d.properties.name);
                        return vis.colors(country[selectedCategory]);
                    })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });
    }
}