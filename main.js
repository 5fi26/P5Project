var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 1450 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(.5),
    y = {},
    drag = {};

var line = d3.line(),
    unselected,
    selected,
    extents;

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("colleges1.csv", function(error, data) {
    if (error) {
      console.log("error reading csv.");
    }
    dimensions = d3.keys(data[0]);
    x.domain(dimensions);

  dimensions.forEach(function(d) {  
    var value = data.map(function(p) {
      console.log(p[d]);
      return p[d];
    }); 

    if (value.every(function(v) {
      return (parseFloat(v) == v)
    })) { 
     y[d] = d3.scaleLinear()
        .domain(d3.extent(data, function(p) { 
            return +p[d]; 
        }))
        .range([height, 0])
    }
    else  {           
      y[d] = d3.scalePoint()
          .domain(value.filter(function(v, i) {
            return value.indexOf(v) == i;
          }))
          .range([height, 0].padding(2));
    }
  })

  extents = dimensions.map(function(p) { 
    return [0,0]; 
  });


  unselected = svg.append("g")
    .attr("class", "unselected")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path);

  selected = svg.append("g")
    .attr("class", "selected")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path);

  var g = svg.selectAll(".data")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("transform", function(d) {  return "translate(" + x(d) + ")"; })
 
  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) {  
        d3.select(this).call(d3.axisLeft(y[d]));
      })
      .append("text")
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .attr("y", -20) 
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.brushY()
        .extent([[-3, 3], [9, height]])
        .on("brush", brushchart));
      })
});

function clearSelected() {
}

function position(d) {
  if (drag[d] == null) {
    return x(d);
  }
  else return v;
}

function path(d) {
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