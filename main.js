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

d3.csv("colleges.csv", function(error, data) {
    if (error) {
      console.log("error reading csv.");
    }
    //d3.keys(data[0]) gives the categories.
    //data[0] gives the first of every category.

    dimensions = ["Admission Rate", 
    "Average Cost", "Median Debt", "Median Debt on Withdrawal", 
    "Average Family Income", "Median Family Income", "Expenditure Per Student" , "% Federal Loans"];
    
    x.domain(dimensions);

  dimensions.forEach(function(d) {  
    var value = data.map(function(p) {
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
    .attr("d", mapData);

  //data in the form colleges: college
  //return {colleges: d.Name}
  //var col2data = data.map(function(d) { return {colleges: d.Name} });

  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

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
    });

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
        .on("start", brushstart)
        .on("brush", gobrush)
        .on("brush", brushchart));
      })
});

function brushstart(selectionName) {
  selected.style("display", "none")
  
  var dimensionsIndex = dimensions.indexOf(selectionName);

  extents[dimensionsIndex] = [0, 0];

  selected.style("display", function(d) {
    return dimensions.every(function(p, i) {
        if(extents[i][0]==0 && extents[i][0]==0) {
            return true;
        }
      return extents[i][1] <= d[p] && d[p] <= extents[i][0];
    }) ? null : "none";
  });
}

function gobrush() {
  d3.event.sourceEvent.stopPropagation();
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
            console.log(y[dimensions[i]].Name);
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