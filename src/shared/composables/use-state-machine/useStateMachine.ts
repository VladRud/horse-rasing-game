import { isReadonly, ref, type ComputedRef, type Ref } from 'vue'

type TransitionCallback<T> = (from: T, to: T) => void | false
type StateCallback<T> = (state: T) => void

type TransitionMap<T extends string | number | symbol> = {
  [key in T]?: { [key in T]?: TransitionCallback<T> }
}

type EntryCallbacks<T> = Map<T, StateCallback<T>[]>
type ExitCallbacks<T> = Map<T, StateCallback<T>[]>

export interface UseStateMachineOptions<T extends string | number | symbol> {
  /**
   * External state reference (Ref or ComputedRef)
   * If provided, the state machine will use this instead of creating its own.
   * If ComputedRef is provided, state can only be read (not written).
   * If not provided, initialState will be used to create an internal ref.
   */
  state?: Ref<T> | ComputedRef<T>
  /**
   * Initial state value (required if state is not provided)
   */
  initialState?: T
  /**
   * Transition map defining valid transitions and their callbacks
   * Format: { [fromState]: { [toState]: callback } }
   */
  transitions: TransitionMap<T>
  /**
   * Optional callback when state changes
   */
  onStateChange?: (previousState: T, newState: T) => void
}

export interface UseStateMachineReturn<T extends string | number | symbol> {
  /**
   * Current state (reactive) - returns the provided state ref or internal ref
   */
  state: Ref<T> | ComputedRef<T>
  /**
   * Check if transition to target state is valid
   */
  canTransitionTo: (targetState: T) => boolean
  /**
   * Transition to a new state
   * @returns true if transition was successful, false otherwise
   * Works with both writable and read-only states.
   * For read-only states, callbacks execute but state update happens externally.
   */
  transitionTo: (targetState: T) => boolean
  /**
   * Register a callback for a specific transition
   */
  onTransition: (from: T, to: T, callback: TransitionCallback<T>) => void
  /**
   * Register a callback that runs when entering a state
   */
  onEnter: (state: T, callback: StateCallback<T>) => void
  /**
   * Register a callback that runs when exiting a state
   */
  onExit: (state: T, callback: StateCallback<T>) => void
  /**
   * Reset state machine to a new state
   * For read-only states, this is a no-op (state should be reset externally)
   */
  reset: (newState?: T) => void
  /**
   * Clear all registered callbacks
   */
  clearCallbacks: () => void
}

/**
 * Generic state machine composable
 * Works with any type that can be used as an object key (string, number, symbol)
 *
 * Supports both writable (Ref) and read-only (ComputedRef) states:
 * - Writable states: State machine updates state directly
 * - Read-only states: Callbacks execute, but state must be updated externally
 *   (through the computed's source). Validation and callbacks still work.
 *
 * @example
 * ```ts
 * const transitions = {
 *   [Status.Pending]: { [Status.Running]: () => console.log('Started') },
 *   [Status.Running]: { [Status.Paused]: () => console.log('Paused') },
 * }
 *
 * const machine = useStateMachine({
 *   initialState: Status.Pending,
 *   transitions,
 * })
 *
 * machine.transitionTo(Status.Running) // ✅ Valid, executes callback
 * ```
 *
 * @example Read-only state
 * ```ts
 * const computedState = computed(() => externalSource.value.status)
 * const machine = useStateMachine({
 *   state: computedState, // Read-only
 *   transitions,
 * })
 *
 * machine.transitionTo(Status.Running) // ✅ Works! Callbacks execute
 * // State update happens in externalSource, computedState reflects it
 * ```
 */
