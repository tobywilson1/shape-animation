let spawnRate = 5; // a scale of 0 (no spawning) to 10 (maximum spawning)

//convert spawn rate to a range of 0.5 to 1 , defaulting to 0.75 if set incorrectly
spawnRate = spawnRate < 0 || spawnRate > 10 ? 5 : spawnRate;
spawnRate = 0.5 + spawnRate * 0.05;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//add new shapes to this object
const drawShape = {
  circle: function (ctx, fill, dia, line, x, y) {
    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    ctx.lineWidth = 2;
    ctx.arc(x, y, dia, 0, 2 * Math.PI);
    ctx.closePath();

    line !== true ? ctx.fill() : ctx.stroke();
  },

  triangle: function (ctx, fill, dia, line, x, y, angle) {
    dia = dia * 2;
    let height = dia * Math.cos(Math.PI / 6);

    ctx.translate(-dia / 2, -height / 2);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dia, y);
    ctx.lineTo(x + dia / 2, y + height);
    ctx.closePath();

    // the outline
    ctx.lineWidth = 1;
    ctx.strokeStyle = fill;
    ctx.stroke();

    // the fill color
    ctx.fillStyle = fill;

    // either fill
    line !== true ? ctx.fill() : ctx.stroke();

    ctx.translate(dia / 2, height / 2);
  },

  semicircle: function (ctx, fill, dia, line, x, y) {
    ctx.translate(-dia / 2, 0);

    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    ctx.lineWidth = 2;
    ctx.arc(x, y, dia, 1.5 * Math.PI, 0.5 * Math.PI);
    ctx.closePath();

    line !== true ? ctx.fill() : ctx.stroke();

    ctx.translate(dia / 2, 0);
  },
  square: function (ctx, fill, dia, line, x, y, angle) {
    ctx.translate(-dia / 2, -dia / 2);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dia, y);
    ctx.lineTo(x + dia, y + dia);
    ctx.lineTo(x, y + dia);
    ctx.closePath();

    // the outline
    ctx.lineWidth = 1;
    ctx.strokeStyle = fill;
    ctx.stroke();

    // the fill color
    ctx.fillStyle = fill;

    // either fill
    line !== true ? ctx.fill() : ctx.stroke();

    ctx.translate(dia / 2, dia / 2);
  },
};

// Individual particle
class Point {
  constructor(x, y, canvasRef, dia) {
    this.canvasRef = canvasRef;
    this.x = x || 0;
    this.y = y || 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = Math.random() * 0.5 + 0.2;
    this.angle = Math.random() * 360;
    this.diaSet = dia || 2 + Math.random() * 10;
    this.dia = this.diaSet;
    this.age = 0;
    let hue = Math.floor(Math.random() * 360);
    this.fill = 'hsl(' + hue + ', 95%, 70%)';
    this.line = Math.random() > 0.5 ? true : false;
    this.shape = Object.keys(drawShape)[
      getRandomInt(0, Object.keys(drawShape).length - 1)
    ];
    this.start = Date.now();
    this.rate = (Math.random() > 0.5 ? 1 : -1) * Math.random() * 180;
  }

  emit(life) {
    let s = this.speed * 2;
    this.angle += Math.random() * 10 - 5;
    this.x += s * Math.cos((this.angle * Math.PI) / 180);
    this.y += s * Math.sin((this.angle * Math.PI) / 180);
    this.age += 1 / life;
    this.boundary();
  }

  boundary() {
    const canvas = this.canvasRef.current;
    if (this.x < 0) {
      this.x = canvas.width;
    }
    if (this.x > canvas.width) {
      this.x = 0;
    }
    if (this.y < 0) {
      this.y = canvas.height;
    }
    if (this.y > canvas.height) {
      this.y = 0;
    }
  }

  field(life) {
    let s = this.speed;
    this.angle += Math.random() * 10 - 5;
    this.x += s * Math.cos((this.angle * Math.PI) / 180);
    this.y += s * Math.sin((this.angle * Math.PI) / 180);
    this.age += 1 / life;
    this.boundary();
  }

  shrink(life) {
    this.dia = (1 - this.age) * this.diaSet;

    //to cater for if we adjust rate of emission so cycles per particle becomes > life
    if (this.age > 1) {
      this.dia = 0;
    }
  }

