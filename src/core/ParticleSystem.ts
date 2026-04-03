import { Particle, ParticleShape } from './Particle';
import { IBehavior } from '../behaviors/IBehavior';
import { FollowMouseBehavior } from '../behaviors/FollowMouseBehavior';
import { GravityBehavior } from '../behaviors/GravityBehavior';
import { RepulseBehavior } from '../behaviors/RepulseBehavior';
import { MagneticFieldBehavior } from '../behaviors/MagneticFieldBehavior';
import { VortexBehavior } from '../behaviors/VortexBehavior';
import { WaveBehavior } from '../behaviors/WaveBehavior';
import { ExplosionBehavior } from '../behaviors/ExplosionBehavior';
import { ConfigLoader, ParticleConfig } from '../loaders/ConfigLoader';

export interface ParticleSystemConfig {
  canvasId?: string;
  canvas?: HTMLCanvasElement;
  config?: ParticleConfig;
  presetId?: string;
  apiUrl?: string;
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private behavior: IBehavior;
  private configLoader: ConfigLoader;
  private animationId: number | null = null;
  private isRunning: boolean = false;
  private currentBehaviorName: string = 'followMouse';
  private gravityBehavior: GravityBehavior | null = null;
  private isMouseDown: boolean = false;
  private explosionBehavior: ExplosionBehavior | null = null;
  private canvasBgColor: string = 'black';
  
  private targetFps: number = 60;
  private lastTimestamp: number = 0;
  private frameInterval: number = 1000 / 60;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private actualFps: number = 0;

  constructor() {
    this.behavior = new FollowMouseBehavior();
    this.configLoader = new ConfigLoader();
  }

  setTargetFps(fps: number): void {
    this.targetFps = Math.max(15, Math.min(120, fps));
    this.frameInterval = 1000 / this.targetFps;
  }

  getActualFps(): number {
    return this.actualFps;
  }

  async initWithPreset(
    canvas: HTMLCanvasElement, 
    presetId: string, 
    options?: { apiUrl?: string }
  ): Promise<void> {
    if (options?.apiUrl) {
      this.configLoader.setApiUrl(options.apiUrl);
    }
    
    const config = await this.configLoader.loadRemote(presetId);
    return this.init({ canvas, config });
  }

  async init(config: ParticleSystemConfig): Promise<void> {
    if (config.canvas) {
      this.canvas = config.canvas;
    } else if (config.canvasId) {
      const canvas = document.getElementById(config.canvasId) as HTMLCanvasElement;
      if (!canvas) throw new Error('Canvas with id ' + config.canvasId + ' not found');
      this.canvas = canvas;
    } else {
      throw new Error('Either canvasId or canvas element must be provided');
    }

    const hasParentContainer = this.canvas.parentElement !== document.body;
    
    if (!hasParentContainer) {
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '50%';
      this.canvas.style.left = '50%';
      this.canvas.style.transform = 'translate(-50%, -50%)';
      document.body.style.overflow = 'hidden';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.backgroundColor = 'black';
    }
    
    this.canvas.style.border = '1px solid black';
    
    if (!hasParentContainer) {
      this.resizeCanvas();
    }
    
    this.ctx = this.canvas.getContext('2d')!;
    
    let particleConfig: ParticleConfig = config.config!;
    this.createParticles(particleConfig);
    
    if (particleConfig.behavior) {
      this.setBehavior(particleConfig.behavior, particleConfig.behaviorParams);
    }
    
    this.setupMouseListeners();
    this.start();
  }

  private resizeCanvas(): void {
    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.8;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private createParticles(config: ParticleConfig): void {
    this.particles = [];
    const shape = (config.shape as ParticleShape) || 'square';
    const initSpeed = config.initSpeed ?? 1.5;
    
    for (let i = 0; i < config.particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const vx = (Math.random() - 0.5) * initSpeed;
      const vy = (Math.random() - 0.5) * initSpeed;
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];
      const size = config.particleSize;
      this.particles.push(new Particle(x, y, vx, vy, size, color, shape));
    }
  }

  setBackgroundColor(color: string): void {
    this.canvasBgColor = color;
  }

  setBorderRadius(radius: string): void {
    this.canvas.style.borderRadius = radius;
  }