export function useStateMachine<T extends string | number | symbol>(
  options: UseStateMachineOptions<T>,
): UseStateMachineReturn<T> {
  const { state: externalState, initialState, transitions, onStateChange } = options

  if (!externalState && initialState === undefined) {
    throw new Error('Either state or initialState must be provided')
  }

  // Use external state if provided, otherwise create internal ref
  const state: Ref<T> | ComputedRef<T> = externalState ?? (ref<T>(initialState!) as Ref<T>)

  // Check if state is writable (Ref) vs read-only (ComputedRef)
  // Use Vue's isReadonly to detect if the state is readonly
  const isWritable = externalState ? !isReadonly(state) : true

  const transitionCallbacks = new Map<string, TransitionCallback<T>[]>()
  const entryCallbacks: EntryCallbacks<T> = new Map()
  const exitCallbacks: ExitCallbacks<T> = new Map()

  /**
   * Get valid target states for current state
   */
  const getValidTargets = (fromState: T): T[] => {
    const stateTransitions = transitions[fromState]
    if (!stateTransitions) return []
    return Object.keys(stateTransitions) as T[]
  }

  /**
   * Check if transition is valid
   */
  const canTransitionTo = (targetState: T): boolean => {
    const currentState = (state as Ref<T> | ComputedRef<T>).value
    const validTargets = getValidTargets(currentState)
    return validTargets.includes(targetState)
  }

  /**
   * Register transition callback
   */
  const onTransition = (from: T, to: T, callback: TransitionCallback<T>): void => {
    const key = `${String(from)}->${String(to)}`
    if (!transitionCallbacks.has(key)) {
      transitionCallbacks.set(key, [])
    }
    transitionCallbacks.get(key)!.push(callback)
  }

  /**
   * Register entry callback
   */
  const onEnter = (targetState: T, callback: StateCallback<T>): void => {
    if (!entryCallbacks.has(targetState)) {
      entryCallbacks.set(targetState, [])
    }
    entryCallbacks.get(targetState)!.push(callback)
  }

  /**
   * Register exit callback
   */
  const onExit = (targetState: T, callback: StateCallback<T>): void => {
    if (!exitCallbacks.has(targetState)) {
      exitCallbacks.set(targetState, [])
    }
    exitCallbacks.get(targetState)!.push(callback)
  }

  /**
   * Transition to a new state
   * Works with both writable (Ref) and read-only (ComputedRef) states.
   * For read-only states, callbacks execute but state is not updated internally.
   */
  const transitionTo = (targetState: T): boolean => {
    if (!canTransitionTo(targetState)) {
      return false
    }

    // Get current state (works for both Ref and ComputedRef)
    const currentState = (state as Ref<T> | ComputedRef<T>).value
    const previousState = currentState

    // Execute exit callbacks for current state
    const exitCbs = exitCallbacks.get(previousState) || []
    exitCbs.forEach((callback) => callback(previousState))

    // Execute transition-specific callbacks from config
    const stateTransitions = transitions[previousState]
    const transitionCallback = stateTransitions?.[targetState]
    if (transitionCallback) {
      const result = transitionCallback(previousState, targetState)
      // If callback returns false, abort transition
      if (result === false) {
        return false
      }
    }

    // Execute registered transition callbacks
    const transitionKey = `${String(previousState)}->${String(targetState)}`
    const registeredCallbacks = transitionCallbacks.get(transitionKey) || []
    for (const callback of registeredCallbacks) {
      const result = callback(previousState, targetState)
      // If any callback returns false, abort transition
      if (result === false) {
        return false
      }
    }

    // Update state (only if it's a writable Ref)
    // For read-only states (ComputedRef), the state should be updated externally
    // through the computed's source, but callbacks still execute
    if (isWritable) {
      const stateRef = state as Ref<T>
      stateRef.value = targetState
    }

    // Execute entry callbacks for new state
    // Note: For read-only states, these execute even though state wasn't updated here
    // The external source should update the state, making the computed reflect the new value
    const entryCbs = entryCallbacks.get(targetState) || []
    entryCbs.forEach((callback) => callback(targetState))

    // Execute global state change callback
    onStateChange?.(previousState, targetState)

    return true
  }

  /**
   * Reset state machine
   * For read-only states, this is a no-op since state cannot be updated internally.
   * The external source should be updated instead.
   */
  const reset = (newState?: T): void => {
    if (!isWritable) {
      // For read-only states, reset is a no-op
      // The external source should be reset instead
      return
    }

    const targetState = newState ?? initialState ?? (state as Ref<T>).value
    ;(state as Ref<T>).value = targetState
  }

  /**
   * Clear all callbacks
   */
  const clearCallbacks = (): void => {
    transitionCallbacks.clear()
    entryCallbacks.clear()
    exitCallbacks.clear()
  }

  return {
    state: state as Ref<T> | ComputedRef<T>,
    canTransitionTo,
    transitionTo,
    onTransition,
    onEnter,
    onExit,
    reset,
    clearCallbacks,
  }
}

/**
 * Helper function to check if a transition is valid
 * Useful for standalone validation without creating a state machine instance
 */
export function canTransition<T extends string | number | symbol>(
  from: T,
  to: T,
  transitions: TransitionMap<T>,
): boolean {
  const stateTransitions = transitions[from]
  if (!stateTransitions) return false
  return to in stateTransitions
}
