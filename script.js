const width = 800, height = 500;

const svgTimeSeries = d3.select("#time-series-graph svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(50, 20)`); 

let allData;  // To store the full dataset for filtering

// Load the unemployment data
d3.csv("usLaborLAUS.csv").then(function(data) {
  allData = data;  // Save the full dataset
  
  data.forEach(function(d) {
      d.year = +d.year; 
      d.value = +d.value;
  });

  
  const dataByState = d3.group(data, d => d.srd_text);

  
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  //x
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width - 100]); 
  svgTimeSeries.append("g")
    .attr("transform", `translate(0,${height - 40})`) 
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); 

  // y
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height - 40, 0]); 
  svgTimeSeries.append("g")
    .call(d3.axisLeft(y));

  // Draw the line for each state
  dataByState.forEach((values, key) => {
    svgTimeSeries.append("path")
        .datum(values)
        .attr("class", "line " + key.replace(/\s+/g, '-')) 
        .attr("fill", "none")
        .attr("stroke", () => color(key))
        .attr("stroke-width", "1.5px")
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value))
        );
  });

  // Populate dropdown filter with states and add an "All States" option
  const select = d3.select("#state-select");
  select.append("option")
    .text("All States")
    .attr("value", "all-states");
  select.selectAll("option.state")
    .data(Array.from(dataByState.keys()))
    .enter().append("option")
    .classed("state", true)
    .text(d => d)
    .attr("value", d => d.replace(/\s+/g, '-'));

  // Add event listener to the dropdown for filtering
  select.on("change", function(event) {
    const selectedValue = d3.select(this).property("value");
    if (selectedValue === "all-states") {
      updateGraph(allData, x, y, color);  // Show all states
    } else {
      const selectedState = selectedValue.replace(/-/g, ' ');
      const filteredData = allData.filter(d => d.srd_text === selectedState);
      updateGraph(filteredData, x, y, color);  // Update the graph with filtered data
    }
  });
});

function updateGraph(filteredData, x, y, color) {
  // Clear the existing graph
  svgTimeSeries.selectAll("*").remove();

 
  svgTimeSeries.append("g")
    .attr("transform", `translate(0,${height - 40})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svgTimeSeries.append("g")
    .call(d3.axisLeft(y));

  // Redraw the line
  const dataByState = d3.group(filteredData, d => d.srd_text);
  dataByState.forEach((values, key) => {
    svgTimeSeries.append("path")
        .datum(values)
        .attr("class", "line " + key.replace(/\s+/g, '-'))
        .attr("fill", "none")
        .attr("stroke", () => color(key))
        .attr("stroke-width", "1.5px")
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value))
        );
  });
}

// Create the tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("padding", "10px")
    .style("background-color", "white")
    .style("border", "1px solid #000")
    .style("border-radius", "5px");



// Load the geographic and unemployment data
d3.json("USA_geojson.json").then(function(geojsonData) {
    d3.csv("usLaborLAUS.csv").then(function(unemploymentData) {
        // Process unemployment data to find the average per state
        const unemploymentByState = d3.group(unemploymentData, d => d.srd_text);
        const averageUnemploymentByState = new Map();

        unemploymentByState.forEach((values, key) => {
            const average = d3.mean(values, v => +v.value);  
            averageUnemploymentByState.set(key, average);
        });

        // unemployment rate
        geojsonData.features.forEach(function(d) {
            const stateName = d.properties.NAME;
            const average = averageUnemploymentByState.get(stateName);
            d.properties.unemployment = average;
        });

        // color scale
        const colorScale = d3.scaleSequential(d3.interpolateOrRd)
            .domain(d3.extent(geojsonData.features, d => d.properties.unemployment));

        
        const svg = d3.select("#geographic-plot svg");

        
        const projection = d3.geoAlbersUsa().fitSize([width, height], geojsonData);
        const path = d3.geoPath().projection(projection);

        // Draw each state with color based on unemployment rate
        const states = svg.selectAll(".state")
            .data(geojsonData.features)
            .enter().append("path")
            .attr("class", d => "state " + d.properties.NAME.replace(/\s+/g, '-'))  //name by state
            .attr("d", path)
            .style("fill", d => colorScale(d.properties.unemployment))
            .style("stroke", "#fff")
            .on("mouseover", function(event, d) {
                // Tooltip
                tooltip.html(d.properties.NAME + ": " + d.properties.unemployment.toFixed(2) + "%")
                       .style("visibility", "visible")
                       .style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
                
                
                d3.select("#time-series-graph svg").selectAll(".line." + d.properties.NAME.replace(/\s+/g, '-'))
                   .style("stroke-width", "8px");  // Bolden the line
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                tooltip.style("visibility", "hidden");
                
                // Reset the time series line style
                d3.select("#time-series-graph svg").selectAll(".line." + d.properties.NAME.replace(/\s+/g, '-'))
                   .style("stroke-width", "1.5px");  // Reset line width
            });
    });
});