  setCanvasSize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    const currentCount = this.particles.length;
    const currentSize = this.particles[0]?.size || 4;
    const currentColors = [...new Set(this.particles.map(p => p.color))];
    const currentShape = this.particles[0]?.shape || 'square';
    this.createParticles({
      particleCount: currentCount,
      colors: currentColors,
      particleSize: currentSize,
      maxSpeed: 2,
      behavior: this.currentBehaviorName,
      shape: currentShape,
      initSpeed: 1.5
    });
  }

  updateParticleParams(params: { shape?: ParticleShape; initSpeed?: number }): void {
    for (const p of this.particles) {
      if (params.shape !== undefined) p.shape = params.shape;
    }
  }

  setBehavior(behaviorName: string, params?: any): void {
    this.currentBehaviorName = behaviorName;
    this.isMouseDown = false;
    
    switch (behaviorName) {
      case 'gravity':
        this.gravityBehavior = new GravityBehavior(
          params?.strength ?? 0.1,
          params?.maxSpeed ?? 4
        );
        this.behavior = this.gravityBehavior;
        break;
      case 'repulse':
        this.behavior = new RepulseBehavior(
          params?.radius ?? 150,
          params?.force ?? 3.0,
          params?.damping ?? 0.97,
          params?.minSpeed ?? 0.2
        );
        break;
      case 'magneticField':
        this.behavior = new MagneticFieldBehavior(
          params?.strength ?? 0.02,
          params?.fieldStrength ?? 1.5,
          params?.radius ?? 200,
          params?.maxSpeed ?? 4
        );
        break;
      case 'vortex':
        this.behavior = new VortexBehavior(
          params?.strength ?? 0.15,
          params?.radius ?? 200,
          params?.maxSpeed ?? 4
        );
        break;
      case 'wave':
        this.behavior = new WaveBehavior(
          params?.amplitude ?? 0.8,
          params?.frequency ?? 0.015,
          params?.speed ?? 0.03,
          params?.maxSpeed ?? 3
        );
        break;
      case 'explosion':
        this.explosionBehavior = new ExplosionBehavior(
          params?.radius ?? 150,
          params?.duration ?? 10,
          params?.damping ?? 0.99
        );
        this.behavior = this.explosionBehavior;
        break;
      case 'followMouse':
      default:
        this.behavior = new FollowMouseBehavior(params?.speed ?? 2);
        break;
    }
  }

  private setupMouseListeners(): void {
    this.canvas.addEventListener('mousedown', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      if (this.currentBehaviorName === 'gravity' && this.gravityBehavior) {
        this.gravityBehavior.setCenter(mouseX, mouseY);
        this.isMouseDown = true;
      } else {
        this.isMouseDown = false;
      }
    });

    this.canvas.addEventListener('mousemove', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      if (this.currentBehaviorName === 'gravity' && this.gravityBehavior && this.isMouseDown) {
        this.gravityBehavior.setCenter(mouseX, mouseY);
      } else if (this.currentBehaviorName !== 'gravity') {
        this.behavior.apply(this.particles, mouseX, mouseY);
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      if (this.currentBehaviorName === 'gravity' && this.gravityBehavior) {
        this.gravityBehavior.clearCenter();
        this.isMouseDown = false;
      }
    });

    this.canvas.addEventListener('click', (event) => {
      if (this.currentBehaviorName === 'explosion' && this.explosionBehavior) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        this.explosionBehavior.explode(mouseX, mouseY, 8);
      }
    });
  }

  private animate = (timestamp: number): void => {
    if (!this.isRunning) return;
    
    const deltaTime = timestamp - this.lastTimestamp;
    if (deltaTime >= this.frameInterval) {
      this.frameCount++;
      
      this.ctx.fillStyle = this.canvasBgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.behavior.apply(this.particles);
      
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update();
        
        if (this.particles[i].x > this.canvas.width) this.particles[i].x = -this.particles[i].size;
        if (this.particles[i].x < -this.particles[i].size) this.particles[i].x = this.canvas.width;
        if (this.particles[i].y > this.canvas.height) this.particles[i].y = -this.particles[i].size;
        if (this.particles[i].y < -this.particles[i].size) this.particles[i].y = this.canvas.height;
        
        this.particles[i].draw(this.ctx);
      }
      
      this.lastTimestamp = timestamp;
    }
    
    if (timestamp - this.lastFpsUpdate >= 1000) {
      this.actualFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = timestamp;
    }
    
    this.animationId = requestAnimationFrame(this.animate);
  };

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = 0;
    this.lastFpsUpdate = 0;
    this.frameCount = 0;
    this.animationId = requestAnimationFrame(this.animate);
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
  }

  destroy(): void {
    this.stop();
    this.particles = [];
  }
}