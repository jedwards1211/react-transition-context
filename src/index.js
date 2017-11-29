/* @flow */

import * as React from 'react'
import PropTypes from 'prop-types'

type TransitionState = 'out' | 'in' | 'appearing' | 'entering' | 'leaving'
type TransitionContextMethods = {
  addListener: (listener: Listener) => void,
  removeListener: (listener: Listener) => void,
  getState: () => TransitionState,
}
type Context = {
  transitionContext: TransitionContextMethods,
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

export default class TransitionContext extends React.Component<Props> {
  static defaultProps: Props;
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
    addListener: (listener: Listener) => {
      this.listeners.push(listener)
    },
    removeListener: (listener: Listener) => {
      this.listeners.splice(this.listeners.indexOf(listener), 1)
    },
    getState: () => {
      let {transitionContext} = this.context
      return overallTransitionState(
        transitionContext && transitionContext.getState(),
        this.props.transitionState)
    }
  };

  callListeners = (event: string) => {
    for (let listener of this.listeners) {
      if (listener[event] instanceof Function) {
        listener[event]()
      }
    }
  };

  handleTransition = (prevState: TransitionState, nextState: TransitionState) => {
    if (nextState !== prevState) {
      for (let listener of this.listeners) {
        if (prevState && listener.onTransition instanceof Function) {
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
    this.prevState = this.transitionContext.getState()
    let {transitionContext} = this.context
    if (transitionContext) {
      // flow workaround
      const listener: Object = this
      transitionContext.addListener(listener)
    }
  }

  componentDidMount() {
    if (this.transitionContext.getState() === 'in') this.callListeners('didComeIn')
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
    const {prevState} = this
    let {transitionContext} = this.context
    if (transitionContext) {
      // flow workaround
      const listener: Object = this
      transitionContext.removeListener(listener)
    }
    this.handleTransition(prevState, 'out')
  }

  onTransition = (prevState: TransitionState, nextState: TransitionState) => {
    const {transitionState} = this.props
    this.handleTransition(
      overallTransitionState(prevState, transitionState),
      overallTransitionState(nextState, transitionState))
  };

  render(): ?React.Node {
    return this.props.children
  }
}

export class TransitionListener extends React.Component<Listener> {
  static defaultProps: Listener;
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

  componentWillMount() {
    const {transitionContext} = this.context
    this.updateEvents()
    if (transitionContext) {
      // flow workaround
      const listener: Object = this
      transitionContext.addListener(listener)
    }
  }

  componentDidMount() {
    const {transitionContext} = this.context
    if (!transitionContext || transitionContext.getState() === 'in') {
      this.didComeIn && this.didComeIn()
    }
  }
  componentWillReceiveProps(nextProps: Listener, nextContext: any) {
    const prevTransitionContext = this.context.transitionContext
    const nextTransitionContext = nextContext.transitionContext
    if (prevTransitionContext !== nextTransitionContext) {
      // flow workaround
      const listener: Object = this
      if (prevTransitionContext != null) prevTransitionContext.removeListener(listener)
      if (nextTransitionContext != null) nextTransitionContext.addListener(listener)
    }
    this.updateEvents(nextProps)
  }
  componentWillUnmount() {
    const {transitionContext} = this.context
    if (transitionContext) {
      // flow workaround
      const listener: Object = this
      transitionContext.removeListener(listener)
      if (transitionContext.getState() !== 'out') {
        const {onTransition} = this
        onTransition && onTransition(transitionContext.getState(), 'out')
        this.didLeave && this.didLeave()
      }
    } else {
      this.willLeave && this.willLeave()
      this.didLeave && this.didLeave()
    }
  }

  updateEvents = (props: Listener = this.props) => {
    this.onTransition = props.onTransition
    this.willComeIn = props.willComeIn
    this.didComeIn = props.didComeIn
    this.willAppear = props.willAppear
    this.didAppear = props.didAppear
    this.willEnter = props.willEnter
    this.didEnter = props.didEnter
    this.willLeave = props.willLeave
    this.didLeave = props.didLeave
  };

  render(): ?React.Node {
    return null
  }
}
