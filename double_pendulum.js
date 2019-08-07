/*Double Pendulum Simulation*/
/*
	NOTE: Normally convention for this uses cartesian coordinates.
	Since SVG coordinates invert the Y-direction, we adjust constants
	*/
var simulationOn = false;
// CONSTANTS
var m1 = 100; // mass1
var m2 = 100;	// mass2
var timeStep = 100;
var g = 9.8/timeStep; // gravitational constant

// POSITIONS
var r1 = 100;	// length of the pendulum
var r2 = 100;	// length of the pendulum
var theta1 = 0; // initial angular pos (in rads) of the pendulum relative to lower vertical 
var theta2 = Math.PI/2;
var x1 = r1*Math.sin(theta1);
var y1 = r1*Math.cos(theta1);
var x2 = x1 + r2*Math.sin(theta2);
var y2 = y1 + r2*Math.cos(theta2);

// VELOCITIES
var d_theta1 = 0;
var d_theta2 = 0;

// ACCELERATIONS
var dd_theta1 = 0;
var dd_theta2 = 0;

// DRAW
var svgContainer = d3.select("#double_pendulum").append("svg")
	.attr("width", 500)
	.attr("height", 500);

var jsonCircles = [
  { "x_axis": x1, "y_axis": y1, "radius": 10, "color": "purple", "theta":theta1 }, //mass1
  { "x_axis": x2, "y_axis": y2, "radius": 10, "color": "purple", "theta":theta2 }		//mass2
];
var circles = svgContainer.selectAll("circle")
	.data(jsonCircles)
	.enter()
	.append("circle");
var circleAttributes = circles
	.attr("cx", function (d) { return d.x_axis + 250; })
	.attr("cy", function (d) { return d.y_axis + 250; })
	.attr("r", function (d) { return d.radius; })
	.style("fill", function(d) { return d.color; });


var doTheLine = d3.line()
	.x(function(d) {return d.x_axis;})
	.y(function(d) {return d.y_axis;})
	.curve(d3.curveLinear)
;
var lineData = [
	{"x_axis": 250, "y_axis":250},
	{"x_axis": x1+250, "y_axis": y1+250},
	{"x_axis": x2+250, "y_axis": y2+250}
];
var lines = svgContainer.append("path")
	.datum(lineData)
	.attr('d', doTheLine)
	.attr('class', 'line')
	.attr('fill', 'none')
	.attr('stroke-width', 2)
	.attr('stroke', 'purple'); 

// NEXT STEPS
function step() {
  circlesData = circles.data();
  var prev_d_theta1 = d_theta1;
  var prev_d_theta2 = d_theta2;
	d_theta1 += getAngularAcc1(g, m1, m2, circlesData[0].theta, circlesData[1].theta, prev_d_theta1, prev_d_theta2);
	d_theta2 += getAngularAcc2(g, m1, m2, circlesData[0].theta, circlesData[1].theta, prev_d_theta1, prev_d_theta2);
	
	console.log('d_theta1 : '+d_theta1);
	console.log('prev_d_theta1 : '+prev_d_theta1);

	circlesData[0].theta += d_theta1;
	circlesData[1].theta += d_theta2;

	// calculate acceleration and velocities
  circlesData[0].x_axis = r1*Math.sin(circlesData[0].theta);
  circlesData[0].y_axis = r1*Math.cos(circlesData[0].theta);
  circlesData[1].x_axis = circlesData[0].x_axis +
  	r2*Math.sin(circlesData[1].theta);
  circlesData[1].y_axis = circlesData[0].y_axis +
  	r2*Math.cos(circlesData[1].theta);

	renderLines(circlesData);
	d3.selectAll("circle")
		.attr("cx", function (d) { return d.x_axis + 250; })
		.attr("cy", function (d) { return d.y_axis + 250; })
}

// RENDER LINES
function renderLines(circlesData) {
	var lineData = [{"x_axis": 250, "y_axis":250},
	{"x_axis": circlesData[0].x_axis+250, "y_axis": circlesData[0].y_axis+250},
	{"x_axis": circlesData[1].x_axis+250, "y_axis": circlesData[1].y_axis+250}
	];

	var svg = d3.selectAll('path')
				.data(lineData);
	    svg.enter().append('svg:path')
	            .attr('d', doTheLine(lineData))
	            .style('stroke-width', 2)
	            .style('stroke', 'purple');
	    svg
	    	.attr('d', doTheLine(lineData))
            .style('stroke-width', 2)
            .style('stroke', 'purple');    
	    svg.exit().remove();    
}

var startSimulation = setInterval(function(){
		step();
	}, 1000/timeStep);

function toggleSimulation() {
	if (simulationOn) {
		clearInterval(startSimulation);
		simulationOn = false;
	} else {
		startSimulation;
		simulationOn=true;
	}
}

function getAngularAcc1(gConst, m1, m2, ang1, ang2, ang_vel1, ang_vel2) {
	var term1 = -gConst*(2*m1+m2)*Math.sin(ang1);
	var term2 = -m2*gConst*Math.sin(ang1-(2*ang2));
	var term3 = -2*Math.sin(ang1-ang2)*m2*(Math.pow(ang_vel2,2)*r2+Math.pow(ang_vel1,2)*Math.cos(ang1-ang2));
	var term4 = r1*(2*m1+m2-m2*Math.cos(2*ang1-2*ang2));
	return (term1+term2+term3)/term4;
}
function getAngularAcc2(gConst, m1, m2, ang1, ang2, ang_vel1, ang_vel2) {
	var term1 = 2*Math.sin(ang1-ang2);
	var term2 = Math.pow(ang_vel1,2)*r1*(m1+m2);
	var term3 = gConst*(m1+m2)*Math.cos(ang1);
	var term4 = Math.pow(ang_vel2,2)*r2*m2*Math.cos(ang1-ang2);
	var term5 = r2*(2*m1+m2-m2*Math.cos(2*ang1-2*ang2));
	return term1*(term2+term3+term4)/term5;
}