const width = 960;
const height = 500;

const projection = d3.geo
  .albersUsa()
  .translate([width / 2, height / 2])
  .scale([1000]);

const path = d3.geo.path().projection(projection);

const color = d3.scale
  .linear()
  .range(["#b0e8e0", "#00af94", "#00b89e", "#29c7b5", "#91dfd5"]);

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const div = d3
  .select("body")
  .append("div")
  .attr("class", "map-tooltip")
  .style("opacity", 0);

d3.csv("lawyers.csv", function(data) {
  const maxValueOfLawyers = Math.max(...data.map(state => state.lawyers), 0);
  const minValueOfLawyers = Math.min(...data.map(state => state.lawyers), 0);

  color.domain([minValueOfLawyers, maxValueOfLawyers]);

  d3.json("us-states.json", function(json) {
    for (let i = 0; i < data.length; i++) {
      const { state, lawyers } = data[i];

      for (let j = 0; j < json.features.length; j++) {
        const jsonState = json.features[j].properties.name;

        if (state == jsonState) {
          json.features[j].properties.lawyers = lawyers;
          break;
        }
      }
    }
    svg
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function(d) {
        return d.properties.name;
      })
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .style("fill", function(d) {
        const value = d.properties.lawyers;

        if (value) {
          return color(value);
        }

        return "#b0e8e0";
      });

    function randomlyShowTooltip() {
      setTimeout(function() {
        const randomState = getRandomState();
        showTooltip(randomState);

        randomlyShowTooltip();
      }, 2000);
    }

    function showTooltip({ name, lawyers }) {
      const { x, y } = d3

        .select(`path[id='${name}']`)
        .node()
        .getBBox();
      div
        .transition()
        .duration(300)
        .style("opacity", 1);
      div
        .html(
          `<p class="map-tooltip-lawyers">${lawyers}</p> <p class="map-tooltip-state">${name}</p>`
        )
        .style("left", x + "px")
        .style("top", (y - 10) + "px");

      setTimeout(function hideTooltip() {
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      }, 1500);
    }

    function getRandomState() {
      return json.features[Math.floor(Math.random() * json.features.length)].properties
    }

    randomlyShowTooltip();
  });
});
