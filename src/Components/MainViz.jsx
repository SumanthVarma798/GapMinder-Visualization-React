import React, { Component } from "react";
import * as d3 from "d3";
import lifeExpenctancyCSV from "../data/life_expectancy_years.csv";
import populationTotalCSV from "../data/population_total.csv";
import countriesCSV from "../data/countries_regions.csv";
import gdpCSV from "../data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv";
import childMortalityCSV from "../data/child_mortality_0_5_year_olds_dying_per_1000_born.csv";
import womenFertilityCSV from "../data/children_per_woman_total_fertility.csv";
import co2emissionsCSV from "../data/co2_emissions_tonnes_per_person.csv";
import populationDensityCSV from "../data/population_density_per_square_km.csv";
import murdersCSV from "../data/murder_total_deaths.csv";
import forestAreaCSV from "../data/forest_area_sq_km.csv";
import surfaceAreaCSV from "../data/surface_area_sq_km.csv";

class MainViz extends Component {
  // Setting initial variables
  svg;
  svgWidth;
  svgHeight;
  svgInnerWidth;
  svgInnerHeight;

  lifeExpenctancy;
  population;
  contries;
  gdp;
  childMortality;
  womenFertility;
  co2Emissions;
  populationDensity;
  totalMurders;
  forestArea;
  surfaceArea;

  newContries;
  xAxisValue;
  yAxisValue;
  xScale;
  yScale;
  year;
  xData;
  yData;
  radius = 20;
  animationSpeed = 500;
  transitionDuration = 400;
  slidertimeout;
  playPauseFlag = false;
  pauseFlag = false;

  animation;
  colorScale;
  margin = { top: 100, bottom: 100, left: 100, right: 100 };

