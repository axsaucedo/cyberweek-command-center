interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'confetti' | 'spark' | 'ember';
  rotation: number;
  rotationSpeed: number;
}

class ParticleEngineImpl {
  particles: Particle[] = [];
  private intensity = 0.8;
  private listeners: (() => void)[] = [];

  setIntensity(val: number) {
    this.intensity = val;
  }

  getIntensity() {
    return this.intensity;
  }

  onChange(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    for (const cb of this.listeners) cb();
  }

  emitConfettiRain(count: number, colors: string[]) {
    const actualCount = Math.ceil(count * this.intensity);
    for (let i = 0; i < actualCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 200,
        vy: 150 + Math.random() * 200,
        life: 2 + Math.random() * 2,
        maxLife: 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        type: 'confetti',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    this.notify();
  }

  emitSparks(x: number, y: number, count: number, color: string) {
    const actualCount = Math.ceil(count * this.intensity);
    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        color,
        size: 1.5 + Math.random() * 2,
        type: 'spark',
        rotation: 0,
        rotationSpeed: 0,
      });
    }
    this.notify();
  }

  emitEmbers(x: number, y: number, count: number, color: string) {
    const actualCount = Math.ceil(count * this.intensity);
    for (let i = 0; i < actualCount; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y,
        vx: (Math.random() - 0.5) * 20,
        vy: -(30 + Math.random() * 60),
        life: 0.8 + Math.random() * 1.2,
        maxLife: 2,
        color,
        size: 2 + Math.random() * 3,
        type: 'ember',
        rotation: 0,
        rotationSpeed: 0,
      });
    }
    this.notify();
  }

  update(dt: number) {
    let i = this.particles.length;
    while (i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.rotation += p.rotationSpeed * dt;

      if (p.type === 'confetti') {
        p.vy += 100 * dt;
        p.vx *= 0.99;
      }

      if (p.life <= 0 || p.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
      }
    }
  }
}

export const particleEngine = new ParticleEngineImpl();
