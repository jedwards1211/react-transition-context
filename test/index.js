import React from 'react'
import TransitionContext, {TransitionListener} from '../src'

import {mount} from 'enzyme'

describe('TransitionListener', () => {
  describe('by itself', () => {
    it('calls didComeIn on mount', () => {
      const didComeIn = jasmine.createSpy('didComeIn')

      mount(
        <TransitionListener didComeIn={didComeIn} />
      )
      expect(didComeIn).toHaveBeenCalled()
    })
    it('calls willLeave and on unmount', () => {
      const willLeave = jasmine.createSpy('willLeave')

      const comp = mount(
        <TransitionListener willLeave={willLeave} />
      )
      expect(willLeave).not.toHaveBeenCalled()

      comp.unmount()
      expect(willLeave).toHaveBeenCalled()
    })
  })
})

describe('TransitionContext', () => {
  describe('by itself', () => {
    it('calls didComeIn if in during componentDidMount', () => {
      const didComeIn = jasmine.createSpy('didComeIn')

      mount(
        <TransitionContext transitionState="in">
          <TransitionListener didComeIn={didComeIn} />
        </TransitionContext>
      )
      expect(didComeIn).toHaveBeenCalled()
    })
    it("doesn't call didComeIn if in during componentDidMount", () => {
      const didComeIn = jasmine.createSpy('didComeIn')

      mount(
        <TransitionContext transitionState="appearing">
          <TransitionListener didComeIn={didComeIn} />
        </TransitionContext>
      )
      expect(didComeIn).not.toHaveBeenCalled()
    })
  })
  describe('nested once', () => {
    describe('child out', () => {
      it('fires nothing regardless of parent state', () => {
        const onTransition = jasmine.createSpy('onTransition')

        const comp = mount(
          <TransitionContext transitionState="out">
            <TransitionContext transitionState="out">
              <TransitionListener onTransition={onTransition} />
            </TransitionContext>
          </TransitionContext>
        )
        comp.setProps(
          <TransitionContext transitionState="appearing">
            <TransitionContext transitionState="out">
              <TransitionListener onTransition={onTransition} />
            </TransitionContext>
          </TransitionContext>.props
        )
        comp.setProps(
          <TransitionContext transitionState="in">
            <TransitionContext transitionState="out">
              <TransitionListener onTransition={onTransition} />
            </TransitionContext>
          </TransitionContext>.props
        )
        comp.setProps(
          <TransitionContext transitionState="leaving">
            <TransitionContext transitionState="out">
              <TransitionListener onTransition={onTransition} />
            </TransitionContext>
          </TransitionContext>.props
        )
        comp.setProps(
          <TransitionContext transitionState="out">
            <TransitionContext transitionState="out">
              <TransitionListener onTransition={onTransition} />
            </TransitionContext>
          </TransitionContext>.props
        )

        expect(onTransition).not.toHaveBeenCalled()
      })
    })
    describe('child in', () => {
      it('fires willAppear when parent will appear', () => {
        const onTransition = jasmine.createSpy('onTransition')
        const willAppear = jasmine.createSpy('willAppear')

        const comp = mount(
          <TransitionContext transitionState="out">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} willAppear={willAppear} />
            </TransitionContext>
          </TransitionContext>
        )

        expect(onTransition).not.toHaveBeenCalled()
        expect(willAppear).not.toHaveBeenCalled()

        comp.setProps(
          <TransitionContext transitionState="appearing">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} willAppear={willAppear} />
            </TransitionContext>
          </TransitionContext>.props
        )

        expect(onTransition).toHaveBeenCalledWith('out', 'appearing')
        expect(willAppear).toHaveBeenCalled()
      })
      it('fires didAppear when parent appears', () => {
        const onTransition = jasmine.createSpy('onTransition')
        const didAppear = jasmine.createSpy('didAppear')

        const comp = mount(
          <TransitionContext transitionState="appearing">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} didAppear={didAppear} />
            </TransitionContext>
          </TransitionContext>
        )

        expect(onTransition).not.toHaveBeenCalled()
        expect(didAppear).not.toHaveBeenCalled()

        comp.setProps(
          <TransitionContext transitionState="in">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} didAppear={didAppear} />
            </TransitionContext>
          </TransitionContext>.props
        )

        expect(onTransition).toHaveBeenCalledWith('appearing', 'in')
        expect(didAppear).toHaveBeenCalled()
      })
      it('fires willEnter when parent will enter', () => {
        const onTransition = jasmine.createSpy('onTransition')
        const willEnter = jasmine.createSpy('willEnter')

        const comp = mount(
          <TransitionContext transitionState="out">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} willEnter={willEnter} />
            </TransitionContext>
          </TransitionContext>
        )

        expect(onTransition).not.toHaveBeenCalled()
        expect(willEnter).not.toHaveBeenCalled()

        comp.setProps(
          <TransitionContext transitionState="entering">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} willEnter={willEnter} />
            </TransitionContext>
          </TransitionContext>.props
        )

        expect(onTransition).toHaveBeenCalledWith('out', 'entering')
        expect(willEnter).toHaveBeenCalled()
      })
      it('fires didEnter when parent enters', () => {
        const onTransition = jasmine.createSpy('onTransition')
        const didEnter = jasmine.createSpy('didEnter')

        const comp = mount(
          <TransitionContext transitionState="entering">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} didEnter={didEnter} />
            </TransitionContext>
          </TransitionContext>
        )

        expect(onTransition).not.toHaveBeenCalled()
        expect(didEnter).not.toHaveBeenCalled()

        comp.setProps(
          <TransitionContext transitionState="in">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} didEnter={didEnter} />
            </TransitionContext>
          </TransitionContext>.props
        )

        expect(onTransition).toHaveBeenCalledWith('entering', 'in')
        expect(didEnter).toHaveBeenCalled()
      })
      it('fires willLeave when parent will leave', () => {
        const onTransition = jasmine.createSpy('onTransition')
        const willLeave = jasmine.createSpy('willLeave')

        const comp = mount(
          <TransitionContext transitionState="in">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} willLeave={willLeave} />
            </TransitionContext>
          </TransitionContext>
        )

        expect(onTransition).not.toHaveBeenCalled()
        expect(willLeave).not.toHaveBeenCalled()

        comp.setProps(
          <TransitionContext transitionState="leaving">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} willLeave={willLeave} />
            </TransitionContext>
          </TransitionContext>.props
        )

        expect(onTransition).toHaveBeenCalledWith('in', 'leaving')
        expect(willLeave).toHaveBeenCalled()
      })
      it('fires didLeave when parent leaves', () => {
        const onTransition = jasmine.createSpy('onTransition')
        const didLeave = jasmine.createSpy('didLeave')

        const comp = mount(
          <TransitionContext transitionState="leaving">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} didLeave={didLeave} />
            </TransitionContext>
          </TransitionContext>
        )

        expect(onTransition).not.toHaveBeenCalled()
        expect(didLeave).not.toHaveBeenCalled()

        comp.setProps(
          <TransitionContext transitionState="out">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} didLeave={didLeave} />
            </TransitionContext>
          </TransitionContext>.props
        )

        expect(onTransition).toHaveBeenCalledWith('leaving', 'out')
        expect(didLeave).toHaveBeenCalled()
      })
      it('fires didLeave when child unmounts', () => {
        const onTransition = jasmine.createSpy('onTransition')
        const didLeave = jasmine.createSpy('didLeave')

        const comp = mount(
          <TransitionContext transitionState="in">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} didLeave={didLeave} />
            </TransitionContext>
          </TransitionContext>
        )

        expect(onTransition).not.toHaveBeenCalled()
        expect(didLeave).not.toHaveBeenCalled()

        comp.setProps(
          <TransitionContext transitionState="in">
            <TransitionContext transitionState="in">
              <div />
            </TransitionContext>
          </TransitionContext>
        )

        expect(onTransition).toHaveBeenCalledWith('in', 'out')
        expect(didLeave).toHaveBeenCalled()
      })
      it('fires didLeave when parent unmounts', () => {
        const onTransition = jasmine.createSpy('onTransition')
        const didLeave = jasmine.createSpy('didLeave')

        const comp = mount(
          <TransitionContext transitionState="in">
            <TransitionContext transitionState="in">
              <TransitionListener onTransition={onTransition} didLeave={didLeave} />
            </TransitionContext>
          </TransitionContext>
        )

        expect(onTransition).not.toHaveBeenCalled()
        expect(didLeave).not.toHaveBeenCalled()

        comp.setProps({children: null})

        expect(onTransition).toHaveBeenCalledWith('in', 'out')
        expect(didLeave).toHaveBeenCalled()
      })
    })
  })
})