  //getting basic info when the page loads
  componentDidMount() {
    this.svg = d3.select("#main-viz");
    this.svgWidth = +this.svg.style("width").replace("px", "");
    this.svgHeight = +this.svg.style("height").replace("px", "");
    this.svgInnerWidth = this.svgWidth - this.margin.left - this.margin.right;
    this.svgInnerHeight = this.svgHeight - this.margin.top - this.margin.bottom;

    // getting the data
    Promise.all([
      d3.csv(lifeExpenctancyCSV),
      d3.csv(populationTotalCSV),
      d3.csv(countriesCSV),
      d3.csv(gdpCSV),
      d3.csv(childMortalityCSV),
      d3.csv(womenFertilityCSV),
      d3.csv(co2emissionsCSV),
      d3.csv(populationDensityCSV),
      d3.csv(murdersCSV),
      d3.csv(forestAreaCSV),
      d3.csv(surfaceAreaCSV),
    ]).then((data) => {
      this.lifeExpenctancy = data[0];
      this.population = data[1];
      this.contries = data[2];
      this.gdp = data[3];
      this.childMortality = data[4];
      this.womenFertility = data[5];
      this.co2Emissions = data[6];
      this.populationDensity = data[7];
      this.totalMurders = data[8];
      this.forestArea = data[9];
      this.surfaceArea = data[10];

      // setting initial newContries to contries for the regions filter to work
      this.newContries = this.contries;

      // Declaring colorScale as global to fix color change issue in the countries filter
      this.colorScale = d3
        .scaleOrdinal()
        .domain(this.contries, (d) => d["World bank region"])
        .range(d3.schemeTableau10);

      // setting a mapping variable to take input from the input fields and get the correct data
      this.dataMap = {
        Population: this.population,
        "Life Expectancy": this.lifeExpenctancy,
        "GDP PerCapita": this.gdp,
        "Child Mortality Rate": this.childMortality,
        "Women Fertility Rate": this.womenFertility,
        "CO2 Emissions": this.co2Emissions,
        "Population Density": this.populationDensity,
        Murders: this.totalMurders,
        "Total Forest Area": this.forestArea,
        "Total Surface Area": this.surfaceArea,
      };

      const updateViz = () => {
        d3.select("#main-viz").selectAll("*").remove();
        d3.select("#heading").selectAll("*").remove();
        d3.select("#year-min-text").selectAll("h1").remove();
        d3.select("#year-max-text").selectAll("h1").remove();
        this.renderViz();
      };

      const updatePlot = () => {
        this.year = document.getElementById("year-slider").value;
        const circlesDJ = this.svg
          .select("#datapoints")
          .selectAll("circle")
          .data(this.newContries, (d) => d.geo);
        const geotextDJ = this.svg
          .select("#geotext")
          .selectAll("text")
          .data(this.newContries, (d) => `${d.geo}-id`);

        circlesDJ
          .exit()
          .transition()
          .duration(this.transitionDuration)
          .attr("r", 0);
        // .remove();

        geotextDJ
          .exit()
          .transition()
          .duration(this.transitionDuration)
          .attr("opacity", 0);
        // .remove();

        circlesDJ
          .transition()
          .duration(this.transitionDuration)
          .attr("cx", (d) =>
            this.xScale(
              this.xData.find((row) => row.country === d.name) === undefined
                ? undefined
                : this.xData.find((row) => row.country === d.name)[
                    this.year
                  ] === ""
                ? undefined
                : this.xData.find((row) => row.country === d.name)[this.year]
            )
          )
          .attr("cy", (d) =>
            this.yScale(
              this.yData.find((row) => row.country === d.name) === undefined
                ? undefined
                : this.yData.find((row) => row.country === d.name)[
                    this.year
                  ] === ""
                ? undefined
                : this.yData.find((row) => row.country === d.name)[this.year]
            )
          )
          .attr("r", this.radius);

        geotextDJ
          .transition()
          .duration(this.transitionDuration)
          .attr("opacity", 0.6)
          .attr("x", (d) =>
            this.xScale(
              this.xData.find((row) => row.country === d.name) === undefined
                ? undefined
                : this.xData.find((row) => row.country === d.name)[
                    this.year
                  ] === ""
                ? undefined
                : this.xData.find((row) => row.country === d.name)[this.year]
            )
          )
          .attr("y", (d) =>
            this.yScale(
              this.yData.find((row) => row.country === d.name) === undefined
                ? undefined
                : this.yData.find((row) => row.country === d.name)[
                    this.year
                  ] === ""
                ? undefined
                : this.yData.find((row) => row.country === d.name)[this.year]
            )
          );
        this.renderYearText();
      };

      const resetAnimations = () => {
        if (this.playPauseFlag) {
          // If the animations is running stop it every time we refresh
          clearTimeout(this.slidertimeout);
          this.playPauseFlag = false;
          document.getElementById("play/pause").className = "fa fa-play fa-2x";
          document.getElementById("year-slider").value = this.yearmin + "";
        }
      };

      // Adding an event listener for regions
      document.getElementById("regions-menu").addEventListener("change", () => {
        if (document.getElementById("regions-menu").value !== "All-Countries") {
          this.newContries = this.contries.filter(
            (country) =>
              country["World bank region"] ===
              document.getElementById("regions-menu").value
          );
          updatePlot();
        } else {
          this.newContries = this.contries;
          updatePlot();
        }
      });

      // Adding an event listener for x-axis
      document.getElementById("x-axis-menu").addEventListener("change", () => {
        this.xAxisValue = document.getElementById("x-axis-menu").value;
        this.xData = this.dataMap[this.xAxisValue];
        resetAnimations();
        updateViz();
      });

      // Adding an event listener for y-axis
      document.getElementById("y-axis-menu").addEventListener("change", () => {
        this.yAxisValue = document.getElementById("y-axis-menu").value;
        this.yData = this.dataMap[this.yAxisValue];
        resetAnimations();
        updateViz();
      });

      // Getting the current year value from the year slider
      document.getElementById("year-slider").addEventListener("input", () => {
        this.year = document.getElementById("year-slider").value;
        updatePlot();
      });

      // secondary callback function
      this.animation = () => {
        if (+document.getElementById("year-slider").value === this.yearmax) {
          document.getElementById("play/pause").className = "fa fa-play fa-2x";
          this.playPauseFlag = false;
          return;
        }
        document.getElementById("year-slider").value++;
        updatePlot();
        this.slidertimeout = setTimeout(
          () => this.animation(),
          this.animationSpeed
        );
      };

      // Animate button event listener
      document.getElementById("play-button").addEventListener("click", () => {
        if (
          document.getElementById("play/pause").className === "fa fa-play fa-2x"
        ) {
          let sliderVal = +document.getElementById("year-slider").value;
          if (sliderVal + 1 <= this.yearmax && !this.playPauseFlag) {
            document.getElementById("play/pause").className =
              "fa fa-pause fa-2x";
            this.playPauseFlag = true;
            this.animation();
          } else {
            document.getElementById("play/pause").className =
              "fa fa-play fa-2x";
            document.getElementById("year-slider").value = this.yearmin + "";
            updatePlot();
          }
        } else {
          document.getElementById("play/pause").className = "fa fa-play fa-2x";
          clearTimeout(this.slidertimeout);
          this.playPauseFlag = false;
        }

        // Animation speed event listener
        document.getElementById("1X").addEventListener("click", () => {
          if (this.playPauseFlag) {
            clearTimeout(this.slidertimeout);
            this.animationSpeed = 500;
            this.animation();
          } else {
            this.animationSpeed = 500;
          }
        });
        document.getElementById("2X").addEventListener("click", () => {
          if (this.playPauseFlag) {
            clearTimeout(this.slidertimeout);
            this.animationSpeed = 250;
            this.animation();
          } else {
            this.animationSpeed = 250;
          }
        });
        document.getElementById("3X").addEventListener("click", () => {
          if (this.playPauseFlag) {
            clearTimeout(this.slidertimeout);
            this.animationSpeed = 100;
            this.animation();
          } else {
            this.animationSpeed = 100;
          }
        });
        document.getElementById("4X").addEventListener("click", () => {
          if (this.playPauseFlag) {
            clearTimeout(this.slidertimeout);
            this.animationSpeed = 50;
            this.animation();
          } else {
            this.animationSpeed = 50;
          }
        });
      });

      this.xAxisValue = "Population";
      this.yAxisValue = "Life Expectancy";
      this.renderViz();
    });
  }