  draw() {
    let ctx = this.canvasRef.current.getContext('2d'),
      x = this.x,
      y = this.y,
      dia = this.dia;

    const millis = Date.now() - this.start;
    const elapsed = millis / 1000;
    const rate = this.rate; //degrees per second
    const angle = elapsed * rate; //cumulative angle based on elapsed time

    ctx.translate(x, y);
    ctx.rotate((Math.PI / 180) * angle);
    ctx.translate(-x, -y);

    drawShape[this.shape](ctx, this.fill, dia, this.line, x, y, angle);

    ctx.translate(x, y);
    ctx.rotate((Math.PI / 180) * -angle);
    ctx.translate(-x, -y);
  }
}

class ParticleGroup {
  constructor(canvasRef) {
    this.canvasRef = canvasRef;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  getPosition(x, y) {
    return {
      x: this.x,
      y: this.y,
    };
  }

  spawn(x, y, amount, dia) {
    var arr = [];
    dia = dia || false;

    amount = amount || 1;

    if (amount > 1) {
      for (let i = 0; i < amount; i++) {
        if (dia) {
          arr.push(new Point(x, y, this.canvasRef, dia));
        } else {
          arr.push(new Point(x, y, this.canvasRef));
        }
      }
    } else {
      arr = new Point(x, y, this.canvasRef, dia);
    }

    return arr;
  }
}

// Particle Emitter
class Emitter extends ParticleGroup {
  constructor(x, y, life, mouse, dia, canvasRef) {
    super(canvasRef);

    if (mouse === undefined) {
      this.mouse = true;
    } else {
      this.mouse = mouse;
    }

    this.particles = [];
    this.x = x || 0;
    this.y = y || 0;
    this.life = life || 20;
    this.canvasRef = canvasRef;
    this.dia = dia || false;
  }

  animate() {
    let particles = this.particles;
    if (this.mouse) {
      this.setPosition(window.CanvasUtils.originx, window.CanvasUtils.originy);
    }

    let mul = 1;

    let rdm = Math.round(Math.random() * spawnRate);

    for (let i = 0; i < mul; i++) {
      !!rdm && particles.push(this.spawn(this.x, this.y, 1));
    }

    if (particles.length > this.life * mul) {
      for (let i = 0; i < mul; i++) {
        !!rdm && particles.shift();
      }
    }

    this.render();
  }

  render() {
    let particles = this.particles;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.draw();
      p.emit(this.life);
      p.shrink();
    }
  }
}

// Particle Field
class Field extends ParticleGroup {
  constructor(x, y, life, canvasRef) {
    super(canvasRef);
    this.particles = [];
    this.canvasRef = canvasRef;
    this.x = x || 0;
    this.y = y || 0;
    this.life = life;

    for (let i = 0; i < this.life; i++) {
      let x = Math.random() * canvasRef.current.width,
        y = Math.random() * canvasRef.current.height;

      this.particles.push(this.spawn(x, y, 1));
    }
  }

  animate() {
    this.render();
  }

  render() {
    let particles = this.particles;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.draw();
      p.field(this.life);
    }
  }
}

// get the mouse position relative to the canvas
function getMousePos(canvasRef, e) {
  const cvs = canvasRef.current;
  const rect = cvs.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// Update canvas size to fill its container
function resizeCanvas(canvasRef) {
  //get canvas and parent container references
  const canvas = canvasRef.current;
  const parent = canvas.parentNode;

  //get size of container
  const styles = getComputedStyle(parent);
  const parentWidth = parseInt(styles.getPropertyValue('width'), 10);
  const parentHeight = parseInt(styles.getPropertyValue('height'), 10);

  //rezize canvas in line with parent container
  canvas.width = parentWidth;
  canvas.height = parentHeight;

  //position the particle origin at centre of canvas
  window.CanvasUtils.originx = canvas.width / 2;
  window.CanvasUtils.originy = canvas.height / 2;
}

//init
export function canvasInit(canvasRef) {
  window.CanvasUtils = {};
  resizeCanvas(canvasRef);

  const resizeFunc = resizeCanvas.bind(null, canvasRef);

  const mousemoveFunc = (e) => {
    const mouse = getMousePos(canvasRef, e);
    window.CanvasUtils.originx = mouse.x;
    window.CanvasUtils.originy = mouse.y;
  };

  window.addEventListener('resize', resizeFunc, false);
  window.addEventListener('mousemove', mousemoveFunc);

  var network = new Field(0, 0, 100, canvasRef);
  var emit = new Emitter(0, 0, 100, undefined, null, canvasRef);

  const callback = function () {
    network.animate();
    emit.animate();
  };

  return {
    callback,
    resizeFunc,
    mousemoveFunc,
  };
}
