var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group and move everything over by the margin amounts
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Intial Parameters for x and y axis
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(healthData, d => d[chosenYAxis])])
      .range([height, 0]);
  
    return yLinearScale;
  
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  
  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr('transform', d => `translate(${newXScale(d[chosenXAxis])},${newYScale(d[chosenYAxis])})`);
  

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xlabel = "In Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age (Median):"
  }
  else if (chosenXAxis === "income") {
    xlabel = "Household Income (Median):";
  }
  else {
    xlabel = "Household Income (Median):";
  }

  if (chosenYAxis === "obesity") {
    ylabel = "% Obese:";
  }
  else if (chosenYAxis === "smokes") {
    ylabel = "% Smokes:"
  }
  else if (chosenYAxis === "healthcare") {
    ylabel = "Lacks Healthcare (%):";
  }
  else {
    ylabel = "Lacks Healthcare (%):";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}
// function yScale(healthData, chosenYAxis) {
//     // create scales
//     var yLinearScale = d3.scaleLinear()
//       .domain([0, d3.max(healthData, d => d[chosenYAxis])])
//       .range([height, 0]);
  
//     return yLinearScale;
  
// }
/* Load data from data.csv and use d3.autoType to automatically cast all 
strings to numbers in one shot */
d3.csv("data.csv").then(function(healthData, err) {
  if (err) throw err;
  

  // Parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .classed("circle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "#89bdd3")
    .attr("opacity", ".9")
    .append('text')
    .classed('circleText', true)
    .attr('dy', '0.35em')
    .attr('dx', -6)
    .attr("fill", "white")
    .text(d => d.abbr);

  // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`); 
    
  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for  3 y- axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `rotate(-90 ${(margin.left/2)} ${(height/2)-60})`)
    .attr("dy", "1em")
    .classed("axis-text", true);


  var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");



  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});


  
//   }
// /* Load data from data.csv and use d3.autoType to automatically cast all 
// strings to numbers in one shot */
// d3.csv("healthData.csv", d3.autoType).then(function(demoData, err) {
//   if (err) throw err;
//     console.log(demoData);

//   // xLinearScale function above csv import
//   var xLinearScale = xScale(demoData, chosenXAxis);

//   // Create y scale function
//   var yLinearScale = yScale(demoData, chosenYAxis);

//   // Create initial axis functions
//   var bottomAxis = d3.axisBottom(xLinearScale);
//   var leftAxis = d3.axisLeft(yLinearScale);

//   // append x axis
//   var xAxis = chartGroup.append("g")
//     .classed("x-axis", true)
//     .attr("transform", `translate(0, ${height})`)
//     .call(bottomAxis);

//   // append y axis
//   var yAxis = chartGroup.append("g")
//     .call(leftAxis);

//   // append initial circles
//   var circlesGroup = chartGroup
//     .append("g")
//     .selectAll("circle")
//     .data(demoData)
//     .enter()
//     .append("g")
//     .classed("circle", true)
//     .attr('transform', d => `translate(${xLinearScale(d[chosenXAxis])},${yLinearScale(d[chosenYAxis])})`);

//   circlesGroup
//     .append("circle")
//     .attr("r", "10")
//     .attr("fill", "#89bdd3")
//     .attr("opacity", ".9");

//   circlesGroup
//     .append('text')
//     .classed('circleText', true)
//     .attr('dy', '0.35em')
//     .attr('dx', -6)
//     .attr("fill", "white")
//     .text(d => d.abbr);

// [1.19] PART BELOW HAS BEEN ADDED ABOVE [1.19]

//   // Create group for  3 x- axis labels
//   var xlabelsGroup = chartGroup.append("g")
//     .attr("transform", `translate(${width / 2}, ${height + 20})`);

//   var povertyLabel = xlabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 20)
//     .attr("value", "poverty") // value to grab for event listener
//     .classed("active", true)
//     .text("In Poverty (%)");

