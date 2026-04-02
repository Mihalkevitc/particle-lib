import { Particle } from '../core/Particle';
import { IBehavior } from './IBehavior';

/**
 * Гравитационное поведение с движущимся центром притяжения.
 * 
 * При клике мыши: в точке курсора создаётся гравитационный центр.
 * При движении мыши с зажатой кнопкой: центр перемещается.
 * Частицы притягиваются к этому центру, образуя движущийся шар.
 */
export class GravityBehavior implements IBehavior {
  private strength: number;      // Сила притяжения
  private maxSpeed: number;      // Максимальная скорость частиц
  private centerX: number | null; // Координаты центра притяжения
  private centerY: number | null;

  constructor(strength: number = 0.1, maxSpeed: number = 4) {
    this.strength = strength;
    this.maxSpeed = maxSpeed;
    this.centerX = null;
    this.centerY = null;
  }

  // Установка центра притяжения
  setCenter(x: number, y: number): void {
    this.centerX = x;
    this.centerY = y;
  }

  // Очистка центра (частицы разлетаются)
  clearCenter(): void {
    this.centerX = null;
    this.centerY = null;
  }

  apply(particles: Particle[]): void {
    // Если нет активного центра - ничего не делаем, частицы летят по инерции
    if (this.centerX === null || this.centerY === null) return;

    for (const p of particles) {
      const dx = this.centerX - p.x;
      const dy = this.centerY - p.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance > 0) {
        // Сила тем больше, чем дальше частица от центра
        const force = this.strength * distance;
        const nx = dx / distance;
        const ny = dy / distance;
        
        p.vx += nx * force;
        p.vy += ny * force;
        
        // Ограничиваем скорость
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > this.maxSpeed) {
          p.vx = (p.vx / speed) * this.maxSpeed;
          p.vy = (p.vy / speed) * this.maxSpeed;
        }
      }
    }
  }
}
