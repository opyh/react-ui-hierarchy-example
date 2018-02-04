// @flow

import * as React from 'react';
import UIHierarchy from 'react-ui-hierarchy';
import Colors from './Colors';

import './App.css';

type State = {
  levels: number,
};

class App extends React.Component<{}, State> {
  state = {
    levels: 1,
  };

  render() {
    return (
      <div className="App">
        <nav>
          <h1>
            <a href='https://github.com/opyh/react-ui-hierarchy'><code>react-ui-hierarchy</code></a> – a responsive UI hierarchy system.
          </h1>
        </nav>

        <UIHierarchy animationDuration={500}>
          {Array.apply(null, Array(this.state.levels))
            .map((el, index) => {
              return (<section className='view' key={index} style={{ backgroundColor: Colors.background[index % Colors.background.length] }}>
                {index === 0 ? null : <button onClick={() => this.pop()}>Back</button>}
                <section>Level {index}</section>
                <button onClick={() => this.push()}>See more</button>
              </section>);
            })}
        </UIHierarchy>
      </div>
    );
  }

  push() {
    this.setState({ levels: this.state.levels + 1 });
  }

  pop() {
    if (this.state.level === 1) return;
    this.setState({ levels: this.state.levels - 1 });
  }
}

export default App;