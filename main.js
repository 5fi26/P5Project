var margin = {top: 50, right: 25, bottom: 25, left: 25};
var width = 1450 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(.5);

var line = d3.line(),
    unselected,
    selected,
    extents;

var y = {},drag = {};
var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("colleges.csv", function(error, data) {
    if (error) {
      console.log("error reading csv.");
    }

    dimensions = ["Admission Rate",
    "Average Cost", "Median Debt", "Median Debt on Withdrawal",
    "Average Family Income", "Median Family Income", "Expenditure Per Student" , "% Federal Loans"];

    x.domain(dimensions);

  dimensions.forEach(function(d) {
    //gets all the values from dimensions
    var value = data.map(function(p) {
      return p[d];
    });

    if (value.every(function(v) {
      return (parseFloat(v) == v)
    }) ) {
        y[d] = d3.scaleLinear()
        .domain(d3.extent(data, function(p) {
            return +p[d];
        }))
        .range([height, 0])
    }
  })

  unselected = svg.append("g")
    .attr("class", "unselected")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", mapData);

  //data in the form colleges: college
  //return {colleges: d.Name}
  //var col2data = data.map(function(d) { return {colleges: d.Name} });

  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")




  selected = svg.append("g")
    .attr("class", "selected")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", mapData)
    .on("mouseover", function(d) {
      tooltip
        .style("display", "inline-block")
        .html((d.Name));
      addNameOfCircle(d);
    });

  var g = svg.selectAll(".data")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("transform", function(d) {  return "translate(" + x(d) + ")"; })

  // Add axis
  g.append("g")
      .attr("class", "axis")
      .each(function(d) {
        d3.select(this).call(d3.axisLeft(y[d]));
      })
      .append("text")
      .attr("fill", "black")
      .attr("y", -20)
      .style("text-anchor", "middle")
      .text(function(d) { return d; });

  extents = dimensions.map(function(p) {
    return [0,0];
  });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.brushY()
        .extent([[-3, 3], [9, height]])
        .on("start", start)
        .on("brush", brushing)
        .on("brush", brushchart));
      })
});

function brushing() {
  d3.event.sourceEvent.stopPropagation();
}

function addNameOfCircle(d) {

  document.getElementById("white").innerHTML = d["% White"]
  document.getElementById("black").innerHTML = d["% Black"]
  document.getElementById("hispanic").innerHTML = d["% Hispanic"]
  document.getElementById("asian").innerHTML = d["% Asian"]
  document.getElementById("indian").innerHTML = d["% American Indian"]
  document.getElementById("pacific").innerHTML = d["% Pacific Islander"]
  document.getElementById("biracial").innerHTML = d["% Biracial"]


}

function start(d) {
  selected.style("display", "none")
  var index = dimensions.indexOf(d);
  extents[index] = [0,0];

  selected.style("display", function(d) {
    return dimensions.every(function(p, i) {
        if(extents[i][0] == 0 && extents[i][0] == 0) {
            return true;
        }
      return extents[i][1] <= d[p] && d[p] <= extents[i][0];
    }) ? null : "none";
  });
}

function position(d) {
  if (drag[d] == null) {
    return x(d);
  }
  else return v;
}

function mapData(d) {
  return line(dimensions.map(function(p) {
    return [ position(p), y[p](d[p]) ];
  }));
}

//Brush data
function brushchart() {
    for(var i = 0; i < dimensions.length; i++){
        if(d3.event.target == y[ dimensions[i] ].brush) {
            extents[i] = d3.event.selection
              .map(y[ dimensions[i] ]
              .invert, y[ dimensions[i] ]);
        }
    }
  selected.style("display", function(d) {
    return dimensions.every(function(p, i) {
      if(extents[i][0] == 0) {
          return true;
      }
      return extents[i][1] <= d[p] && d[p] <= extents[i][0];
    }) ? null : "none";
  });
}
