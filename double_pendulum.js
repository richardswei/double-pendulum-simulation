/*Double Pendulum Simulation*/
/*
	NOTE: Normally convention for this uses cartesian coordinates.
	Since SVG coordinates invert the Y-direction, we adjust constants
	*/
var simulationOn = false;
// CONSTANTS
var m1 = parseFloat(document.getElementById('mass1').value); // mass1
var m2 = parseFloat(document.getElementById('mass2').value);	// mass2
var timestep = 60;
var g = parseFloat(document.getElementById('grav').value) // gravitational constant

// POSITIONS
var r1 = parseFloat(document.getElementById('l1').value);	// length of the pendulum
var r2 = parseFloat(document.getElementById('l2').value);	// length of the pendulum
var theta1 = parseFloat(document.getElementById('initial_theta1').value); // initial angular pos (in rads) of the pendulum relative to lower vertical 
var theta2 = parseFloat(document.getElementById('initial_theta2').value);
var x1 = r1*Math.sin(theta1);
var y1 = r1*Math.cos(theta1);
var x2 = x1 + r2*Math.sin(theta2);
var y2 = y1 + r2*Math.cos(theta2);
var svgWidth = 600;
// VELOCITIES
var d_theta1 = 0;
var d_theta2 = 0;

// ACCELERATIONS
var dd_theta1 = 0;
var dd_theta2 = 0;

// DRAW
var svgContainer = d3.select("#double_pendulum").append("svg")
	.attr("width", svgWidth)
	.attr("height", svgWidth);

var jsonCircles = [
  { "x_axis": x1, "y_axis": y1, "radius": 15, "color": "#8795E8", "theta":theta1 }, //mass1
  { "x_axis": x2, "y_axis": y2, "radius": 15, "color": "#8795E8", "theta":theta2 }		//mass2
];
var circles = svgContainer.selectAll("circle")
	.data(jsonCircles)
	.enter()
	.append("circle");

var circleAttributes = circles
	.attr("cx", function (d) { return d.x_axis + svgWidth/2; })
	.attr("cy", function (d) { return d.y_axis + svgWidth/2; })
	.attr("r", function (d) { return d.radius; })
	.style("fill", function(d) { return d.color; });


var doTheLine = d3.line()
	.x(function(d) {return d.x_axis;})
	.y(function(d) {return d.y_axis;})
	.curve(d3.curveLinear)
;
var lineData = [
	{"x_axis": svgWidth/2, "y_axis":svgWidth/2},
	{"x_axis": x1+svgWidth/2, "y_axis": y1+svgWidth/2},
	{"x_axis": x2+svgWidth/2, "y_axis": y2+svgWidth/2}
];
var lines = svgContainer.append("path")
	.datum(lineData)
	.attr('d', doTheLine)
	.attr('class', 'line')
	.attr('fill', 'none')
	.attr('stroke-width', 2)
	.attr('stroke', '#8795E8'); 

// NEXT STEPS
function step() {
  circlesData = circles.data();
  var prev_d_theta1 = d_theta1;
  var prev_d_theta2 = d_theta2;
	d_theta1 += getAngularAcc1(g, m1, m2, circlesData[0].theta, circlesData[1].theta, prev_d_theta1, prev_d_theta2);
	d_theta2 += getAngularAcc2(g, m1, m2, circlesData[0].theta, circlesData[1].theta, prev_d_theta1, prev_d_theta2);
	
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
		.attr("cx", function (d) { return d.x_axis + svgWidth/2; })
		.attr("cy", function (d) { return d.y_axis + svgWidth/2; })
}

// RENDER LINES
function renderLines(circlesData) {
	var lineData = [{"x_axis": svgWidth/2, "y_axis":svgWidth/2},
	{"x_axis": circlesData[0].x_axis+svgWidth/2, "y_axis": circlesData[0].y_axis+svgWidth/2},
	{"x_axis": circlesData[1].x_axis+svgWidth/2, "y_axis": circlesData[1].y_axis+svgWidth/2}
	];

	var svg = d3.selectAll('path')
				.data(lineData);
	    svg.enter().append('svg:path')
	            .attr('d', doTheLine(lineData))
	            .style('stroke-width', 2)
	            .style('stroke', '#8795E8');
	    svg
	    	.attr('d', doTheLine(lineData))
            .style('stroke-width', 2)
            .style('stroke', '#8795E8');    
	    svg.exit().remove();    
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

var simulate = document.getElementById('simulate');
    simulate.addEventListener("click", startSimulation);

var interval;

function startSimulation(){
    console.log("Started Simulation");
    simulate.removeEventListener("click", startSimulation);
    simulate.addEventListener("click", stopSimulation);
    interval = setInterval(function() {
    	step();
    }, 1000/timestep);
    simulate.value = "Stop";
}

function stopSimulation(){
    console.log("Stopped Simulation");
    simulate.removeEventListener("click", stopSimulation);
    clearInterval(interval);
    simulate.addEventListener("click", startSimulation);
    simulate.value = "Start";
}