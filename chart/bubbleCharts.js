function changeIt() {
	d3.selectAll("#chart_mag").remove();
	var form_1 = document.getElementById("dimensions");
	var form_2 = document.getElementById("second_charts");

	var form1_val;
	for(var i=0; i<form_1.length; i++){
		if(form_1[i].checked){
			form1_val = form_1[i].id;
		}
	}

	var form2_val;
	for(var i=0; i<form_2.length; i++){
		if(form_2[i].checked){
			form2_val = form_2[i].id;
		}
	}

	var datasets = ['./earth_database.csv', './Tsunamis.csv', './volcano_eruption_info_details.csv'];
	/*if (form1_val=='Earthquake' && form2_val=='Death') {
		//startDraw(datasets[0], 'death');
	} else if (form1_val=='Earthquake' && form2_val=='Damages') {
		//startDraw(datasets[0], 'damages');
	} else */
	if (form1_val=='Tsunami' && form2_val=='Death') {
		startDraw(datasets[1], 'death');
	} else if (form1_val=='Tsunami' && form2_val=='Damages') {
		startDraw(datasets[1], 'damages');
	} else if (form1_val=='Volcano' && form2_val=='Death') {
		startDraw(datasets[2], 'death');
	} else if (form1_val=='Volcano' && form2_val=='Damages') {
		startDraw(datasets[2], 'damages');
	} 
}

function drawBubbles() {
	var dataDim_2 = d3.select("#second_charts")
	dataDim_2.on("change", changeIt);			
}

function startDraw(dataset, dimension) {
	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 20, bottom: 30, left: 50},
		width = 630 - margin.left - margin.right,
		height = 530 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	var svg = d3.select("#charts_second_div").append("svg:svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", 'chart_mag')
		.style("background-color", '#0A0C0E')
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.csv(dataset, function(oldData) {
		var data = [];
		for (var i=0; i<oldData.length; i++) {
			if (oldData[i]['magnitude']>0 && oldData[i][dimension]>0) {
				data.push(oldData[i]);
			}
		}

		function compare(data, dimn) {
			var minValue = data[0][dimn];
		    var maxValue = 0;

		    for (var i=0; i<data.length; i++) {
		    	var comp = parseInt(data[i][dimn], 10);
				if (comp < minValue) {
					minValue = comp;
				}
				if (comp > maxValue) {
					maxValue = comp;
				}
		    }
		    return [minValue, maxValue];
		}

		// Add X axis
		var [minX, maxX] = compare(data, 'Year');
		var x = d3.scale.linear()
			.domain([minX, maxX])
			.range([ 0, width ]);

		

		// Add Y axis
		var [minY, maxY] = compare(data, 'magnitude');
		var y = d3.scale.linear()
			.domain([minY, maxY])
			.range([ height, 0]);

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

        svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
        	.style("fill", "#899AAE");

		svg.append("g")
			.call(yAxis)
			.style("fill", "#899AAE");
		
		// Add a scale for bubble size
		var z = d3.scale.linear()
			.domain(compare(data, dimension))
			.range([ 4, 40]);

		// -1- Create a tooltip div that is hidden by default:
		var tooltip = d3.select("#charts_second_div")
			.append("div")
				.style("opacity", 0)
				.attr("class", "tooltip")
				.style("background-color", "black")
				.style("border-radius", "5px")
				.style("padding", "10px")
				.style("color", "white")

		// -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
		var showTooltip = function(d) {
			tooltip
				.transition()
				.duration(200)
			tooltip
				.style("opacity", 1)
				.html(dimension + ": " + d[dimension] + "<br/>"  + "Year: " + d.Year + "<br/>"  + "Magnitude: " + d.magnitude)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY) + "px")
		}

		var moveTooltip = function(d) {
			tooltip
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY) + "px")
		}

		var hideTooltip = function(d) {
			tooltip
				.transition()
				.duration(200)
				.style("opacity", 0)
		}

		// Add dots
		svg.append('g')
			.selectAll("dot")
			.data(data)
			.enter()
			.append("circle")
				.attr("class", "bubbles")
				.attr("cx", function (d) { return x(d.Year); } )
				.attr("cy", function (d) { return y(d.magnitude); } )
				.attr("r", function (d) {  return z(d[dimension]); } )
				.style("fill", '#6E94FF' )
		// -3- Trigger the functions
			.on("mouseover", showTooltip )
			.on("mousemove", moveTooltip )
			.on("mouseleave", hideTooltip )

	})

}