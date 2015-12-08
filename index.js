var Game = function(canvasId) {
  var canvas = document.getElementById(canvasId);
  var screen = canvas.getContext('2d');
  this.size = {x: canvas.width, y: canvas.height};

  this.bodies = createInvaders(this).concat(new Player(this));
  this.shootSound = document.getElementById('shoot-sound');
  var sprite = new Image();

  var self = this;
  var tick = function() {
    self.update();
    self.draw(screen, sprite);
    requestAnimationFrame(tick);
  };

  sprite.onload = tick;
  sprite.src = 'spritesheet.png';

};

Game.prototype = {
  invadersBellow: function(invader) {
    return this.bodies.filter(function(b) {
      return b instanceof Invader &&
        Math.abs(invader.center.x - b.center.x) < b.size.x &&
        b.center.y > invader.center.y;
    }).length > 0;
  },

  addBody: function(body) {
    this.bodies.push(body);
  },

  update: function() {
    var bodies = this.bodies;
    var notCollidingWithAnything = function(b1) {
      return bodies.filter(function(b2) {
        return colliding(b1, b2);
      }).length === 0;
    };

    this.bodies = bodies.filter(notCollidingWithAnything);
    for(var i = 0; i < this.bodies.length; i++) {
      this.bodies[i].update();
    }
  },

  draw: function(screen, img) {
    screen.clearRect(0, 0, this.size.x, this.size.y);
    for(var i = 0; i < this.bodies.length; i++) {
      this.bodies[i].draw(screen, img);
    }
  }
};

var Player = function(game) {
  this.game = game;
  this.image = {x: 0, y: 5, width: 64, height: 64};
  this.size = {x: 20, y: 20};
  this.center = {x: game.size.x / 2, y: game.size.y - this.size.y};
  this.keyboarder = new Keyboarder();
  this.shootInterval = 500;
  this.lastShoot = (new Date()).getTime();
};

Player.prototype = {

  update: function() {

    if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
      this.center.x -= 2;
    } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
      this.center.x += 2;
    } else if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {

      var now = (new Date()).getTime();
      if (this.lastShoot + this.shootInterval > now) return;
      this.lastShoot = now;

      var bullet = new Bullet({x: this.center.x,
                               y: this.center.y - this.size.y - 10},
                              {x: 0, y: -7});
      this.game.addBody(bullet);
      this.game.shootSound.load();
      this.game.shootSound.play();
    }

  },

  draw: function(screen, sprite) {
    drawImage(screen, sprite, this);
  }

};

var Bullet = function(center, velocity) {
  this.center = center;
  this.size = {x: 3, y: 3};
  this.velocity = velocity;
};

Bullet.prototype = {

  update: function() {
    this.center.x += this.velocity.x;
    this.center.y += this.velocity.y;
  },

  draw: function(screen) {
    drawRect(screen, this);
  }

};

var Invader = function(game, image, center) {
  this.game = game;
  this.image = image;
  this.size = {x: 20, y: 20};
  this.center = center;
  this.patrolX = 0;
  this.speedX = 0.3;
};

Invader.prototype = {

  update: function() {
    if (this.patrolX < 0 || this.patrolX > 40) {
      this.speedX = -this.speedX;
    }

    if (Math.random() > 0.995 &&
        !this.game.invadersBellow(this)) {
      var bullet = new Bullet({x: this.center.x,
                               y: this.center.y + this.size.y/2},
                              {x: Math.random() - 0.5, y: 2});
      this.game.addBody(bullet);
    }

    this.center.x += this.speedX;
    this.patrolX += this.speedX;
  },

  draw: function(screen, sprite) {
    drawImage(screen, sprite, this);
    // drawRect(screen, this);
  }

};

var Keyboarder = function() {
  var keyState = {};

  window.onkeydown = function(e) {
    keyState[e.keyCode] = true;
  };

  window.onkeyup = function(e) {
    keyState[e.keyCode] = false;
  };

  this.isDown = function(keyCode) {
    return keyState[keyCode];
  };

  this.KEYS = {LEFT: 37, RIGHT: 39, SPACE: 32};
};



var createInvaders = function(game) {
  var invaders = [];
  for(var i = 0; i < 24; i++) {
    var x = 35 + (i % 8) * 30;
    var y = 35 + (i % 3) * 30;
    var imgX = Math.floor(Math.random() * 11) * 39 + 5;
    invaders.push(new Invader(game,{x: imgX, y: 84,width: 39, height: 39},
                              {x: x, y: y}));
  }
  return invaders;
};

var colliding = function(b1, b2){
  return !(b1 === b2 ||
           b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
           b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
           b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
           b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2 );
};

var drawImage = function(screen, sprite, body) {
  screen.drawImage(sprite, body.image.x, body.image.y, body.image.width,
                   body.image.height, body.center.x - body.size.x,
                   body.center.y - body.size.y, body.size.x,
                   body.size.y);
};

var drawRect = function(screen, body) {
  screen.fillStyle = 'white';
  screen.fillRect(body.center.x - body.size.x,
                  body.center.y - body.size.y,
                  body.size.x, body.size.y);
};

new Game('canvas');

