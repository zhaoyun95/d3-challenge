var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
}

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.

var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var xAxisLabels = ["poverty", "age", "income"];
var yAxisLabels = ["obesity", "smokes", "healthcare"];

// Initial Params
var chosenXAxis = xAxisLabels[0];
var chosenYAxis = yAxisLabels[0];

console.log(chosenXAxis);
console.log(chosenYAxis);

// function used for updating x-scale var upon click on x-axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9, d3.max(censusData, d => d[chosenXAxis]) * 1.1])
      .range([0, width]);
    
    return xLinearScale;
}

// function used for updating y-scale var upon click on y-axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.9, d3.max(censusData, d => d[chosenYAxis]) * 1.1])
    .range([height, 0]);
  
  return yLinearScale;
}

// function used for updating xAxis var upon click on xAxis label
function renderXAxes(newXScale, xAxis) {
    console.log("in renderXAxes()")
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    
    return xAxis;
}

// function used for updating yAxis var upon click on yAxis label
function renderYAxes(newYScale, yAxis) {
  console.log("in renderYAxes()")
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  return yAxis;
}


// function used for updating circles group with a transition to 
// new circles due to X value changes
function renderCirclesX(circlesGroup, textsGroup, newXScale, choenXAxis) {
    console.log("in renderCirclesX()");
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[choenXAxis]));

    textsGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]) - 8);

    return circlesGroup;
}

// function used for updating circles group with a transition to 
// new circles due to Y value changes
function renderCirclesY(circlesGroup, textsGroup, newYScale, choenYAxis) {
  console.log("in renderCirclesY()");
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[choenYAxis]));

  textsGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[choenYAxis]) + 4);

  return circlesGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    console.log("in updateToolTip()")

    var toolTip = d3.tip()  // d3.tip() needs special library in index.html
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
          var xLabel = chosenXAxis;
          var yLabel = chosenYAxis;
          if (chosenYAxis == yAxisLabels[2]) {
            yLabel = `Lacks Healthcare`;
          };
      
          var xValue = d[chosenXAxis];
          var yValue = `${d[chosenYAxis]}%`;
          if (chosenXAxis ==  xAxisLabels[2] ) {
            // currency format for income
            xValue = `$ ${xValue.toLocaleString('en-US')}`; 
          } else if (chosenXAxis == xAxisLabels[0]) {
            xValue = `${xValue}%`;  // poverty needs % at the end
          }
          return (`${d.state}<br>${xLabel}: ${xValue}<br>${yLabel}: ${yValue}`);
      });


    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d);
        // show border
        d3.select(this).attr("stroke", "black");
      })
      // onmouseout event
      .on("mouseout", function(d) {
          toolTip.hide(d);
          // hide border
          d3.select(this).attr("stroke", "");
      });

    return circlesGroup;
}


// generate random color rgb(red,green,blue) 
function getColor() {
  var num1 = Math.floor(Math.random() * 256);
  var num2 = Math.floor(Math.random() * 256);
  var num3 = Math.floor(Math.random() * 256);
  var color = `rgb(${num1}, ${num2}, ${num3})`;

  return color;
}

d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
    console.log(censusData);

    // parse data
    censusData.forEach(function(data){
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    })

    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // create y scale function
    var yLinearScale = yScale(censusData, chosenYAxis);

    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      // .attr("transform", `translate(${margin.left}, 0)`)
      .call(leftAxis);

  
    // define the data for the circles
    var elem = chartGroup.selectAll("g circleAndText")
      .data(censusData);

    // create and place the "blocks" containing the circle and the text
    var elemEnter = elem.enter()
      .append("g")
      .classed("circleAndText", true);
     
    // create the text for each block, before circles
    elemEnter.append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]) - 8)
      .attr("y", d => yLinearScale(d[chosenYAxis]) + 4)
      .text(d => d.abbr);

    // create the circle for each block, on top of stateText
    elemEnter.append("circle")
      .attr("r", 15)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("fill", d => getColor())
      .attr("stroke","white")
      .attr("opacity", ".5"); // set 0.5 opacity so that we can see stateText behind it.


    var circlesGroup = elemEnter.selectAll("circle");
    var textsGroup = elemEnter.selectAll("text")

    // Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    // Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(0, ${height / 2})`);

    // X Axis Labels
    var xPovertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", `${xAxisLabels[0]}`) // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var xAgeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", `${xAxisLabels[1]}`) // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var xIncomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", `${xAxisLabels[2]}`) // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Y Axis Labels
    var yObeseLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", 0 - margin.left)
      .attr("dy", "1em")
      .attr("value", `${yAxisLabels[0]}`) // value to grab for event listener
      .classed("active", true)
      .classed("axis-text", true)
      .text("Obese (%)");

    var ySmokesLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", 0 - margin.left + 45)
      .attr("value", `${yAxisLabels[1]}`) // value to grab for event listener
      .classed("inactive", true)
      .classed("axis-text", true)
      .text("Smokes (%)");
    
    var yHealthcareLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", 0 - margin.left + 55)
      .attr("dy", "1em")
      .attr("value", `${yAxisLabels[2]}`) // value to grab for event listener
      .classed("inactive", true)
      .classed("axis-text", true)
      .text("Lacks Healthcare (%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
          // replaces chosenXAxis with value
          chosenXAxis = value;
          console.log(`pick: ${chosenXAxis}`);

          // functions here found above csv import
          // update x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);

          // update x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCirclesX(circlesGroup, textsGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // change classes to change bold text
          if (chosenXAxis == xAxisLabels[0]) {
            xPovertyLabel
              .classed("active", true)
              .classed("inactive", false);
            xAgeLabel
              .classed("active", false)
              .classed("inactive", true);
            xIncomeLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenXAxis == xAxisLabels[1]) {
            xPovertyLabel
              .classed("active", false)
              .classed("inactive", true);
            xAgeLabel
              .classed("active", true)
              .classed("inactive", false);
            xIncomeLabel
              .classed("active", false)
              .classed("inactive", true);
          } else {
            xPovertyLabel
              .classed("active", false)
              .classed("inactive", true);
            xAgeLabel
              .classed("active", false)
              .classed("inactive", true);
            xIncomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
          chosenYAxis = value;
          console.log(`pick: ${chosenYAxis}`);

          yLinearScale = yScale(censusData, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);

          // update circles with new y values
          circlesGroup = renderCirclesY(circlesGroup, textsGroup, yLinearScale, chosenYAxis);

          // update tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          if (chosenYAxis == yAxisLabels[0]) {
            yObeseLabel
              .classed("active", true)
              .classed("inactive", false)
            ySmokesLabel
              .classed("active", false)
              .classed("inactive", true)
            yHealthcareLabel
              .classed("active", false)
              .classed("inactive", true)
          } else if  (chosenYAxis == yAxisLabels[1]) {
            yObeseLabel
              .classed("active", false)
              .classed("inactive", true)
            ySmokesLabel
              .classed("active", true)
              .classed("inactive", false)
            yHealthcareLabel
              .classed("active", false)
              .classed("inactive", true)
          } else {
            yObeseLabel
              .classed("active", false)
              .classed("inactive", true)
            ySmokesLabel
              .classed("active", false)
              .classed("inactive", true)
            yHealthcareLabel
              .classed("active", true)
              .classed("inactive", false)
          }
        }
      });
}).catch(function(error) {
    console.log(error);
});