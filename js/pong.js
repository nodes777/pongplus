var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60)
    };

var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');


var startTime = Date.now();


window.onload = function() {
    document.getElementById("canvas").appendChild(canvas);
    animate(step);
};

var step = function() {
    update(); //Update positions
    render(); //Draw them on the screen
    animate(step);//repeat
};

var update = function() {
    player.update();
    /*When updating the ball use the paddles to check for collision*/
    ball.update(player.paddle, computer.paddle);
    /*Have the computer react to the ball*/
    computer.update(ball);

    powerUp.powerUpUpdate(player.paddle);

    var d = new Date();
	var seconds = d.getSeconds();
	console.log(seconds);
};

var render = function() {
    context.fillStyle = "tan";
    context.fillRect(0, 0, width, height);
    context.setLineDash([5, 10]);
	context.beginPath();
	context.moveTo(0,300);
	context.lineTo(400, 300);
	context.stroke();

    player.render();
    computer.render();
    ball.render();
    powerUp.render();
};
/*Create Paddle Class*/
function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
    this.powerUpped = false;
}
/*Create Paddle methods that are shared across both players*/
Paddle.prototype.render = function() {
    context.fillStyle = "#0000FF";
    context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function(x, y) {
    this.x += x; //add x to position
    this.y += y;
    this.x_speed = x; //the speed is the value passed in Player.proto.update
    this.y_speed = y;

    if (this.x < 0) { // all the way to the left
        this.x = 0;
        this.x_speed = 0;
    } else if (this.x + this.width > 400) { // all the way to the right
        this.x = 400 - this.width;
        this.x_speed = 0;
    }
};

/*Create Paddles player and comp*/

function Player() {
    this.paddle = new Paddle(175, 580, 50, 10);
}

function Computer() {
    this.paddle = new Paddle(175, 10, 50, 10);
}

Player.prototype.render = function() {
    this.paddle.render();
};

Player.prototype.update = function() {
	var self = this;
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 37) { //left arrow key
            this.paddle.move(-4, 0); //to the left by 4 px
        } else if (value == 39) { // right arrow
            this.paddle.move(4, 0); //to the right by 4 px
        //} else if (value == 38) { // up
        //    this.paddle.move(0, -4);
        //} else if (value == 40) {
         //   this.paddle.move(0, 4);
        } else {
           this.paddle.move(0, 0);
        }
    }
    /*powerUp code, this keeps running every animation, it doesn't have to? It does to grow paddle*/
    if (this.powerUpped == false){
    	if(player.paddle.width > 50){
    			player.paddle.width -= 1;
   	 		}else{
   	 			player.paddle.width = 50;
   	 		}
    }
    else if (this.powerUpped == true) {
    	/*Grows paddle over frames*/
    	if(this.paddle.width < 100){
    		this.paddle.width += 1;
   	 	}else{
   	 		this.paddle.width = 100;
   	 	}
    	/*Return paddle to normal size after 10 secs*/
    	window.setTimeout(function(){
    		player.powerUpped = false;
    	}, 10000);
    }
};

Computer.prototype.render = function() {
    this.paddle.render();
};

Computer.prototype.update = function(ball) {
    var x_pos = ball.x;
    var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos); //Half of the paddle width plus the paddle x position minus the ball x position
    if (diff < 0 && diff < -4) { // max speed left
        diff = -5;
    } else if (diff > 0 && diff > 4) { // max speed right
        diff = 5;
    }

    this.paddle.move(diff, 0);
    if (this.paddle.x < 0) {
        this.paddle.x = 0; //left wall
    } else if (this.paddle.x + this.paddle.width > 400) {
        this.paddle.x = 400 - this.paddle.width; //right wall
    }
};
/* Create Ball Class*/
function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = 3;
    this.radius = 5;
}
/* Create Ball methods*/
Ball.prototype.render = function() {
    /*Put "pen" down on canvas*/
    context.beginPath();
    /*Draw an arc starting at the x and y, using the radius, and the angle in radians, Counter Clockwise is false*/
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#000000";
    context.fill();
};

Ball.prototype.update = function(playerPaddle, computerPaddle) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var leftSide = this.x - 5; //left side of ball
    var top_y = this.y - 5; //top of ball
    var rightSide = this.x + 5; //right side of ball
    var bottom_y = this.y + 5; //bottom of ball

    if (leftSide < 0) { // hitting the left wall
        this.x = 5;
        this.x_speed = -this.x_speed;
    } else if (rightSide > 400) { // hitting the right wall
        this.x = 395;
        this.x_speed = -this.x_speed;
    }

    if (this.y < 0 || this.y > 600) { // a point was scored
        if (this.y < 0) {
        	var playerScore = octo.getPlayerScore();
            playerScore += 1;
            octo.updatePlayerScore(playerScore);
        } else
        if (this.y > 600) {
        	var compScore = octo.getCompScore();
            compScore += 1;
            octo.updateCompScore(compScore);
        }
        this.x_speed = 0;
        this.y_speed = 3;
        this.x = 200;
        this.y = 300;
    }

    if (top_y > 300) { //why is this here?
        if (top_y < (playerPaddle.y + playerPaddle.height) && bottom_y > playerPaddle.y && leftSide < (playerPaddle.x + playerPaddle.width) && rightSide > playerPaddle.x) {
            // hit the player's paddle
            this.y_speed = -3;
            this.x_speed += (playerPaddle.x_speed / 2);
            this.y += this.y_speed;
        }
    } else {
        if (top_y < (computerPaddle.y + computerPaddle.height) && bottom_y > computerPaddle.y && leftSide < (computerPaddle.x + computerPaddle.width) && rightSide > computerPaddle.x) {
            // hit the computer's paddle
            this.y_speed = 3;
            this.x_speed += (computerPaddle.x_speed / 2);
            this.y += this.y_speed;
        }
    }
};



var player = new Player();

var computer = new Computer();

if (update.seconds == 20||40||60){
	var ball = new Ball(200, 300);
}

var powerUp = new Ball(100, 50);

var keysDown = {};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

/*Create powerUp differences*/
powerUp.properties = function (){
	this.context.fillStyle = "blue";
}
powerUp.powerUpUpdate = function (playerPaddle){
	this.x += this.x_speed;
    this.y += this.y_speed;
    var leftSide = this.x - 5; //left side of ball
    var top_y = this.y - 5; //top of ball
    var rightSide = this.x + 5; //right side of ball
    var bottom_y = this.y + 5; //bottom of ball
    if (top_y < (playerPaddle.y + playerPaddle.height) && bottom_y > playerPaddle.y && leftSide < (playerPaddle.x + playerPaddle.width) && rightSide > playerPaddle.x) {
            // hit the player's paddle
            console.log("hit");
            //power up should disappear
            player.powerUpped = true;//how to make this extendable?? Use octo?
        }
}
/*Octo*/
var octo = {

	getCompScore: function () {
		return data.game.compScore;
	},
	getPlayerScore: function () {
		return data.game.playerScore;
	},
	updateCompScore: function (score) {
		data.game.compScore = score;
	    view.renderScore();
	},
	updatePlayerScore: function (score) {
		data.game.playerScore = score;
	    view.renderScore();

	}
}

/*Data*/
var data = {
	game: {
	    compScore: 0,
	    playerScore: 0
	}
}

/*View*/
var view = {

	renderScore: function(){
		document.getElementById("cScore").innerHTML= octo.getCompScore();
		document.getElementById("pScore").innerHTML = octo.getPlayerScore();
	}
}