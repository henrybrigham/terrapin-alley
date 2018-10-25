import React from 'react';
import decomp from 'poly-decomp';
import Matter, { Engine, World, Bodies, Svg, Vertices } from 'matter-js';
// import PropTypes from 'prop-types';

const propTypes = {

};

const PATHS = {
  DOME: '0 0 0 250 19 250 20 231.9 25.7 196.1 36.9 161.7 53.3 129.5 74.6 100.2 100.2 74.6 129.5 53.3 161.7 36.9 196.1 25.7 231.9 20 268.1 20 303.9 25.7 338.3 36.9 370.5 53.3 399.8 74.6 425.4 100.2 446.7 129.5 463.1 161.7 474.3 196.1 480 231.9 480 250 500 250 500 0 0 0',
  DROP_LEFT: '0 0 20 0 70 100 20 150 0 150 0 0',
  DROP_RIGHT: '50 0 68 0 68 150 50 150 0 100 50 0',
  APRON_LEFT: '0 0 180 120 0 120 0 0',
  APRON_RIGHT: '180 0 180 120 0 120 180 0'
};

const COLOR = {
  BACKGROUND: '#212529',
  OUTER: '#495057',
  INNER: '#15aabf',
  BUMPER: '#fab005',
  BUMPER_LIT: '#fff3bf',
  PADDLE: '#e64980',
  PINBALL: '#dee2e6'
};
const GRAVITY = 0.75;
const WIREFRAMES = false;
// const BUMPER_BOUNCE = 1.5;
// const PADDLE_PULL = 0.002;
// const MAX_VELOCITY = 50;

