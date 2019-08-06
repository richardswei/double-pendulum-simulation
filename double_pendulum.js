/*Double Pendulum Simulation*/

// POSITIONS
var r1 = 100;	// length of the pendulum
var r2 = 100;	// length of the pendulum
var theta1 = Math.PI/2; // initial angular pos (in rads) of the pendulum relative to lower vertical 
var theta2 = 0;
/*
	NOTE: Normally convention for this uses cartesian coordinates.
	Since SVG coordinates invert the Y-direction, we adjust convention accordingly
*/
var x1 = r1*Math.sin(theta1);
var y1 = r1*Math.cos(theta1);
var x2 = x1 + r2*Math.sin(theta2);
var y2 = y1 + r2*Math.cos(theta2);

// VELOCITIES
var d_theta1 = 0.1;
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

// NEXT STEPS
function step() {
  circlesData = circles.data();

  circlesData[0].theta += d_theta1;
  circlesData[0].x_axis = newX1 = 
  	r1*Math.sin(circlesData[0].theta);
  circlesData[0].y_axis = newY1 = 
  	r1*Math.cos(circlesData[0].theta);
  circlesData[1].theta += d_theta2;
  circlesData[1].x_axis = newX1 + r2*Math.sin(circlesData[1].theta);
  circlesData[1].y_axis = newY1 + r2*Math.cos(circlesData[1].theta);

	d3.selectAll("circle")
		.transition()
		.attr("cx", function (d) { return d.x_axis + 250; })
		.attr("cy", function (d) { return d.y_axis + 250; })

}