var animate = window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

window.onload = function() {
  document.getElementById("canvas").appendChild(canvas);
  animate(step);
};

var step = function() {
  update();//Update positions
  render();//Draw them on the screen
  animate(step);
};

var update = function() {
	player.update();
	/*When updating the ball use the paddles to check for collision*/
	ball.update(player.paddle, computer.paddle);
};

var render = function() {
  context.fillStyle = "#FF00FF";
  context.fillRect(0, 0, width, height);
  	player.render();
	computer.render();
	ball.render();
};
/*Create Paddle Class*/
function Paddle(x, y, width, height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.x_speed = 0;
	this.y_speed = 0;

}
/*Create Paddle methods that are shared across both players*/
Paddle.prototype.render = function(){
	context.fillStyle = "#0000FF";
	context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function(x, y){
	this.x += x;//add x to position
	this.y += y;
	this.x_speed = x;//the speed is the value passed in Player.proto.update
  	this.y_speed = y;

  	if(this.x < 0) { // all the way to the left
    this.x = 0;
    this.x_speed = 0;
  } else if (this.x + this.width > 400) { // all the way to the right
    this.x = 400 - this.width;
    this.x_speed = 0;
  }
};

/*Create Paddles player and comp*/

function Player(){
	this.paddle = new Paddle(175, 580, 50, 10);
}

function Computer(){
	this.paddle = new Paddle(175, 10, 50, 10);
}

Player.prototype.render = function(){
	this.paddle.render();
};

Player.prototype.update = function(){
	for( var key in keysDown){
		var value = Number(key);
		if (value == 37 ){ //left arrow key
			this.paddle.move(-4, 0);//to the left by 4 px
		} else if (value == 39) { // right arrow
      this.paddle.move(4, 0);//to the right by 4 px
       	} else {
      this.paddle.move(0, 0);
    	}
	}
};

Computer.prototype.render = function(){
	this.paddle.render();
};
/* Create Ball Class*/
function Ball(x, y){
	this.x = x;
	this.y = y;
	this.x_speed = 0;
	this.y_speed = 3;
	this.radius = 5;
}
/* Create Ball methods*/
Ball.prototype.render = function(){
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
  var leftSide = this.x - 5;//left side of ball
  var top_y = this.y - 5;//top of ball
  var rightSide = this.x + 5;//right side of ball
  var bottom_y = this.y + 5;//bottom of ball

  if(leftSide < 0) { // hitting the left wall
    this.x = 5;
    this.x_speed = -this.x_speed;
  } else if(rightSide > 400) { // hitting the right wall
    this.x = 395;
    this.x_speed = -this.x_speed;
  }

  if(this.y < 0 || this.y > 600) { // a point was scored
    this.x_speed = 0;
    this.y_speed = 3;
    this.x = 200;
    this.y = 300;
  }

  if(top_y > 300) {//why is this here?
    if(top_y < (playerPaddle.y + playerPaddle.height) && bottom_y > playerPaddle.y && leftSide < (playerPaddle.x + playerPaddle.width) && rightSide > playerPaddle.x) {
      // hit the player's paddle
      this.y_speed = -3;
      this.x_speed += (playerPaddle.x_speed / 2);
      this.y += this.y_speed;
    }
  } else {
    if(top_y < (computerPaddle.y + computerPaddle.height) && bottom_y > computerPaddle.y && leftSide < (computerPaddle.x + computerPaddle.width) && rightSide > computerPaddle.x) {
      // hit the computer's paddle
      this.y_speed = 3;
      this.x_speed += (computerPaddle.x_speed / 2);
      this.y += this.y_speed;
    }
  }
};

var player = new Player();
var computer = new Computer();
var ball = new Ball (200, 300);

var keysDown = {};

window.addEventListener("keydown", function(event){
	keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event){
	delete keysDown[event.keyCode];
});