class Machine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentScore: 0,
      highScore: 0,
      isLeftPaddleUp: false,
      isRightPaddleUp: false
    };
	}
	
	componentDidMount(){
		window.decomp = decomp;
		console.log('window', window.decomp);
	}

	 // outer edges of pinball table
	 boundary = (x, y, width, height) => Matter.Bodies.rectangle(x, y, width, height, {
	  isStatic: true,
	  render: {
	    fillStyle: COLOR.OUTER
	  }
	 });

	 // bodies created from SVG paths
	createPath = (x, y, createdPath) => {
		const vertices = Matter.Vertices.fromPath(createdPath);

    return Matter.Bodies.fromVertices(x, y, vertices, {
      isStatic: true,
      render: {
        fillStyle: COLOR.OUTER,

        // add stroke and line width to fill in slight gaps between fragments
        strokeStyle: COLOR.OUTER,
        lineWidth: 1
      }
    });
	}

	// wall segments
	wall = (x, y, width, height, color, angle = 0) => {
		return Matter.Bodies.rectangle(x, y, width, height, {
			angle,
			isStatic: true,
			chamfer: { radius: 10 },
			render: {
				fillStyle: color
			}
		});
	}

	// contact with these bodies causes pinball to be relaunched
	reset = (x, width) => {
		return Matter.Bodies.rectangle(x, 781, width, 2, {
			label: 'reset',
			isStatic: true,
			render: {
				fillStyle: '#fff'
			}
		});
	}
	
	createStaticBodies = (world) => {
    Matter.World.add(world, [
      // table boundaries (top, bottom, left, right)
      this.boundary(250, -30, 500, 100),
      this.boundary(250, 830, 500, 100),
      this.boundary(-30, 400, 100, 800),
      this.boundary(530, 400, 100, 800),

      // dome
      this.createPath(239, 86, PATHS.DOME),

      // // pegs (left, mid, right)
      // this.wall(140, 140, 20, 40, COLOR.INNER),
      // this.wall(225, 140, 20, 40, COLOR.INNER),
      // this.wall(310, 140, 20, 40, COLOR.INNER),

      // // top bumpers (left, mid, right)
      // this.bumper(105, 250),
      // this.bumper(225, 250),
      // this.bumper(345, 250),

      // // bottom bumpers (left, right)
      // this.bumper(165, 340),
      // this.bumper(285, 340)

      // // shooter lane wall
      // this.wall(440, 520, 20, 560, COLOR.OUTER),

      // // drops (left, right)
      // this.path(25, 360, PATHS.DROP_LEFT),
      // this.path(425, 360, PATHS.DROP_RIGHT),

      // // slingshots (left, right)
      // this.wall(120, 510, 20, 120, COLOR.INNER),
      // this.wall(330, 510, 20, 120, COLOR.INNER),

      // // out lane walls (left, right)
      // this.wall(60, 529, 20, 160, COLOR.INNER),
      // this.wall(390, 529, 20, 160, COLOR.INNER),

      // // flipper walls (left, right);
      // this.wall(93, 624, 20, 98, COLOR.INNER, -0.96),
      // this.wall(357, 624, 20, 98, COLOR.INNER, 0.96),

      // // aprons (left, right)
      // this.path(79, 740, PATHS.APRON_LEFT),
      // this.path(371, 740, PATHS.APRON_RIGHT)

      // // reset zones (center, right)
      // this.reset(225, 50),
      // this.reset(465, 30)
    ]);
	}

	 // invisible bodies to constrict paddles
	stopper = (x, y, side, position, stopperGroup) => {
		// determine which paddle composite to interact with
		// used for collision filtering on various bodies
		

    const attracteeLabel = (side === 'left') ? 'paddleLeftComp' : 'paddleRightComp';

    return Matter.Bodies.circle(x, y, 40, {
      isStatic: true,
      render: {
        visible: false
      },
      collisionFilter: {
        group: stopperGroup
      },
      plugin: {
        attractors: [
          // stopper is always a, other body is b
          function(a, b) {
            if (b.label === attracteeLabel) {
              const isPaddleUp = (side === 'left') ? isLeftPaddleUp : isRightPaddleUp;
              const isPullingUp = (position === 'up' && isPaddleUp);
              const isPullingDown = (position === 'down' && !isPaddleUp);
              if (isPullingUp || isPullingDown) {
                return {
                  x: (a.position.x - b.position.x) * PADDLE_PULL,
                  y: (a.position.y - b.position.y) * PADDLE_PULL
                };
              }
            }
          }
        ]
      }
    });
	}

	createEvents = (engine, world, container, pinBall) => {
		console.log("*pinBall", pinBall);
		// events for when the pinball hits stuff

    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      pairs.forEach((pair) => {
        if (pair.bodyB.label === 'pinball') {
          switch (pair.bodyA.label) {
            case 'reset':
              this.launchPinball(pinBall);
              break;
            case 'bumper':
              this.pingBumper(pair.bodyA);
              break;
          }
        }
      });
    });

    // regulate pinball
    Matter.Events.on(engine, 'beforeUpdate', (event) => {
			// bumpers can quickly multiply velocity, so keep that in check
      Matter.Body.setVelocity(pinball, {
        x: Math.max(Math.min(pinball.velocity.x, MAX_VELOCITY), -MAX_VELOCITY),
        y: Math.max(Math.min(pinball.velocity.y, MAX_VELOCITY), -MAX_VELOCITY)
      });

      // cheap way to keep ball from going back down the shooter lane
      if (pinball.position.x > 450 && pinball.velocity.y > 0) {
        Matter.Body.setVelocity(pinball, { x: 0, y: -10 });
      }
    });

		// render (shared)
		const render = Matter.Render.create({
			element: container,
			engine,
			options: {
				width: world.bounds.max.x,
				height: world.bounds.max.y,
				wireframes: WIREFRAMES,
				background: COLOR.BACKGROUND
			}
		});
		Matter.Render.run(render);

		// mouse drag (god mode for grabbing pinball)
    Matter.World.add(world, Matter.MouseConstraint.create(engine, {
      mouse: Matter.Mouse.create(render.canvas),
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    }));
		const body = document.getElementsByTagName("BODY")[0];
    // keyboard paddle events
    // (body).on('keydown', (e) => {
    //   if (e.which === 37) { // left arrow key
    //     isLeftPaddleUp = true;
    //   } else if (e.which === 39) { // right arrow key
    //     isRightPaddleUp = true;
    //   }
		// });
		console.log('*body');
		document.body.onkeydown = function(e){
		console.log("downnnnn");
	};

    // $('body').on('keyup', (e) => {
    //   if (e.which === 37) { // left arrow key
    //     isLeftPaddleUp = false;
    //   } else if (e.which === 39) { // right arrow key
    //     isRightPaddleUp = false;
    //   }
    // });

    // // click/tap paddle events
    // $('.left-trigger')
    //   .on('mousedown touchstart', (e) => {
    //     isLeftPaddleUp = true;
    //   })
    //   .on('mouseup touchend', (e) => {
    //     isLeftPaddleUp = false;
    //   });
    // $('.right-trigger')
    //   .on('mousedown touchstart', (e) => {
    //     isRightPaddleUp = true;
    //   })
    //   .on('mouseup touchend', (e) => {
    //     isRightPaddleUp = false;
    //   });
  }
	
	createPinball = (stopperGroup, world) => {
    // x/y are set to when pinball is launched
    const pinball = Matter.Bodies.circle(0, 0, 14, {
      label: 'pinball',
      collisionFilter: {
        group: stopperGroup
      },
      render: {
        fillStyle: COLOR.PINBALL
      }
    });
    Matter.World.add(world, pinball);
    this.launchPinball(pinball);
	}
	
	launchPinball = (pinball) => {
    this.updateScore(0);
    Matter.Body.setPosition(pinball, { x: 465, y: 765 });
    Matter.Body.setVelocity(pinball, { x: 0, y: -25 + this.rand(-2, 2) });
    Matter.Body.setAngularVelocity(pinball, 0);
  }

  pingBumper = (bumper) => {
    this.updateScore(currentScore + 10);

    // flash color
    bumper.render.fillStyle = COLOR.BUMPER_LIT;
    setTimeout(() => {
      bumper.render.fillStyle = COLOR.BUMPER;
    }, 100);
  }

  updateScore = (currentScore) => {
		let highScore = Math.max(currentScore, highScore);
		console.log('*highScore', highScore);
		if (!highScore) {
			highScore = 0;
		}

		this.setState({currentScore, highScore})
  }

  // matter.js has a built in random range function, but it is deterministic
  rand = (min, max) => {
    return Math.random() * (max - min) + min;
  }
	
	createPaddles = (world, stopper) => {
    // these bodies keep paddle swings contained, but allow the ball to pass through
    const leftUpStopper = this.stopper(160, 591, 'left', 'up');
    const leftDownStopper = this.stopper(140, 743, 'left', 'down');
    const rightUpStopper = this.stopper(290, 591, 'right', 'up');
    const rightDownStopper = this.stopper(310, 743, 'right', 'down');
    Matter.World.add(world, [leftUpStopper, leftDownStopper, rightUpStopper, rightDownStopper]);

    // this group lets paddle pieces overlap each other
    const paddleGroup = Matter.Body.nextGroup(true);

    // Left paddle mechanism
    const paddleLeft = {};
    paddleLeft.paddle = Matter.Bodies.trapezoid(170, 660, 20, 80, 0.33, {
      label: 'paddleLeft',
      angle: 1.57,
      chamfer: {},
      render: {
        fillStyle: COLOR.PADDLE
      }
    });
    paddleLeft.brick = Matter.Bodies.rectangle(172, 672, 40, 80, {
      angle: 1.62,
      chamfer: {},
      render: {
        visible: false
      }
    });
    paddleLeft.comp = Matter.Body.create({
      label: 'paddleLeftComp',
      parts: [paddleLeft.paddle, paddleLeft.brick]
    });
    paddleLeft.hinge = Matter.Bodies.circle(142, 660, 5, {
      isStatic: true,
      render: {
        visible: false
      }
    });
    Object.values(paddleLeft).forEach((piece) => {
      piece.collisionFilter.group = paddleGroup;
    });
    paddleLeft.con = Matter.Constraint.create({
      bodyA: paddleLeft.comp,
      pointA: { x: -29.5, y: -8.5 },
      bodyB: paddleLeft.hinge,
      length: 0,
      stiffness: 0
    });
    Matter.World.add(world, [paddleLeft.comp, paddleLeft.hinge, paddleLeft.con]);
    Matter.Body.rotate(paddleLeft.comp, 0.57, { x: 142, y: 660 });

    // right paddle mechanism
    const paddleRight = {};
    paddleRight.paddle = Matter.Bodies.trapezoid(280, 660, 20, 80, 0.33, {
      label: 'paddleRight',
      angle: -1.57,
      chamfer: {},
      render: {
        fillStyle: COLOR.PADDLE
      }
    });
    paddleRight.brick = Matter.Bodies.rectangle(278, 672, 40, 80, {
      angle: -1.62,
      chamfer: {},
      render: {
        visible: false
      }
    });
    paddleRight.comp = Matter.Body.create({
      label: 'paddleRightComp',
      parts: [paddleRight.paddle, paddleRight.brick]
    });
    paddleRight.hinge = Matter.Bodies.circle(308, 660, 5, {
      isStatic: true,
      render: {
        visible: false
      }
    });
    Object.values(paddleRight).forEach((piece) => {
      piece.collisionFilter.group = paddleGroup;
    });
    paddleRight.con = Matter.Constraint.create({
      bodyA: paddleRight.comp,
      pointA: { x: 29.5, y: -8.5 },
      bodyB: paddleRight.hinge,
      length: 0,
      stiffness: 0
    });
    Matter.World.add(world, [paddleRight.comp, paddleRight.hinge, paddleRight.con]);
    Matter.Body.rotate(paddleRight.comp, -0.57, { x: 308, y: 660 });
  }

  renderMachine = () => {
    // engine (shared)
    const engine = Matter.Engine.create();

    // world (shared)
    const { world } = engine;
    world.bounds = {
      min: { x: 0, y: 0 },
      max: { x: 500, y: 800 }
    };
    world.gravity.y = GRAVITY; // simulate rolling on a slanted table
		// this.createStaticBodies(world);
    const container = <div className="container" />;

		const stopperGroup = Matter.Body.nextGroup(true);
		this.createPaddles(world);
		this.createStaticBodies(world);
		const pinBall = this.createPinball(stopperGroup, world)
		this.createEvents(engine, world, container, pinBall);

    // runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
  }

	 render() {
		 const {
	     currentScore, highScore, isLeftPaddleUp, isRightPaddleUp
		 } = this.state;

		//  console.log(currentScore, highScore, isLeftPaddleUp, isRightPaddleUp);
	  return (
  <div className="">
    { this.renderMachine() }
    <div className="score current-score">
			<span>Score</span>
			<span>{currentScore}</span>
    </div>
    <div className="score high-score">
			<span>High Score</span>
			<span>{highScore}</span>
    </div>
    <button className="trigger left-trigger">tap!</button>
    <button className="trigger right-trigger">tap!</button>
  </div>
	  );
	 }
}

Machine.propTypes = propTypes;
export default Machine;
