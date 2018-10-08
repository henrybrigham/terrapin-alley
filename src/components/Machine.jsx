import React from 'react';
// import PropTypes from 'prop-types';

const propTypes = {

};

class Machine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="container">
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
