class f {
  // форма
  constructor(i, t, s, e, n, o, h = "square") {
    this.x = i, this.y = t, this.vx = s, this.vy = e, this.size = n, this.color = o, this.shape = h;
  }
  // Обновление позиции по скорости
  update() {
    this.x += this.vx, this.y += this.vy;
  }
  // Отрисовка частицы в зависимости от формы
  draw(i) {
    switch (i.fillStyle = this.color, this.shape) {
      case "circle":
        i.beginPath(), i.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2), i.fill();
        break;
      case "triangle":
        i.beginPath();
        const t = this.size * Math.sqrt(3) / 2;
        i.moveTo(this.x, this.y - t / 2), i.lineTo(this.x - this.size / 2, this.y + t / 2), i.lineTo(this.x + this.size / 2, this.y + t / 2), i.fill();
        break;
      case "square":
      default:
        i.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        break;
    }
  }
}
class x {
  constructor(i = 4) {
    this.speed = i;
  }
  apply(i, t, s) {
    if (!(t === void 0 || s === void 0))
      for (const e of i) {
        const n = t - e.x, o = s - e.y;
        let h = n * n + o * o;
        h > 0 && (h = Math.sqrt(h), e.vx = n / h * this.speed, e.vy = o / h * this.speed);
      }
  }
}
class p {
  constructor(i = 0.1, t = 4) {
    this.strength = i, this.maxSpeed = t, this.centerX = null, this.centerY = null;
  }
  // Установка центра притяжения
  setCenter(i, t) {
    this.centerX = i, this.centerY = t;
  }
  // Очистка центра (частицы разлетаются)
  clearCenter() {
    this.centerX = null, this.centerY = null;
  }
  apply(i) {
    if (!(this.centerX === null || this.centerY === null))
      for (const t of i) {
        const s = this.centerX - t.x, e = this.centerY - t.y, n = Math.hypot(s, e);
        if (n > 0) {
          const o = this.strength * n, h = s / n, c = e / n;
          t.vx += h * o, t.vy += c * o;
          const r = Math.hypot(t.vx, t.vy);
          r > this.maxSpeed && (t.vx = t.vx / r * this.maxSpeed, t.vy = t.vy / r * this.maxSpeed);
        }
      }
  }
}
class g {
  // Минимальная скорость, ниже которой не тормозим
  constructor(i = 550, t = 5, s = 0.97, e = 1) {
    this.radius = i, this.force = t, this.damping = s, this.minSpeed = e;
  }
  apply(i, t, s) {
    for (const e of i)
      Math.hypot(e.vx, e.vy) > this.minSpeed && (e.vx *= this.damping, e.vy *= this.damping);
    if (!(t === void 0 || s === void 0))
      for (const e of i) {
        const n = e.x - t, o = e.y - s, h = Math.hypot(n, o);
        if (h < this.radius && h > 0) {
          const c = (1 - h / this.radius) * this.force, r = n / h, l = o / h;
          e.vx += r * c, e.vy += l * c;
        }
      }
  }
}
class w {
  constructor(i = 0.02, t = 1.5, s = 200, e = 4) {
    this.strength = i, this.fieldStrength = t, this.radius = s, this.maxSpeed = e;
  }
  apply(i, t, s) {
    for (const e of i) {
      let n = Math.sin(e.y * 0.01) * this.strength, o = Math.cos(e.x * 0.01) * this.strength;
      if (t !== void 0 && s !== void 0) {
        const c = t - e.x, r = s - e.y, l = Math.hypot(c, r);
        if (l < this.radius && l > 0) {
          const d = (1 - l / this.radius) * this.fieldStrength, v = c / l, u = r / l;
          n += v * d, o += u * d;
        }
      }
      e.vx += n, e.vy += o;
      const h = Math.hypot(e.vx, e.vy);
      h > this.maxSpeed && (e.vx = e.vx / h * this.maxSpeed, e.vy = e.vy / h * this.maxSpeed);
    }
  }
}
class S {
  // Максимальная скорость
  constructor(i = 0.15, t = 200, s = 5) {
    this.strength = i, this.radius = t, this.maxSpeed = s;
  }
  apply(i, t, s) {
    if (!(t === void 0 || s === void 0))
      for (const e of i) {
        const n = e.x - t, o = e.y - s, h = Math.hypot(n, o);
        if (h < this.radius && h > 0) {
          const r = -o / h, l = n / h, d = (1 - h / this.radius) * this.strength;
          e.vx += r * d, e.vy += l * d;
          const v = (t - e.x) * 0.01, u = (s - e.y) * 0.01;
          e.vx += v, e.vy += u;
        }
        const c = Math.hypot(e.vx, e.vy);
        c > this.maxSpeed && (e.vx = e.vx / c * this.maxSpeed, e.vy = e.vy / c * this.maxSpeed);
      }
  }
}
let y = 0;
class b {
  // Максимальная скорость частиц
  constructor(i = 0.8, t = 0.015, s = 0.03, e = 3) {
    this.amplitude = i, this.frequency = t, this.speed = s, this.maxSpeed = e;
  }
  apply(i) {
    y += this.speed;
    for (const t of i) {
      let s = Math.sin(t.y * this.frequency + y) * this.amplitude, e = Math.cos(t.x * this.frequency + y * 0.5) * this.amplitude;
      t.vx += s, t.vy += e;
      const n = Math.hypot(t.vx, t.vy);
      n > this.maxSpeed && (t.vx = t.vx / n * this.maxSpeed, t.vy = t.vy / n * this.maxSpeed);
    }
  }
}
class B {
  constructor(i = 150, t = 10, s = 0.99) {
    this.explosionX = null, this.explosionY = null, this.explosionTimer = 0, this.explosionStrength = 0, this.explosionRadius = i, this.explosionDuration = t, this.damping = s;
  }
  // Вызов взрыва (из ParticleSystem)
  explode(i, t, s = 8) {
    this.explosionX = i, this.explosionY = t, this.explosionStrength = s, this.explosionTimer = this.explosionDuration;
  }
  apply(i, t, s) {
    if (this.explosionX !== null && this.explosionTimer > 0) {
      for (const e of i) {
        const n = e.x - this.explosionX, o = e.y - this.explosionY, h = Math.hypot(n, o);
        if (h < this.explosionRadius && h > 0) {
          const c = (1 - h / this.explosionRadius) * this.explosionStrength, r = n / h, l = o / h;
          e.vx += r * c, e.vy += l * c;
        }
      }
      this.explosionTimer--, this.explosionTimer === 0 && (this.explosionX = null, this.explosionY = null);
    }
    for (const e of i)
      e.vx *= this.damping, e.vy *= this.damping, Math.hypot(e.vx, e.vy) < 0.05 && (e.vx = 0, e.vy = 0);
  }
}
class M {
  constructor(i) {
    this.apiUrl = i;
  }
  setApiUrl(i) {
    this.apiUrl = i;
  }
  loadLocal(i) {
    return i;
  }
  async loadRemote(i) {
    if (!this.apiUrl)
      throw new Error("API URL is not configured");
    const t = await fetch(`${this.apiUrl}/presets/public/${i}`);
    if (!t.ok)
      throw new Error(`Failed to load preset: ${t.statusText}`);
    return (await t.json()).config;
  }
}
class C {
  constructor() {
    this.particles = [], this.animationId = null, this.isRunning = !1, this.currentBehaviorName = "followMouse", this.gravityBehavior = null, this.isMouseDown = !1, this.explosionBehavior = null, this.canvasBgColor = "black", this.targetFps = 60, this.lastTimestamp = 0, this.frameInterval = 1e3 / 60, this.frameCount = 0, this.lastFpsUpdate = 0, this.actualFps = 0, this.animate = (i) => {
      if (!this.isRunning) return;
      if (i - this.lastTimestamp >= this.frameInterval) {
        this.frameCount++, this.ctx.fillStyle = this.canvasBgColor, this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.behavior.apply(this.particles);
        for (let s = 0; s < this.particles.length; s++)
          this.particles[s].update(), this.particles[s].x > this.canvas.width && (this.particles[s].x = -this.particles[s].size), this.particles[s].x < -this.particles[s].size && (this.particles[s].x = this.canvas.width), this.particles[s].y > this.canvas.height && (this.particles[s].y = -this.particles[s].size), this.particles[s].y < -this.particles[s].size && (this.particles[s].y = this.canvas.height), this.particles[s].draw(this.ctx);
        this.lastTimestamp = i;
      }
      i - this.lastFpsUpdate >= 1e3 && (this.actualFps = this.frameCount, this.frameCount = 0, this.lastFpsUpdate = i), this.animationId = requestAnimationFrame(this.animate);
    }, this.behavior = new x(), this.configLoader = new M();
  }
  setTargetFps(i) {
    this.targetFps = Math.max(15, Math.min(120, i)), this.frameInterval = 1e3 / this.targetFps;
  }
  getActualFps() {
    return this.actualFps;
  }
  async initWithPreset(i, t, s) {
    s != null && s.apiUrl && this.configLoader.setApiUrl(s.apiUrl);
    const e = await this.configLoader.loadRemote(t);
    return this.init({ canvas: i, config: e });
  }
  async init(i) {
    if (i.canvas)
      this.canvas = i.canvas;
    else if (i.canvasId) {
      const e = document.getElementById(i.canvasId);
      if (!e) throw new Error("Canvas with id " + i.canvasId + " not found");
      this.canvas = e;
    } else
      throw new Error("Either canvasId or canvas element must be provided");
    const t = this.canvas.parentElement !== document.body;
    t || (this.canvas.style.position = "absolute", this.canvas.style.top = "50%", this.canvas.style.left = "50%", this.canvas.style.transform = "translate(-50%, -50%)", document.body.style.overflow = "hidden", document.body.style.margin = "0", document.body.style.padding = "0", document.body.style.backgroundColor = "black"), this.canvas.style.border = "1px solid black", t || this.resizeCanvas(), this.ctx = this.canvas.getContext("2d");
    let s = i.config;
    this.createParticles(s), s.behavior && this.setBehavior(s.behavior, s.behaviorParams), this.setupMouseListeners(), this.start();
  }
  resizeCanvas() {
    const i = window.innerWidth * 0.9, t = window.innerHeight * 0.8;
    this.canvas.width = i, this.canvas.height = t;
  }
  createParticles(i) {
    this.particles = [];
    const t = i.shape || "square", s = i.initSpeed ?? 1.5;
    for (let e = 0; e < i.particleCount; e++) {
      const n = Math.random() * this.canvas.width, o = Math.random() * this.canvas.height, h = (Math.random() - 0.5) * s, c = (Math.random() - 0.5) * s, r = i.colors[Math.floor(Math.random() * i.colors.length)], l = i.particleSize;
      this.particles.push(new f(n, o, h, c, l, r, t));
    }
  }
  setBackgroundColor(i) {
    this.canvasBgColor = i;
  }
  setBorderRadius(i) {
    this.canvas.style.borderRadius = i;
  }
  setCanvasSize(i, t) {
    var h, c;
    this.canvas.width = i, this.canvas.height = t;
    const s = this.particles.length, e = ((h = this.particles[0]) == null ? void 0 : h.size) || 4, n = [...new Set(this.particles.map((r) => r.color))], o = ((c = this.particles[0]) == null ? void 0 : c.shape) || "square";
    this.createParticles({
      particleCount: s,
      colors: n,
      particleSize: e,
      maxSpeed: 2,
      behavior: this.currentBehaviorName,
      shape: o,
      initSpeed: 1.5
    });
  }
  updateParticleParams(i) {
    for (const t of this.particles)
      i.shape !== void 0 && (t.shape = i.shape);
  }
  setBehavior(i, t) {
    switch (this.currentBehaviorName = i, this.isMouseDown = !1, i) {
      case "gravity":
        this.gravityBehavior = new p(
          (t == null ? void 0 : t.strength) ?? 0.1,
          (t == null ? void 0 : t.maxSpeed) ?? 4
        ), this.behavior = this.gravityBehavior;
        break;
      case "repulse":
        this.behavior = new g(
          (t == null ? void 0 : t.radius) ?? 150,
          (t == null ? void 0 : t.force) ?? 3,
          (t == null ? void 0 : t.damping) ?? 0.97,
          (t == null ? void 0 : t.minSpeed) ?? 0.2
        );
        break;
      case "magneticField":
        this.behavior = new w(
          (t == null ? void 0 : t.strength) ?? 0.02,
          (t == null ? void 0 : t.fieldStrength) ?? 1.5,
          (t == null ? void 0 : t.radius) ?? 200,
          (t == null ? void 0 : t.maxSpeed) ?? 4
        );
        break;
      case "vortex":
        this.behavior = new S(
          (t == null ? void 0 : t.strength) ?? 0.15,
          (t == null ? void 0 : t.radius) ?? 200,
          (t == null ? void 0 : t.maxSpeed) ?? 4
        );
        break;
      case "wave":
        this.behavior = new b(
          (t == null ? void 0 : t.amplitude) ?? 0.8,
          (t == null ? void 0 : t.frequency) ?? 0.015,
          (t == null ? void 0 : t.speed) ?? 0.03,
          (t == null ? void 0 : t.maxSpeed) ?? 3
        );
        break;
      case "explosion":
        this.explosionBehavior = new B(
          (t == null ? void 0 : t.radius) ?? 150,
          (t == null ? void 0 : t.duration) ?? 10,
          (t == null ? void 0 : t.damping) ?? 0.99
        ), this.behavior = this.explosionBehavior;
        break;
      case "followMouse":
      default:
        this.behavior = new x((t == null ? void 0 : t.speed) ?? 2);
        break;
    }
  }
  setupMouseListeners() {
    this.canvas.addEventListener("mousedown", (i) => {
      const t = this.canvas.getBoundingClientRect(), s = i.clientX - t.left, e = i.clientY - t.top;
      this.currentBehaviorName === "gravity" && this.gravityBehavior ? (this.gravityBehavior.setCenter(s, e), this.isMouseDown = !0) : this.isMouseDown = !1;
    }), this.canvas.addEventListener("mousemove", (i) => {
      const t = this.canvas.getBoundingClientRect(), s = i.clientX - t.left, e = i.clientY - t.top;
      this.currentBehaviorName === "gravity" && this.gravityBehavior && this.isMouseDown ? this.gravityBehavior.setCenter(s, e) : this.currentBehaviorName !== "gravity" && this.behavior.apply(this.particles, s, e);
    }), this.canvas.addEventListener("mouseup", () => {
      this.currentBehaviorName === "gravity" && this.gravityBehavior && (this.gravityBehavior.clearCenter(), this.isMouseDown = !1);
    }), this.canvas.addEventListener("click", (i) => {
      if (this.currentBehaviorName === "explosion" && this.explosionBehavior) {
        const t = this.canvas.getBoundingClientRect(), s = i.clientX - t.left, e = i.clientY - t.top;
        this.explosionBehavior.explode(s, e, 8);
      }
    });
  }
  start() {
    this.isRunning || (this.isRunning = !0, this.lastTimestamp = 0, this.lastFpsUpdate = 0, this.frameCount = 0, this.animationId = requestAnimationFrame(this.animate));
  }
  stop() {
    this.animationId && (cancelAnimationFrame(this.animationId), this.animationId = null), this.isRunning = !1;
  }
  destroy() {
    this.stop(), this.particles = [];
  }
}
class z {
  constructor(i) {
    const t = i.getContext("2d");
    if (!t) throw new Error("Cannot get canvas context");
    this.ctx = t, this.width = i.width, this.height = i.height;
  }
  render(i) {
    this.ctx.fillStyle = "black", this.ctx.fillRect(0, 0, this.width, this.height);
    for (const t of i)
      t.draw(this.ctx);
  }
  resize(i, t) {
    this.width = i, this.height = t;
  }
}
export {
  M as ConfigLoader,
  B as ExplosionBehavior,
  x as FollowMouseBehavior,
  p as GravityBehavior,
  w as MagneticFieldBehavior,
  f as Particle,
  C as ParticleSystem,
  z as Renderer,
  g as RepulseBehavior,
  S as VortexBehavior,
  b as WaveBehavior
};
