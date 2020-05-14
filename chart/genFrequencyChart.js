function drawRain() {
  function change_1() {
  	var form_1 = document.getElementById("dimensions");
    var form_val;
    for(var i=0; i<form_1.length; i++){
      if(form_1[i].checked){
        form_val = form_1[i].id;
      }
    }
    var datasets = ['./earth_database.csv', './Tsunamis.csv', './volcano_eruption_info_details.csv'];
    var dataset;
    if (form_val == 'Earthquake') {
      drawData('./earth_database.csv');
    } else if (form_val == 'Tsunami') {
      drawData('./Tsunamis.csv');
    } else {
      drawData('./volcano_eruption_info_details.csv');
    }
    changeIt();
  }
  var buttons = d3.selectAll('#dimensions');
  buttons.on('change', change_1);
}

function drawData(dataset) {
  d3.selectAll("#svg_chart").remove();
  d3.csv(dataset, function(error, data) {

    var margin = {top: 20, right: 50, bottom: 30, left: 50},
        width = 630 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(5)
        .innerTickSize(15)
        .outerTickSize(0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(5)
        .innerTickSize(15)
        .outerTickSize(0)
        .orient("left");

    var svg = d3.select("#charts_div").append("svg:svg")
        .attr('id', 'svg_chart')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", '#0A0C0E')
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var yearData = [];

    // [{"year":1900, "value": 20}]

    for (var i=0; i<data.length; i++) {
      var flag = 0;
      for (var j=0; j<yearData.length; j++) {
        if (data[i]['Year']==yearData[j]['year']) {
          yearData[j]['value'] += 1;
          flag = 1;
          break;
        }
      }
      if (flag == 0) {
        yearData.push({"year": data[i]['Year'], "value": 1});
      } 
    }

    var minValue = 0;
    var maxValue = 0;

    for (var i=0; i<yearData.length; i++) {
      if (yearData[i]['value'] < minValue) {
        minValue = yearData[i]['value'];
      }
      if (yearData[i]['value'] > maxValue) {
        maxValue = yearData[i]['value'];
      }
    }

    x.domain(d3.extent(yearData, function(d) { return d.year; }));

    y.domain([minValue,maxValue]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .style("fill", "#899AAE");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .style("fill", "#899AAE");

    svg.append("line")
          .attr(
          {
              "class":"horizontalGrid",
              "x1" : 0,
              "x2" : width,
              "y1" : y(0),
              "y2" : y(0),
              "fill" : "none",
              "shape-rendering" : "crispEdges",
              "stroke" : "#899AAE",
              "stroke-width" : "1px",
              "stroke-dasharray": ("3, 3")
          });

    var volcano = svg.selectAll(".volcano")
        .data(yearData)
      .enter().append("g")
        .attr("class", "volcano");

    var line = d3.svg.line()
      .x(function(d) { return x(d.year); })
      .y(function(d,i) { return y(d.value); });

    var path = svg.selectAll(".volcano").append("path")
        .attr("class", "line")
        .attr("d", line(yearData))
        .style("stroke", "#FC3D27")
        .style("stroke-width", "2")
        .call(transition);
           
    var totalLength = path[0][0].getTotalLength();

    d3.select(path[0][0])
        .attr("stroke-dasharray", totalLength + " " + totalLength ) 
        .attr("stroke-dashoffset", totalLength)
        .transition()
          .duration(5000)
          .ease("linear")
          .attr("stroke-dashoffset", 0); 

    function transition(path) {
      path.transition()
          .duration(70000)
          .attrTween("stroke-dasharray", tweenDash);
    }
    function tweenDash() {
      var l = this.getTotalLength(),
          i = d3.interpolateString("0," + l, l + "," + l);
      return function (t) { return i(t); };
    }
    
    var div = d3.select("#charts_div").append("div") 
      .attr("class", "tooltip")       
      .style("opacity", 0);
        
    svg.selectAll(".dot")
      .data(yearData)
    .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function(d) { return x(d.year) })
      .attr("cy", function(d) { return y(d.value) })
      .attr("r", 3)
      .style("stroke", "#FC3D27")
      .on("mouseover", function(d) {    
          div.transition()    
              .duration(200)    
              .style("opacity", .9);    
          div .html("Occurrence: "+d.value + "<br/>"  + "Year: " + d.year) 
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  
          })          
      .on("mouseout", function(d) {   
          div.transition()    
              .duration(500)    
              .style("opacity", 0); 
      });

  });
}