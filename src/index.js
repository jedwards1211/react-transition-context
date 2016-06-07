/* @flow */

import React, {Component, PropTypes} from 'react'

type TransitionState = 'out' | 'in' | 'appearing' | 'entering' | 'leaving'
type TransitionContextMethods = {
  addListener: (listener: Listener) => void,
  removeListener: (listener: Listener) => void,
  getState: () => TransitionState,
}
type Context = {
  transitionContext: TransitionContextMethods
}

type Listener = {
  onTransition?: (prevState: TransitionState, nextState: TransitionState) => any,
  willComeIn?: Function,
  didComeIn?: Function,
  willAppear?: Function,
  didAppear?: Function,
  willEnter?: Function,
  didEnter?: Function,
  willLeave?: Function,
  didLeave?: Function,
}

function overallTransitionState(parentState: ?TransitionState, childState: TransitionState): TransitionState {
  if (parentState === 'out' || childState === 'out') return 'out'
  if (parentState === 'leaving' || childState === 'leaving') return 'leaving'
  if (parentState === 'appearing' || childState === 'appearing') return 'appearing'
  if (parentState === 'entering' || childState === 'entering') return 'entering'
  return childState
}

type Props = {
  transitionState: TransitionState,
  children: any,
}

export default class TransitionContext extends Component<void, Props, void> {
  static propTypes = {
    transitionState: PropTypes.oneOf(['out', 'in', 'appearing', 'entering', 'leaving']),
    children: PropTypes.any
  };
  static contextTypes = {
    transitionContext: PropTypes.object
  };
  static childContextTypes = {
    transitionContext: PropTypes.object.isRequired
  };

  getChildContext(): Context {
    return {
      transitionContext: this.transitionContext
    }
  }

  context: Context;
  prevState: TransitionState;
  listeners: Array<Listener> = [];

  transitionContext: TransitionContextMethods = {
    addListener: listener => {
      this.listeners.push(listener)
    },
    removeListener: listener => {
      this.listeners.splice(this.listeners.indexOf(listener), 1)
    },
    getState: () => {
      let {transitionContext} = this.context
      return overallTransitionState(
        transitionContext && transitionContext.getState(),
        this.props.transitionState)
    }
  };

  callListeners: (event: string) => void = (event) => {
    for (let listener of this.listeners) {
      if (listener[event] instanceof Function) {
        listener[event]()
      }
    }
  };

  handleTransition: (prevState: TransitionState,
                     nextState: TransitionState) => void =
    (prevState, nextState) => {
      if (nextState !== prevState) {
        for (let listener of this.listeners) {
          if (listener.onTransition instanceof Function) {
            listener.onTransition(prevState, nextState)
          }
        }

        switch (nextState) {
        case 'out':
          if (prevState === 'leaving') {
            this.callListeners('didLeave')
          }
          break
        case 'in':
          if (prevState === 'appearing') {
            this.callListeners('didAppear')
            this.callListeners('didComeIn')
          }
          else if (prevState === 'entering') {
            this.callListeners('didEnter')
            this.callListeners('didComeIn')
          }
          break
        case 'appearing':
          if (prevState === 'out' || prevState === 'leaving') {
            this.callListeners('willAppear')
            this.callListeners('willComeIn')
          }
          break
        case 'entering':
          if (prevState === 'out' || prevState === 'leaving') {
            this.callListeners('willEnter')
            this.callListeners('willComeIn')
          }
          break
        case 'leaving':
          if (prevState === 'in' || prevState === 'appearing' || prevState === 'entering') {
            this.callListeners('willLeave')
          }
          break
        }
      }
    };

  componentWillMount() {
    let {transitionContext} = this.context
    if (transitionContext) {
      // flow workaround
      const listener: Object = this
      transitionContext.addListener(listener)
    }
  }

  componentDidMount() {
    const state = this.transitionContext.getState()
    this.handleTransition('out', state)
  }

  componentWillReceiveProps(nextProps: Props, nextContext: any) {
    const prevTransitionContext = this.context.transitionContext
    const nextTransitionContext = nextContext.transitionContext
    if (prevTransitionContext !== nextTransitionContext) {
      // flow workaround
      const listener: Object = this
      if (prevTransitionContext != null) prevTransitionContext.removeListener(listener)
      if (nextTransitionContext != null) nextTransitionContext.addListener(listener)
    }

    this.prevState = this.transitionContext.getState()
  }

  componentDidUpdate() {
    const {prevState, transitionContext} = this
    const nextState = transitionContext.getState()
    this.handleTransition(prevState, nextState)
  }

  componentWillUnmount() {
    let {transitionContext} = this.context
    if (transitionContext) {
      // flow workaround
      const listener: Object = this
      transitionContext.removeListener(listener)
    }
  }

  onTransition: (prevState: TransitionState, nextState: TransitionState) => void = (prevState, nextState) => {
    const {transitionState} = this.props
    this.handleTransition(
      overallTransitionState(prevState, transitionState),
      overallTransitionState(nextState, transitionState))
  };

  render() {
    return this.props.children
  }
}

export class TransitionListener extends Component<void, Listener, void> {
  static contextTypes = {
    transitionContext: PropTypes.object
  };

  onTransition: ?(prevState: TransitionState, nextState: TransitionState) => any;
  willComeIn: ?Function;
  didComeIn: ?Function;
  willAppear: ?Function;
  didAppear: ?Function;
  willEnter: ?Function;
  didEnter: ?Function;
  willLeave: ?Function;
  didLeave: ?Function;

  componentDidMount() {
    const {transitionContext} = this.context
    if (transitionContext) {
      // flow workaround
      const listener: Object = this
      transitionContext.addListener(listener)
    }
  }
  componentWillReceiveProps(nextProps: Listener, nextContext: any) {
    const {prevTransitionContext} = this.context.transitionContext
    const {nextTransitionContext} = nextContext.transitionContext
    if (prevTransitionContext !== nextTransitionContext) {
      // flow workaround
      const listener: Object = this
      if (prevTransitionContext != null) prevTransitionContext.removeListener(listener)
      if (nextTransitionContext != null) nextTransitionContext.addListener(listener)
    }
    this.onTransition = nextProps.onTransition
    this.willComeIn = nextProps.willComeIn
    this.didComeIn = nextProps.didComeIn
    this.willAppear = nextProps.willAppear
    this.didAppear = nextProps.didAppear
    this.willEnter = nextProps.willEnter
    this.didEnter = nextProps.didEnter
    this.willLeave = nextProps.willLeave
    this.didLeave = nextProps.didLeave
  }
  componentWillUnmount() {
    const {transitionContext} = this.context
    if (transitionContext) {
      // flow workaround
      const listener: Object = this
      transitionContext.removeListener(listener)
    }
  }

  render() {
    return null
  }
}
