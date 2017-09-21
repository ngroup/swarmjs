module SwarmJS {

    interface Vector {
        x: number;
        y: number;
    }


    function rand(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }


    function clip(min: number, max: number, speed: number) {
        if (speed >= max) {
            speed = max;
        } else if (speed <= min) {
            speed = min;
        }
        return speed;
    };


    export class Particle {
        location: Vector;
        speed: Vector;
        fitness: number;
        best: Vector;
        best_fitness: number;

        constructor(origin: Vector) {
            this.location = origin;
            this.speed = null;
            this.fitness = null;
            this.best = null;
            this.best_fitness = null;
        }

        move(globalBest: Vector, speed: number) {
            var speed_x: number = 0.8 * this.speed.x + 2 * Math.random() * (this.best.x - this.location.x) + 2 * Math.random() * (globalBest.x - this.location.x);
            var speed_y: number = 0.8 * this.speed.y + 2 * Math.random() * (this.best.y - this.location.y) + 2 * Math.random() * (globalBest.y - this.location.y);
            speed_x = clip(-1 * speed, speed, speed_x);
            speed_y = clip(-1 * speed, speed, speed_y);
            this.speed = { x: speed_x, y: speed_y };
            this.location = { x: this.location.x + this.speed.x, y: this.location.y + this.speed.y }
        }
    }


    export class Swarm {
        particles: Particle[];
        particleNumber: number;
        best: Vector;
        best_fitness: number;

        constructor(particleNumber: number) {
            this.particles = new Array();
            this.particleNumber = particleNumber;
            this.best = null;
            this.best_fitness = null;
        }

        initialize(xMin: number, xMax: number, yMin: number, yMax: number) {
            for (var i = 0; i < this.particleNumber; i++) {
                var loc: Vector = { x: rand(xMin, xMax), y: rand(yMin, yMax) };
                this.particles.push(new Particle(loc));
            };
        }

        initializeValue(tf: TargetFunc, particleSpeed: number) {
            // initialize particle value
            this.particles.map(function(part) {
                // initialize location
                var fitness: number = tf.evaluate(part.location);
                part.fitness = fitness;
                part.best = part.location;
                part.best_fitness = fitness;
                // initialize speed
                var speed: Vector = { x: rand(-particleSpeed, particleSpeed), y: rand(-particleSpeed, particleSpeed) };
                part.speed = speed;
            });

            this.best = this.particles[0].best;
            this.best_fitness = this.particles[0].best_fitness;

            for (let p of this.particles) {
                var part_fitness: number = p.best_fitness;
                if (part_fitness < this.best_fitness) {
                    this.best_fitness = p.best_fitness;
                    this.best = p.best;
                };
            };
        }

    }


    export class TargetFunc {
        origin: Vector;
        r: number;

        constructor(origin: Vector, r: number) {
            this.origin = origin;
            this.r = r;
        }

        evaluate(loc: Vector) {
            var val: number = Math.pow(loc.x - this.origin.x, 2) + Math.pow(loc.y - this.origin.y, 2);
            return val
        }
    }


    export class Optimizer {
        swarm: Swarm;
        tf: TargetFunc;
        omega: number;
        c1: number;
        c2: number;
        vmax: number;
        vmin: number;

        constructor(swarm: Swarm, tf: TargetFunc,
            omega: number, c1: number, c2: number, vmax: number, vmin: number) {
            this.swarm = swarm;
            this.tf = tf;
            this.omega = omega;
            this.c1 = c1;
            this.c2 = c2;
            this.vmax = vmax;
            this.vmin = vmin;
        }

        update() {
            var globalBest: Vector = this.swarm.best;
            var thisopt = this;

            this.swarm.particles.map(function(p) {
                var speed_x: number = 0.8 * p.speed.x + 2 * Math.random() * (p.best.x - p.location.x) + 2 * Math.random() * (globalBest.x - p.location.x);
                var speed_y: number = 0.8 * p.speed.y + 2 * Math.random() * (p.best.y - p.location.y) + 2 * Math.random() * (globalBest.y - p.location.y);
                speed_x = clip(thisopt.vmin, thisopt.vmax, speed_x);
                speed_y = clip(thisopt.vmin, thisopt.vmax, speed_y);
                p.speed = { x: speed_x, y: speed_y };
                p.location = { x: p.location.x + p.speed.x, y: p.location.y + p.speed.y };
                var fitness = thisopt.tf.evaluate(p.location);
                p.fitness = fitness;
                if (fitness <= p.best_fitness) {
                    p.best = p.location;
                    p.best_fitness = fitness;
                }
            });
            for (let p of this.swarm.particles) {
                var part_fitness: number = p.best_fitness;
                if (part_fitness < this.swarm.best_fitness) {
                    this.swarm.best_fitness = part_fitness;
                    this.swarm.best = p.best;
                }
            };
        }
    };

}