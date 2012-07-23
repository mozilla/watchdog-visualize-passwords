var loginData;
var vis;

var fill = d3.scale.category10();

var w,h;

function init() {
    vis = d3.select("#chart").append("svg:svg");
        
    window.loadLogins(function(logins) {
        loginData = logins;
        startViz();
    });
	
	var resizeTimeout = -1;
	$(window).resize(function() {
		console.log('resize!');
		if (resizeTimeout != -1)
			clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function() {
			resizeTimeout = -1;
			resizeViz();
		}, 400);
	});
}

function resizeViz() {
    w = $(window).width();
    h = $(window).height();
	
    vis.attr("width", w-100)
    .attr("height", h-100);
}

function startViz() {
	resizeViz();
	
    var force = d3.layout.force()
    .charge(-100)
    .nodes(loginData.nodes)
    .links(loginData.links)
    .size([w, h])
    .start();

    var link = vis.selectAll("line.link")
    .data(loginData.links)
    .enter().append("svg:line")
    .attr("class", "link")
    .style("stroke-width", function(d) { return d.value; })
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })
    .style("stroke", function(d) { return fill(d.value); });

    var circleNodes = vis.selectAll(".node")
    .data(
        loginData.nodes.filter(
            function(x) { 
                return x.group != 2;
            }))
    .enter().append("svg:circle")
    .attr("class", "node")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(n) { 
        if (n.group == 1)
            return 5;
        return 7;
    })
    .style("fill", function(d) { return fill(d.group); })
    .call(force.drag);
    
    circleNodes.on('click', function(d) {
        // Password nodes only
        if (d.group != 0) return;
        
        if (confirm("Are you sure you want to display this password in cleartext?")) {
            alert(d.name);
        }
    });

    var rectNodes = vis.selectAll('.node').data(loginData.nodes)
    .enter().append("svg:rect")
    .attr("class", "node")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", function(d) { return fill(d.group); })
    .call(force.drag);
    
    var node = vis.selectAll(".node");
    
    var passwordLinks = vis.selectAll('.link').data(loginData.links.filter(
            function(x) { 
                return x.group == 2;
            }));
    
	function hideInfoPopup() {
        $('.infoPopup').hide();
	}
	
    passwordLinks.style("stroke-width", "3");
    passwordLinks.on("mouseover", linkHover);
	passwordLinks.on("mouseout", hideInfoPopup);

    node.on("mouseover", nodeHover);
    node.on("mouseout", hideInfoPopup);    
        
    vis.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        circleNodes.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

        rectNodes.attr("x", function(d) { return d.x - (rectNodes.attr('width')/2); })
            .attr("y", function(d) { return d.y - (rectNodes.attr('height')/2); });

    });
}

function drawPasswordHash(canvas,password) {
    var hashedPassword = SHA1(password);
    
    var ctx = canvas.getContext('2d');
    clearCanvas(canvas);
    
    for (var bandX = 0; bandX < 6; bandX++) {
        ctx.fillStyle = '#' + hashedPassword.substr(bandX*6,6);
        ctx.fillRect(canvas.width/6*bandX,0,canvas.width/6,canvas.height);
    }
    
}

// FIXME: Find a better way to translate viz-space to screen space.

function linkHover(e) {
    $('.infoPopup').css('left',e.x + w/2);
    $('.infoPopup').css('top',e.y+20);
    $('#siteInfo').html('These passwords are really similar!').show();
}

function nodeHover(e) {
	
    $('.infoPopup').css('left',(d3.event.pageX /*+ w/2*/) + 'px');
    $('.infoPopup').css('top',(d3.event.pageY+20) + 'px');
	console.log(JSON.stringify(e));
    
    if (e.group == 0) {
        $('#obfuscatePassword').html(obfuscatePassword(e.name));
        $('#passwordInfo').show();
        // drawPasswordStrength($('#passwordStrengthCanvas').get()[0],passwordStrength(e.name));
        $('#passwordInfoHashImage').attr('src',getDataURLForHash(SHA1(e.name),200,15));
    }
    else {
        $('#siteInfo').html(e.name).show();
    }
}

function clearCanvas(canvas) {
    var canvasCtx = canvas.getContext('2d');
    canvasCtx.fillStyle="#ffffff";
    canvasCtx.lineStyle="#ffffff";
    canvasCtx.fillRect(0,0,canvas.width,canvas.height);
}

function drawPasswordStrength(canvas,strength) {
    var ctx = canvas.getContext('2d');
    clearCanvas(canvas);
    ctx.lineStyle="#000000";
    for (var boxX = 0; boxX < strength.max; boxX++) {
        if (boxX < strength.score)
            ctx.fillStyle="#ff0000";
        else
            ctx.fillStyle="#ffffff";
        ctx.fillRect(boxX/strength.max*canvas.width,0,canvas.width/strength.max,canvas.height);
    }
}

function obfuscatePassword(password) {
    var obfuscatePassword = password[0];
    for (var x = 0; x < password.length-2; x++)
        obfuscatePassword += '*';
    obfuscatePassword += password[password.length-1];
    return obfuscatePassword;
}