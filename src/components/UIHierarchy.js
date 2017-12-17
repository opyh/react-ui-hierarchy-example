// @flow

// Provides a way to display an animated, hierarchical stack of UI elements.
// Design mobile-first, let UIHierarchy derive a tablet/desktop-compatible app automatically.
// Automatically switches between split view and single view depending on viewport size.
// Useful for presenting UI hierarchies and modal dialogs.
// Implementation inspired by UINavigationController on iOS.

import * as React from 'react';
import debounce from 'lodash/debounce';
import layoutStylesForHierarchyElements from './layoutStylesForHierarchyElements';
import type { Offset, Layout, Size } from './SizeTypes';
import { ZeroOffset, add2D, subtract2D } from './SizeTypes';
import Viewport from './Viewport';


export type Props = {
  children: React.ChildrenArray<React.Element<any>>,
  className?: string,
  style?: CSSStyleDeclaration,
  animationDuration: number,
};


export type State = {
  isAnimating: boolean,
  containerSize: ?Size,
  viewportOffset: Offset,
  cachedChildren: ?React.ChildrenArray<React.Element<any>>,
  renderedElementCount: number,
};



export default class UIHierarchy<O: Props> extends React.Component<O, State> {
  state = {
    isAnimating: false,
    containerSize: null,
    viewportOffset: [0, 0],
    cachedChildren: null,
    renderedElementCount: 0,
  };

  static defaultProps = {
    animationDuration: 500,
  };

  blockingElement: ?HTMLElement = null;
  containerElement: ?HTMLDivElement;
  stopAnimationAndLayoutDebounced = debounce((() => this.stopAnimationAndLayout()), 20);
  animationTimeout: ?number;
  childrenDebounceTimeout: ?number;



  componentDidMount() {
    window.addEventListener('resize', this.stopAnimationAndLayoutDebounced);
    this.setState({ renderedElementCount: React.Children.count(this.props.children) })
    this.layout();
  }


  componentWillUnmount() {
    window.removeEventListener('resize', this.stopAnimationAndLayoutDebounced);
  }


  componentWillReceiveProps(nextProps: O) {
    const previousCount = React.Children.count(this.props.children);
    const nextCount = React.Children.count(nextProps.children);

    if (previousCount === nextCount) {
      return;
    }

    
    if (previousCount > nextCount) {
      // Ensure a removed child stays visible until it is completely outside the viewport
      this.setState({ cachedChildren: this.props.children });
      if (this.childrenDebounceTimeout) clearTimeout(this.childrenDebounceTimeout);
      this.childrenDebounceTimeout = setTimeout(() => {
        this.setState({ cachedChildren: null });
        clearTimeout(this.childrenDebounceTimeout);
      }, this.props.animationDuration);
    }

    // This means every change in element counts is rendered twice:
    // Once with the old element count, once with the new element count. Without this, added
    // children would not slide in, but the component would directly render them in their final
    // position.
    setImmediate(() => {
      this.setState({ renderedElementCount: nextCount });
    });

    this.triggerAnimation();
  }


  render() {
    const elementCount = this.state.renderedElementCount;
    const { containerSize } = this.state;

    let childrenLayouts = null;
    let currentChildLayout = null;
    let viewportOffset = ZeroOffset;

    if (containerSize && elementCount) {
      childrenLayouts = layoutStylesForHierarchyElements({ elementCount, containerSize });
      currentChildLayout = childrenLayouts[elementCount - 1];
      viewportOffset = subtract2D(
        add2D(currentChildLayout.offset, currentChildLayout.size),
        containerSize
      );
    }

    const style = Object.assign({}, this.props.style, { overflow: 'hidden' });

    const ref = (div) => {
      this.containerElement = div;
      if (typeof this.props.ref === 'function') this.props.ref(div);
    };

    return (<div {...{ style, className: this.className() }} ref={ref}>
      <Viewport
        offset={viewportOffset}
        isAnimating={this.state.isAnimating}
        animationDuration={this.props.animationDuration}
      >
        {childrenLayouts ? this.renderChildren(childrenLayouts) : null}
      </Viewport>
    </div>);
  }


  renderChildren(childrenLayouts: Layout[]) {
    const transition = ['transform', 'opacity', 'width', 'height']
      .map(a => `${a} ${this.props.animationDuration}ms ease-out`)
      .join(', ');

    const animationStyle = this.state.isAnimating ? {
      transition,
      pointerEvents: 'none',
    } : {};

    return React.Children.map(
      this.cachedChildren(),
      (child, index) => React.cloneElement(child, {
        style: Object.assign({}, child.props.style, childrenLayouts[index].style, animationStyle),
      }));
  }


  cachedChildren() {
    return this.state.cachedChildren || this.props.children;
  }


  triggerAnimation() {
    this.clearAnimationTimeout();
    this.setState({ isAnimating: true });
    this.animationTimeout = setTimeout(() => {
      this.clearAnimationTimeout();
      this.setState({ isAnimating: false });
    }, this.props.animationDuration);
  }


  className(): string {
    const names: (string | null)[] = [
      this.props.className || null,
      'UIHierarchy',
      this.props.children.length === 1 ? 'isOnlyRoot' : null,
      this.state.isAnimating ? 'isAnimating' : null,
    ];

    return names.filter(Boolean).join(' ');
  }


  clearAnimationTimeout() {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
  }


  stopAnimationAndLayout(): void {
    this.clearAnimationTimeout();
    this.setState({ isAnimating: false });
    return this.layout();
  }


  layout() {
    const containerElement = this.containerElement;
    if (!containerElement) return;

    this.setState({
      containerSize: [containerElement.offsetWidth, containerElement.offsetHeight],
    });
  }
}
