import { describe, expect, it } from 'vitest'
import { useStateMachine } from '@/shared/composables/use-state-machine'

type Status = 'pending' | 'running' | 'paused'

const buildTransitions = () => ({
  pending: {
    running: () => {},
  },
  running: {
    paused: () => {},
  },
  paused: {
    running: () => {},
  },
})

describe('useStateMachine', () => {
  it('allows valid transitions and blocks invalid ones', () => {
    const machine = useStateMachine<Status>({
      initialState: 'pending',
      transitions: buildTransitions(),
    })

    expect(machine.canTransitionTo('running')).toBe(true)
    expect(machine.canTransitionTo('paused')).toBe(false)

    expect(machine.transitionTo('paused')).toBe(false)
    expect(machine.state.value).toBe('pending')

    expect(machine.transitionTo('running')).toBe(true)
    expect(machine.state.value).toBe('running')
  })

  it('fires callbacks in order for a transition', () => {
    const calls: string[] = []

    const machine = useStateMachine<Status>({
      initialState: 'pending',
      transitions: {
        pending: {
          running: () => {
            calls.push('transition')
          },
        },
      },
      onStateChange: (from, to) => {
        calls.push(`state:${from}->${to}`)
      },
    })

    machine.onExit('pending', () => {
      calls.push('exit')
    })

    machine.onTransition('pending', 'running', () => {
      calls.push('registered')
    })

    machine.onEnter('running', () => {
      calls.push('enter')
    })

    machine.transitionTo('running')

    expect(calls).toEqual(['exit', 'transition', 'registered', 'enter', 'state:pending->running'])
  })

  it('aborts transitions when callbacks return false', () => {
    const configBlocked = useStateMachine<Status>({
      initialState: 'pending',
      transitions: {
        pending: {
          running: () => false,
        },
      },
    })

    expect(configBlocked.transitionTo('running')).toBe(false)
    expect(configBlocked.state.value).toBe('pending')

    const registeredBlocked = useStateMachine<Status>({
      initialState: 'pending',
      transitions: buildTransitions(),
    })

    registeredBlocked.onTransition('pending', 'running', () => false)

    expect(registeredBlocked.transitionTo('running')).toBe(false)
    expect(registeredBlocked.state.value).toBe('pending')
  })
})
