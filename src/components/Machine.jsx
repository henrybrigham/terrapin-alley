import React from 'react';
import Matter from 'matter-js';
// import PropTypes from 'prop-types';

const propTypes = {

};

// const PATHS = {
//   DOME: '0 0 0 250 19 250 20 231.9 25.7 196.1 36.9 161.7 53.3 129.5 74.6 100.2 100.2 74.6 129.5 53.3 161.7 36.9 196.1 25.7 231.9 20 268.1 20 303.9 25.7 338.3 36.9 370.5 53.3 399.8 74.6 425.4 100.2 446.7 129.5 463.1 161.7 474.3 196.1 480 231.9 480 250 500 250 500 0 0 0',
//   DROP_LEFT: '0 0 20 0 70 100 20 150 0 150 0 0',
//   DROP_RIGHT: '50 0 68 0 68 150 50 150 0 100 50 0',
//   APRON_LEFT: '0 0 180 120 0 120 0 0',
//   APRON_RIGHT: '180 0 180 120 0 120 180 0'
// };
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

	 // outer edges of pinball table
	 boundary = (x, y, width, height) => Matter.Bodies.rectangle(x, y, width, height, {
	  isStatic: true,
	  render: {
	    fillStyle: COLOR.OUTER
	  }
	 });

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

    const container = <div className="container" />;

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

    // runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // used for collision filtering on various bodies
    const stopperGroup = Matter.Body.nextGroup(true);
  }

	 render() {
		 const {
	     currentScore, highScore, isLeftPaddleUp, isRightPaddleUp
		 } = this.state;

		 console.log(currentScore, highScore, isLeftPaddleUp, isRightPaddleUp);
	  return (
  <div className="">
    { this.renderMachine() }
    <div className="score current-score">
      <span>Score</span>
    </div>
    <div className="score high-score">
      <span>High Score</span>
    </div>
    <button className="trigger left-trigger">tap!</button>
    <button className="trigger right-trigger">tap!</button>
  </div>
	  );
	 }
}

Machine.propTypes = propTypes;
export default Machine;