  getExtentsOfData(data) {
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;
    data.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (+row[key] <= min) min = +row[key];
        if (+row[key] >= max) max = +row[key];
      });
    });
    return [min, max];
  }

  getYearExtent(data1, data2) {
    let d1max = Number.MIN_VALUE;
    let d1min = Number.MAX_VALUE;
    let d2max = Number.MIN_VALUE;
    let d2min = Number.MAX_VALUE;
    Object.keys(data1[0]).forEach((key) => {
      if (+key < d1min) d1min = +key;
      if (+key > d1max) d1max = +key;
    });
    Object.keys(data2[0]).forEach((key) => {
      if (+key < d2min) d2min = +key;
      if (+key > d2max) d2max = +key;
    });
    return [Math.max(d1min, d2min), Math.min(d1max, d2max)];
  }

  getPastFutureLineData(country) {
    const xDataOfCountry = this.xData.find((row) => row.country === country);
    const yDataOfCountry = this.yData.find((row) => row.country === country);
    let finalData = [];
    if (xDataOfCountry !== undefined && yDataOfCountry !== undefined) {
      for (let curYear = this.yearmin; curYear <= this.yearmax; curYear++) {
        finalData.push({
          xval: xDataOfCountry[curYear],
          yval: yDataOfCountry[curYear],
        });
      }
      return finalData;
    }
  }

  renderYearText() {
    const YearFontSize = 300;

    // Removing any existing year text
    d3.selectAll("#year-text").remove();

    // Adding a scale to map mouse to the year
    // let yearTextLeftEdge = svgInnerWidth - margin.left - 150 - YearFontSize/2;
    // let yearTextRightEdge = svgInnerWidth - margin.left + 100 + YearFontSize/2;
    // const yearScrubScale = d3.scaleLinear().domain([yearTextLeftEdge, yearTextRightEdge]).range([yearmin, yearmax])

    // Adding year text
    this.svg
      .append("text")
      .style("pointer-events", "none")
      .attr("id", "year-text")
      // .style("cursor", "ew-resize")
      .style("fill", "#0b64c9")
      .attr("text-anchor", "middle")
      .attr("font-size", YearFontSize + "px")
      .attr("font-family", "serif")
      .attr("x", this.svgInnerWidth - this.margin.left - 40)
      .attr("y", this.svgInnerHeight - this.margin.top + 35)
      .attr("opacity", 0.2)
      // .on("mouseover", () => d3.select("#year-text").attr("opacity", 0.4))
      // .on("mousemove", (event) => {
      //   [x,y] = d3.pointer(event);
      //   document.getElementById("year-slider").value = yearScrubScale(x);
      //   updatePlot();
      // })
      // .on("mouseout", () => d3.select("#year-text").attr("opacity", 0.2))
      .text(this.year);
  }

  // Rendering the graph (Scatter plot)
  renderViz = () => {
    this.xData = this.dataMap[this.xAxisValue];
    this.yData = this.dataMap[this.yAxisValue];
    const countryFontSize = 100;

    // Getting the extents of the year comparing both X and Y data
    [this.yearmin, this.yearmax] = this.getYearExtent(this.xData, this.yData);

    // updating the slider
    document.getElementById("year-slider").setAttribute("min", this.yearmin);
    document.getElementById("year-slider").setAttribute("max", this.yearmax);
    document.getElementById("year-slider").value = this.yearmin;

    // Getting the current year value
    this.year = document.getElementById("year-slider").value;

    //Adding the year min and max text
    d3.select("#year-min-text").append("h1").html(this.yearmin);
    d3.select("#year-max-text").append("h1").html(this.yearmax);

    //defining initial scales except colorScale
    this.xScale = d3
      .scaleLinear()
      .domain(this.getExtentsOfData(this.xData))
      .range([this.margin.left + 70, this.svgWidth + this.margin.right - 30]);
    this.yScale = d3
      .scaleLinear()
      .domain(this.getExtentsOfData(this.yData))
      .range([
        this.svgInnerHeight - this.margin.bottom - 60,
        this.margin.top + 50,
      ]);

    // Writing the heading
    d3.select("#heading")
      .append("h1")
      .html(
        `Visualization comparing ${this.xAxisValue} and ${this.yAxisValue}`
      );

    // Drawing circles
    this.svg
      .append("g")
      .attr("id", "datapoints")
      .attr(
        "transform",
        `translate(${-this.margin.left - 20}, ${this.margin.top})`
      )
      .selectAll("circle")
      .data(this.newContries, (d) => d.geo)
      .enter()
      .append("circle")
      .style("pointer-events", "all")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("cursor", "pointer")
      .attr("id", (d) => d.name.replaceAll(" ", "-"))
      .attr("class", (d) => d["World bank region"])
      .attr("cx", (d) =>
        this.xScale(
          this.xData.find((row) => row.country === d.name) === undefined
            ? undefined
            : this.xData.find((row) => row.country === d.name)[this.year] === ""
            ? undefined
            : this.xData.find((row) => row.country === d.name)[this.year]
        )
      )
      .attr("cy", (d) =>
        this.yScale(
          this.yData.find((row) => row.country === d.name) === undefined
            ? undefined
            : this.yData.find((row) => row.country === d.name)[this.year] === ""
            ? undefined
            : this.yData.find((row) => row.country === d.name)[this.year]
        )
      )
      .attr("r", this.radius)
      .attr("fill", (d) => this.colorScale(d["World bank region"]))
      .on("mouseover", (_, d) => {
        // Adding huge text of country name
        this.svg
          .append("text")
          .attr("id", "country-name-huge-text")
          .style("pointer-events", "none")
          .attr("fill", this.colorScale(d["World bank region"]))
          .attr("text-anchor", "start")
          .attr("font-size", countryFontSize + "px")
          .attr("font-family", "serif")
          .attr("x", this.svgInnerWidth - this.margin.left * 11 - 40)
          .attr("y", this.margin.top * 3 + 50)
          .attr("opacity", 0.7)
          .text(d.name.replaceAll("-", " "));

        // Lowering the opacity of all other circles and geo text except the one hovered on
        d3.select("#datapoints").selectAll("*").attr("opacity", 0.1);
        d3.select("#geotext").selectAll("*").transition().attr("opacity", 0);
        d3.select(`#${d.geo}-text`).transition().attr("opacity", 0.8);
        // Adding a little zoom in effect to the circles when hovered on
        d3.select(`#${d.name}`)
          .attr("opacity", 1)
          .transition()
          .duration(this.transitionDuration)
          .attr("r", this.radius + 10);

        // Drawing the past to future line
        const lineGenerator = d3
          .line()
          .x((d) => this.xScale(d.xval === undefined ? 0 : d.xval))
          .y((d) => this.yScale(d.yval === undefined ? 0 : d.yval));

        this.svg
          .append("path")
          .attr(
            "transform",
            `translate(${-this.margin.left - 20}, ${this.margin.top})`
          )
          .attr("id", "past-future-line")
          .attr("d", lineGenerator(this.getPastFutureLineData(d.name)));

        // Pausing the animation on hovering over circle
        if (!this.pauseFlag && this.playPauseFlag) {
          this.pauseFlag = true;
          clearTimeout(this.slidertimeout);
          this.playPauseFlag = false;
          document.getElementById("play/pause").className = "fa fa-play fa-2x";
        }
      })
      .on("click", (_, d) => {
        // Rendering the tooltip
        const tooltip = this.svg
          .append("g")
          .attr("id", "tooltip")
          .style("pointer-events", "none")
          .style("fill", "#0b64c9")
          .attr("text-anchor", "start")
          .attr("font-size", countryFontSize - 70 + "px")
          .attr("font-family", "serif")
          .attr("opacity", 0);

        tooltip
          .append("text")
          .attr("x", this.svgInnerWidth - this.margin.left * 11 - 30)
          .attr("y", this.margin.top * 3 + 100)
          .text(
            `${this.xAxisValue}: ${
              this.xData.find((row) => row.country === d.name)[this.year]
            }`
          );
        tooltip
          .append("text")
          .attr("x", this.svgInnerWidth - this.margin.left * 11 - 30)
          .attr("y", this.margin.top * 3 + 140)
          .text(
            `${this.yAxisValue}: ${
              this.yData.find((row) => row.country === d.name)[this.year]
            }`
          );

        tooltip.transition().attr("opacity", 0.6);
      })
      .on("mouseout", (_, d) => {
        d3.selectAll("#country-name-huge-text").remove();
        d3.select("#viz-container").selectAll("#tooltip").remove();
        d3.select("#datapoints").selectAll("*").attr("opacity", 1);
        d3.select("#geotext")
          .selectAll("text")
          .data(this.newContries, (d) => `${d.geo}-id`)
          .transition()
          .attr("opacity", 0.6);
        d3.select(`#${d.name}`)
          .transition()
          .duration(this.transitionDuration)
          .attr("r", this.radius);
        d3.selectAll("#past-future-line").remove();
        // If the animations are paused because of the mouse hover the resume it on mouseout
        if (this.pauseFlag && !this.playPauseFlag) {
          this.pauseFlag = false;
          document.getElementById("play/pause").className = "fa fa-pause fa-2x";
          this.playPauseFlag = true;
          this.animation();
        }
      });

    // Adding geo locations in the center of the text
    this.svg
      .append("g")
      .attr("id", "geotext")
      .attr(
        "transform",
        `translate(${-this.margin.left - 20}, ${this.margin.top + 6})`
      )
      .selectAll("text")
      .data(this.newContries, (d) => `${d.geo}-id`)
      .enter()
      .append("text")
      .attr("id", (d) => `${d.geo}-text`)
      .style("pointer-events", "none")
      .style("text-anchor", "middle")
      .style("font-size", 16 + "px")
      .style("font-family", "serif")
      .attr("opacity", 0.6)
      .attr("x", (d) =>
        this.xScale(
          this.xData.find((row) => row.country === d.name) === undefined
            ? undefined
            : this.xData.find((row) => row.country === d.name)[this.year] === ""
            ? undefined
            : this.xData.find((row) => row.country === d.name)[this.year]
        )
      )
      .attr("y", (d) =>
        this.yScale(
          this.yData.find((row) => row.country === d.name) === undefined
            ? undefined
            : this.yData.find((row) => row.country === d.name)[this.year] === ""
            ? undefined
            : this.yData.find((row) => row.country === d.name)[this.year]
        )
      )
      .text((d) => d.geo.toUpperCase());

    // Adding the huge year text
    this.renderYearText();

    // Logic for replacing G with B in the axis
    const GToBFormat = d3.format(".2s");
    const TickFormat = (num) => GToBFormat(num).replace("G", "B");

    // Adding axes
    const xAxis = d3
      .axisBottom(this.xScale)
      .tickFormat(TickFormat)
      .tickSize(-this.svgInnerHeight + this.margin.top * 3 + 10);
    const yAxis = d3
      .axisLeft(this.yScale)
      .tickFormat(TickFormat)
      .tickSize(-this.svgInnerWidth - this.margin.left - 30);

    this.svg
      .append("g")
      .attr(
        "transform",
        `translate(${-this.margin.left - 30}, ${
          this.svgInnerHeight - this.margin.bottom + 45
        })`
      )
      .call(xAxis)
      .attr("class", "x-axis")
      .attr("z-index", -1)
      .attr("font-family", "serif")
      .attr("font-size", 14)
      .attr("font-weight", "bold")
      .attr("stroke-dasharray", "2,10")
      .attr("opacity", 0.5);

    this.svg
      .append("g")
      .attr("transform", `translate(40, ${this.margin.top})`)
      .call(yAxis)
      .attr("class", "y-axis")
      .attr("z-index", -1)
      .attr("font-family", "serif")
      .attr("font-size", 14)
      .attr("font-weight", "bold")
      .attr("stroke-dasharray", "2,10")
      .attr("opacity", 0.5);

    // Removing domains of both the axes
    d3.select(".x-axis").select(".domain").remove();
    d3.select(".y-axis").select(".domain").remove();

    // Adding legend
    const topOffset = 180;
    const leftOffset = 70;
    const legend = this.svg.append("g").attr("id", "legend");

    const renderLegendContents = () => {
      const legendContents = legend
        .append("g")
        .attr("id", "legend-contents")
        .attr("opacity", 1);

      legendContents
        .append("rect")
        .attr("opacity", 1)
        .attr("fill", "white")
        .attr("x", this.svgInnerWidth - this.margin.right)
        .attr("y", this.margin.top + topOffset - 10)
        .attr("rx", 10)
        .attr("width", 290)
        .attr("height", 150);

      legendContents
        .append("g")
        .attr("id", "south-asia")
        .append("circle")
        .style("pointer-events", "none")
        .attr("cx", this.svgInnerWidth - leftOffset)
        .attr("cy", this.margin.top + topOffset)
        .attr("fill", this.colorScale("South-Asia"))
        .transition()
        .duration(this.transitionDuration)
        .attr("r", 8);
      d3.select("#south-asia")
        .append("text")
        .style("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-family", "serif")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("x", this.svgInnerWidth - 10)
        .attr("y", this.margin.top + topOffset)
        .style("fill", this.colorScale("South-Asia"))
        .transition()
        .duration(this.transitionDuration)
        .attr("y", this.margin.top + topOffset + 5)
        .text("South Asia");

      legendContents
        .append("g")
        .attr("id", "europe-central-asia")
        .append("circle")
        .style("pointer-events", "none")
        .attr("cx", this.svgInnerWidth - leftOffset)
        .attr("cy", this.margin.top + topOffset + 20)
        .attr("fill", this.colorScale("Europe-&-Central-Asia"))
        .transition()
        .duration(this.transitionDuration)
        .attr("r", 8);
      d3.select("#europe-central-asia")
        .append("text")
        .style("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-family", "serif")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("x", this.svgInnerWidth + 35)
        .attr("y", this.margin.top + topOffset)
        .style("fill", this.colorScale("Europe-&-Central-Asia"))
        .transition()
        .duration(this.transitionDuration)
        .attr("y", this.margin.top + topOffset + 25)
        .text("Europe & Central Asia");

      legendContents
        .append("g")
        .attr("id", "middle-east-north-africa")
        .append("circle")
        .style("pointer-events", "none")
        .attr("cx", this.svgInnerWidth - leftOffset)
        .attr("cy", this.margin.top + topOffset + 40)
        .attr("fill", this.colorScale("Middle-East-&-North-Africa"))
        .transition()
        .duration(this.transitionDuration)
        .attr("r", 8);
      d3.select("#middle-east-north-africa")
        .append("text")
        .style("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-family", "serif")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("x", this.svgInnerWidth + 55)
        .attr("y", this.margin.top + topOffset)
        .style("fill", this.colorScale("Middle-East-&-North-Africa"))
        .transition()
        .duration(this.transitionDuration)
        .attr("y", this.margin.top + topOffset + 45)
        .text("Middle East & North Africa");

      legendContents
        .append("g")
        .attr("id", "sub-saharan-africa")
        .append("circle")
        .style("pointer-events", "none")
        .attr("cx", this.svgInnerWidth - leftOffset)
        .attr("cy", this.margin.top + topOffset + 60)
        .attr("fill", this.colorScale("Sub-Saharan-Africa"))
        .transition()
        .duration(this.transitionDuration)
        .attr("r", 8);
      d3.select("#sub-saharan-africa")
        .append("text")
        .style("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-family", "serif")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("x", this.svgInnerWidth + 28)
        .attr("y", this.margin.top + topOffset)
        .style("fill", this.colorScale("Sub-Saharan-Africa"))
        .transition()
        .duration(this.transitionDuration)
        .attr("y", this.margin.top + topOffset + 65)
        .text("Sub-Saharan Africa");

      legendContents
        .append("g")
        .attr("id", "latin-america-caribbean")
        .append("circle")
        .style("pointer-events", "none")
        .attr("cx", this.svgInnerWidth - leftOffset)
        .attr("cy", this.margin.top + topOffset + 80)
        .attr("fill", this.colorScale("Latin-America-&-Caribbean"))
        .transition()
        .duration(this.transitionDuration)
        .attr("r", 8);
      d3.select("#latin-america-caribbean")
        .append("text")
        .style("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-family", "serif")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("x", this.svgInnerWidth + 60)
        .attr("y", this.margin.top + topOffset)
        .style("fill", this.colorScale("Latin-America-&-Caribbean"))
        .transition()
        .duration(this.transitionDuration)
        .attr("y", this.margin.top + topOffset + 85)
        .text("Latin America & Caribbean");

      legendContents
        .append("g")
        .attr("id", "east-asia-pacific")
        .append("circle")
        .style("pointer-events", "none")
        .attr("cx", this.svgInnerWidth - leftOffset)
        .attr("cy", this.margin.top + topOffset + 100)
        .attr("fill", this.colorScale("East-Asia-&-Pacific"))
        .transition()
        .duration(this.transitionDuration)
        .attr("r", 8);
      d3.select("#east-asia-pacific")
        .append("text")
        .style("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-family", "serif")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("x", this.svgInnerWidth + 25)
        .attr("y", this.margin.top + topOffset)
        .style("fill", this.colorScale("East-Asia-&-Pacific"))
        .transition()
        .duration(this.transitionDuration)
        .attr("y", this.margin.top + topOffset + 105)
        .text("East Asia & Pacific");

      legendContents
        .append("g")
        .attr("id", "north-america")
        .append("circle")
        .style("pointer-events", "none")
        .attr("cx", this.svgInnerWidth - leftOffset)
        .attr("cy", this.margin.top + topOffset + 120)
        .attr("fill", this.colorScale("North-America"))
        .transition()
        .duration(this.transitionDuration)
        .attr("r", 8);
      d3.select("#north-america")
        .append("text")
        .style("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-family", "serif")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("x", this.svgInnerWidth + 10)
        .attr("y", this.margin.top + topOffset)
        .style("fill", this.colorScale("North-America"))
        .transition()
        .duration(this.transitionDuration)
        .attr("y", this.margin.top + topOffset + 125)
        .text("North America");
    };

    legend
      .append("g")
      .attr("id", "heading")
      .append("rect")
      .attr("id", "legend-rect")
      .style("cursor", "help")
      .attr("opacity", 1)
      .style("fill", "transparent")
      .attr("x", this.svgInnerWidth - 110)
      .attr("y", this.margin.top + 138)
      .attr("width", 305)
      .attr("height", 30)
      .attr("rx", 0)
      .on("mouseover", () => displayLegend())
      .on("mouseout", () => removeLegend());

    legend
      .append("text")
      .style("pointer-events", "none")
      .attr("id", "legend-text")
      .attr("text-anchor", "middle")
      .attr("font-family", "serif")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .style("fill", "black")
      .attr("x", this.svgInnerWidth + 50)
      .attr("y", this.margin.top + 160)
      .text("Regions");

    function displayLegend() {
      renderLegendContents();
      d3.select("#legend-rect")
        .transition()
        // .duration(this.transitionDuration)
        .attr("opacity", 1)
        .style("fill", "#0b64c9")
        .attr("rx", 20);
      d3.select("#legend-text").transition().style("fill", "#fafafa");
    }

    function removeLegend() {
      d3.selectAll("#legend-contents").transition().attr("opacity", 0).remove();
      d3.select("#legend-rect")
        .transition()
        .attr("opacity", 1)
        .style("fill", "transparent")
        .attr("rx", 0);
      d3.select("#legend-text").transition().style("fill", "black");
    }
  };

  render() {
    return (
      <React.Fragment>
        <div id="headings-container">
          <div id="heading"></div>
        </div>
        <div id="viz-and-y">
          <select id="y-axis-menu">
            <option value="Life Expectancy">Life Expectancy</option>
            <option value="Population">Population</option>
            <option value="Population Density">Population Density</option>
            <option value="GDP PerCapita">GDP PerCapita</option>
            <option value="Child Mortality Rate">Child Mortality Rate</option>
            <option value="Women Fertility Rate">Women Fertility Rate</option>
            <option value="Murders">Murders</option>
            <option value="CO2 Emissions">CO2 Emissions</option>
            <option value="Total Forest Area">Total Forest Area</option>
            <option value="Total Surface Area">Total Surface Area</option>
          </select>
          <div id="viz-container">
            <svg id="main-viz"></svg>
          </div>
        </div>
        <div id="x-and-regions-menu-container">
          <select id="x-axis-menu">
            <option value="Population">Population</option>
            <option value="Population Density">Population Density</option>
            <option value="Life Expectancy">Life Expectancy</option>
            <option value="GDP PerCapita">GDP PerCapita</option>
            <option value="Child Mortality Rate">Child Mortality Rate</option>
            <option value="Women Fertility Rate">Women Fertility Rate</option>
            <option value="Murders">Murders</option>
            <option value="CO2 Emissions">CO2 Emissions</option>
            <option value="Total Forest Area">Total Forest Area</option>
            <option value="Total Surface Area">Total Surface Area</option>
          </select>
          <select id="regions-menu">
            <option value="All-Countries">All Countries</option>
            <option value="South-Asia">South Asia</option>
            <option value="Europe-&-Central-Asia">
              Europe and Central Asia
            </option>
            <option value="Middle-East-&-North-Africa">
              Middle East and North Africa
            </option>
            <option value="Sub-Saharan-Africa">Sub Saharan Africa</option>
            <option value="Latin-America-&-Caribbean">
              Latin America and Caribbean
            </option>
            <option value="East-Asia-&-Pacific">East Asia and Pacific</option>
            <option value="North-America">North America</option>
          </select>
        </div>
        <div id="animation-container">
          <div id="play-button">
            <i
              id="play/pause"
              className="fa fa-play fa-2x"
              style={{ color: "white" }}
            ></i>
          </div>
          <div id="year-min-text"></div>
          <input
            type="range"
            min="0"
            max="0"
            step="1"
            defaultValue="0"
            id="year-slider"
            onMouseDown={() =>
              (document.getElementById("year-slider").style.cursor = "grabbing")
            }
            onMouseUp={() =>
              (document.getElementById("year-slider").style.cursor = "grab")
            }
          />
          <div id="year-max-text"></div>
          <div id="speed-select">
            <input type="radio" name="switch-two" id="1X" defaultChecked />
            <label htmlFor="1X">1X</label>
            <input type="radio" name="switch-two" id="2X" />
            <label htmlFor="2X">2X</label>
            <input type="radio" name="switch-two" id="3X" />
            <label htmlFor="3X">3X</label>
            <input type="radio" name="switch-two" id="4X" />
            <label htmlFor="4X">4X</label>
          </div>
        </div>
        <div id="footer">
          <a
            href="https://github.com/SumanthVarma798"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h1>By Sumanth Varma Vitrouthu</h1>
          </a>
        </div>
      </React.Fragment>
    );
  }
}

export default MainViz;
