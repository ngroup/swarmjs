module SwarmJS {

    type Vector = number[];


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
            var speed_x: number = 0.8 * this.speed[0] + 2 * Math.random() * (this.best[0] - this.location[0]) + 2 * Math.random() * (globalBest[0] - this.location[0]);
            var speed_y: number = 0.8 * this.speed[1] + 2 * Math.random() * (this.best[1] - this.location[1]) + 2 * Math.random() * (globalBest[1] - this.location[1]);
            speed_x = clip(-1 * speed, speed, speed_x);
            speed_y = clip(-1 * speed, speed, speed_y);
            this.speed = [speed_x, speed_y];
            this.location = [this.location[0] + this.speed[0], this.location[1] + this.speed[1]]
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
                var loc: Vector = [rand(xMin, xMax), rand(yMin, yMax)];
                this.particles.push(new Particle(loc));
            };
        }

        initializeValue(tf: TargetFunc, particleSpeed: number) {
            // initialize particle value
            this.particles.map(function(part) {
                // initialize location
                var fitness: number = tf.evaluate([part.location[0], part.location[1]]);
                part.fitness = fitness;
                part.best = part.location;
                part.best_fitness = fitness;
                // initialize speed
                var speed: Vector = [rand(-particleSpeed, particleSpeed), rand(-particleSpeed, particleSpeed)];
                part.speed = speed;
            });

            this.best = this.particles[0].best;
            this.best_fitness = this.particles[0].best_fitness;
            this.updateGlobalBest();
        }

        updateGlobalBest() {
            for (let p of this.particles) {
                var part_fitness: number = p.best_fitness;
                if (part_fitness < this.best_fitness) {
                    this.best_fitness = part_fitness;
                    this.best = p.best;
                }
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
            var val: number = Math.pow(loc[0] - this.origin[0], 2) + Math.pow(loc[1] - this.origin[1], 2);
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
                var speed_x: number = thisopt.omega * p.speed[0] + thisopt.c1 * Math.random() * (p.best[0] - p.location[0]) + thisopt.c2 * Math.random() * (globalBest[0] - p.location[0]);
                var speed_y: number = thisopt.omega * p.speed[1] + thisopt.c1 * Math.random() * (p.best[1] - p.location[1]) + thisopt.c2 * Math.random() * (globalBest[1] - p.location[1]);
                speed_x = clip(thisopt.vmin, thisopt.vmax, speed_x);
                speed_y = clip(thisopt.vmin, thisopt.vmax, speed_y);
                p.speed = [speed_x, speed_y];
                p.location = [p.location[0] + p.speed[0], p.location[1] + p.speed[1]];
                var fitness = thisopt.tf.evaluate([p.location[0], p.location[1]]);
                p.fitness = fitness;
                if (fitness <= p.best_fitness) {
                    p.best = p.location;
                    p.best_fitness = fitness;
                }
            });

            this.swarm.updateGlobalBest();

        }
    };

}