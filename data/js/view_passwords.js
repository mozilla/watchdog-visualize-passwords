var loginData;
var vis;

var w=800;var h=600;var fill = d3.scale.category20();

function init() {
    vis = d3.select("#chart").append("svg:svg")
        .attr("width", w)
        .attr("height", h);
        
    window.loadLogins(function(logins) {
        loginData = logins;
        startViz();
    });
}

function startViz() {
    var force = d3.layout.force()
    .charge(-100)
    .nodes(loginData.nodes)
    .links(loginData.links)
    .size([800, 600])
    .start();

    var link = vis.selectAll("line.link")
    .data(loginData.links)
    .enter().append("svg:line")
    .attr("class", "link")
    .style("stroke-width", function(d) { return Math.sqrt(d.value); })
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

    var node = vis.selectAll("circle.node")
    .data(loginData.nodes)
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


    node.on("mouseover", mouseOver);
    
    node.on("mouseout", function(e) {
        $('.infoPopup').hide();
    });    
    
    // node.append("svg:text").text(function(d) { return "hey"; });
    // 
    // node.append("svg:title")
    //     .text(function(d) { return d.name; });

    vis.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
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

function mouseOver(e) {
    $('.infoPopup').css('left',e.x + 20);
    $('.infoPopup').css('top',e.y);
    
    if (e.group == 0) {
        $('#obfuscatePassword').html(obfuscatePassword(e.name));
        // $('#passwordStrength').html(passwordStrength(e.name).score);
        $('#passwordInfo').show();
        drawPasswordStrength($('#passwordStrengthCanvas').get()[0],passwordStrength(e.name));
        console.log(getDataURLForHash(SHA1(e.name),200,15));
        $('#passwordInfoHashImage').attr('src',getDataURLForHash(SHA1(e.name),200,15));
        // drawPasswordHash($('#passwordInfoHashCanvas').get()[0],e.name);
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