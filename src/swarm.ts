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
                var fitness: number = tf.evaluate(part.location);
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
        dimensions: number;
        swarm: Swarm;
        tf: TargetFunc;
        omega: number;
        c1: number;
        c2: number;
        vmax: number;
        vmin: number;

        constructor(swarm: Swarm, tf: TargetFunc,
            omega: number, c1: number, c2: number, vmax: number, vmin: number) {
            this.dimensions = 2;
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
            var thisparticles = this.swarm.particles

            for (var pi = 0; pi < this.swarm.particleNumber; pi++) {
                var new_loc = [0, 0]
                for (var xi = 0; xi < thisopt.dimensions; xi++) {
                    var pspeed: number = thisopt.omega * thisparticles[pi].speed[xi] + thisopt.c1 * Math.random() * (thisparticles[pi].best[xi] - thisparticles[pi].location[xi]) + thisopt.c2 * Math.random() * (globalBest[xi] - thisparticles[pi].location[xi]);
                    pspeed = clip(thisopt.vmin, thisopt.vmax, pspeed);
                    thisparticles[pi].speed[xi] = pspeed;
                    new_loc[xi] = thisparticles[pi].location[xi] + pspeed;
                }
                thisparticles[pi].location = new_loc;
                var fitness = thisopt.tf.evaluate(thisparticles[pi].location);
                thisparticles[pi].fitness = fitness;
                if (fitness <= thisparticles[pi].best_fitness) {
                    thisparticles[pi].best = thisparticles[pi].location;
                    thisparticles[pi].best_fitness = fitness;
                }
            }
            this.swarm.updateGlobalBest();
        }
    };

}