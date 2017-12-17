// @flow

import * as React from 'react';
import UIHierarchy from './components/UIHierarchy';
import Colors from './Colors';

import './App.css';

type State = {
  level: number,
};

class App extends React.Component<{}, State> {
  state = {
    level: 1,
  };

  render() {
    return (
      <div className="App">
        <nav>
          <h1>Tabs go here</h1>
        </nav>

        <UIHierarchy animationDuration={500}>
          {Array.apply(null, Array(this.state.level))
              .map((el, index) => {
                return (<section className='view' key={index} style={{ backgroundColor: Colors.background[index % Colors.background.length] }}>
                  {index === 0 ? null : <button onClick={() => this.pop()}>Back</button>}
                  <section>Level {index + 1}</section>
                  <button onClick={() => this.push()}>Deeper!</button>
                </section>);
              })}
        </UIHierarchy>
      </div>
    );
  }

  push() {
    this.setState({ level: this.state.level + 1 });
  }

  pop() {
    if (this.state.level === 1) return;
    this.setState({ level: this.state.level - 1 });
  }
}

export default App;