document.addEventListener("DOMContentLoaded", () => {
  const MAP_WIDTH = 960;
  const MAP_HEIGHT = 500;

  const projection = d3.geo
    .albersUsa()
    .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
    .scale([1000]);

  const path = d3.geo.path().projection(projection);

  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", MAP_WIDTH)
    .attr("height", MAP_HEIGHT);

  const marker = d3
    .select("#map")
    .append("div")
    .attr("class", "map-tooltip")
    .style("opacity", 0);

  const getMaxValueOfLawyers = statesGeoJson =>
    Math.max(
      ...statesGeoJson.features.map(state =>
        state.properties.lawyers ? state.properties.lawyers : 0
      )
    );

  const addStatesPath = (statesGeoJson, colorScale) => {
    svg
      .selectAll("path")
      .data(statesGeoJson.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", d => d.properties.name)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .style("fill", d =>
        d.properties.lawyers ? colorScale(d.properties.lawyers) : "#b0e8e0"
      );
  };
  d3.json("us-states.json", statesGeoJson => {
    const colorScale = d3.scale
      .linear()
      .range(["#b0e8e0", "#00af94", "#00b89e", "#29c7b5", "#91dfd5"])
      .domain([0, getMaxValueOfLawyers(statesGeoJson)]);

    addStatesPath(statesGeoJson, colorScale);

    const getRandomState = () =>
      statesGeoJson.features[
        Math.floor(Math.random() * statesGeoJson.features.length)
      ].properties;

    const initTooltipToggling = () => {
      setTimeout(() => {
        showTooltip(getRandomState());
        initTooltipToggling();
      }, 2000);
    };

    const showTooltip = ({ name, lawyers }) => {
      const getStateCenterPosition = stateName => {
        const position = d3
          .select(`path[id='${stateName}']`)
          .node()
          .getBBox();

        return position;
      };

      const fadeInTooltip = (x, y) => {
        marker
          .transition()
          .duration(300)
          .style("opacity", 1);

        marker
          .html(
            `<p class="map-tooltip-lawyers">${lawyers}</p> <p class="map-tooltip-state">${name}</p>`
          )
          .style("left", x + "px")
          .style("top", y - 10 + "px");
      };

      const { x, y } = getStateCenterPosition(name);

      fadeInTooltip(x, y);

      const fadeOutTooltip = () => {
        marker
          .transition()
          .duration(500)
          .style("opacity", 0);
      }
      setTimeout(fadeOutTooltip, 1500);
    };

    initTooltipToggling();
  });
});