//   var ageLabel = xlabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 40)
//     .attr("value", "age") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Age (Median)");

//   var incomeLabel = xlabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 60)
//     .attr("value", "income") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Household Income (Median)");

//   // Create group for  3 y- axis labels
//   var ylabelsGroup = chartGroup.append("g")
//     .attr("transform", `rotate(-90 ${(margin.left/2)} ${(height/2)-60})`)
//     .attr("dy", "1em")
//     .classed("axis-text", true);

//   var obesityLabel = ylabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 0)
//     .attr("value", "obesity") // value to grab for event listener
//     .classed("active", true)
//     .text("Obese (%)")
//     .classed("axis-text", true);

//   var smokesLabel = ylabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 20)
//     .attr("value", "smokes") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Smokes (%)");

//   var healthcareLabel = ylabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 40)
//     .attr("value", "healthcare") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Lacks Healthcare (%)");


//   // updateToolTip function above csv import
//   var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

//   // x axis labels event listener
//   xlabelsGroup.selectAll("text")
//     .on("click", function() {
//       // get value of selection
//       var value = d3.select(this).attr("value");
//       if (value !== chosenXAxis) {

//         // replaces chosenXAxis with value
//         chosenXAxis = value;

//         // console.log(chosenXAxis)

//         // functions here found above csv import
//         // updates x scale for new data
//         xLinearScale = xScale(demoData, chosenXAxis);

//         // updates x axis with transition
//         xAxis = renderXAxes(xLinearScale, xAxis);

//         // updates circles with new x values
//         circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

//         // updates tooltips with new info
//         circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

//         // changes classes to change bold text
//         if (chosenXAxis === "poverty") {
//           povertyLabel
//             .classed("active", true)
//             .classed("inactive", false);
//           ageLabel
//             .classed("active", false)
//             .classed("inactive", true);
//           incomeLabel
//             .classed("active", false)
//             .classed("inactive", true);
//         }
//         else if (chosenXAxis === "age") {
//             povertyLabel
//               .classed("active", false)
//               .classed("inactive", true);
//             ageLabel
//               .classed("active", true)
//               .classed("inactive", false);
//             incomeLabel
//               .classed("active", false)
//               .classed("inactive", true);
//           }
//         else {
//             povertyLabel
//               .classed("active", false)
//               .classed("inactive", true);
//             ageLabel
//               .classed("active", false)
//               .classed("inactive", true);
//             incomeLabel
//               .classed("active", true)
//               .classed("inactive", false);
//         }
//       }
//     });

// // y axis labels event listener
// ylabelsGroup.selectAll("text")
// .on("click", function() {
//   // get value of selection
//   var value = d3.select(this).attr("value");
//   if (value !== chosenYAxis) {

//     // replaces chosenXAxis with value
//     chosenYAxis = value;

//     console.log(chosenYAxis)

//     // functions here found above csv import
//     // updates x scale for new data
//     yLinearScale = yScale(demoData, chosenYAxis);

//     // updates y axis with transition
//     yAxis = renderYAxes(yLinearScale, yAxis);

//     // updates circles with new x values
//     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

//     // updates tooltips with new info
//     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

//     // changes classes to change bold text
//     if (chosenYAxis === "obesity") {
//       obesityLabel
//         .classed("active", true)
//         .classed("inactive", false);
//       smokesLabel
//         .classed("active", false)
//         .classed("inactive", true);
//       healthcareLabel
//         .classed("active", false)
//         .classed("inactive", true);
//     }
//     else if (chosenYAxis === "smokes") {
//         obesityLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         smokesLabel
//           .classed("active", true)
//           .classed("inactive", false);
//           healthcareLabel
//           .classed("active", false)
//           .classed("inactive", true);
//       }
//     else {
//         obesityLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         smokesLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         healthcareLabel
//           .classed("active", true)
//           .classed("inactive", false);
//     }
//   }
// });
// }).catch(function(error) {
//   console.log(error);
// });
