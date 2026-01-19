# useStateMachine Architecture & Flow

## Overview

`useStateMachine` is a generic, type-safe state machine composable for Vue 3 that manages state transitions with validation, callbacks, and reactive state management.

**Key Feature:** Works with both writable (Ref) and read-only (ComputedRef) states. For read-only states, validation and callbacks execute, but state updates happen externally through the computed's source.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    useStateMachine                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Input Options                          │    │
│  │  • state?: Ref<T> | ComputedRef<T>                  │    │
│  │  • initialState?: T                                 │    │
│  │  • transitions: TransitionMap<T>                    │    │
│  │  • onStateChange?: (from, to) => void               │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         State Management                            │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │ External State (if provided)                 │   │    │
│  │  │ OR Internal Ref (created from initialState)  │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  │  • Check if writable (Ref) vs read-only (Computed) │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Callback Storage                            │    │
│  │  • transitionCallbacks: Map<string, Callback[]>    │    │
│  │  • entryCallbacks: Map<T, Callback[]>               │    │
│  │  • exitCallbacks: Map<T, Callback[]>               │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Return Interface                            │    │
│  │  • state: Ref<T> | ComputedRef<T>                   │    │
│  │  • canTransitionTo(target): boolean                │    │
│  │  • transitionTo(target): boolean                   │    │
│  │  • onTransition(from, to, callback)                │    │
│  │  • onEnter(state, callback)                        │    │
│  │  • onExit(state, callback)                          │    │
│  │  • reset(newState?)                                 │    │
│  │  • clearCallbacks()                                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## State Initialization Flow

```
User calls useStateMachine(options)
         │
         ▼
    ┌─────────┐
    │ Options │
    └─────────┘
         │
         ├─ Has external state?
         │  ├─ YES → Use external state (Ref or ComputedRef)
         │  │        Check if writable (isReadonly)
         │  │
         │  └─ NO → Create internal ref from initialState
         │           Always writable
         │
         ▼
    Initialize callback storage
    (transitionCallbacks, entryCallbacks, exitCallbacks)
         │
         ▼
    Return state machine interface
```

## Transition Flow Diagram

```
User calls machine.transitionTo(targetState)
         │
         ▼
         ┌─────────────────────┐
         │ Validate Transition │
         │ canTransitionTo()   │
         └─────────────────────┘
                   │
                   ├─ Invalid? → Return false
                   │
                   └─ Valid? → Continue
                               │
                               ▼
         ┌─────────────────────────────┐
         │ Execute Exit Callbacks      │
         │ exitCallbacks.get(current)  │
         └─────────────────────────────┘
                               │
                               ▼
         ┌─────────────────────────────┐
         │ Execute Transition Callback │
         │ from transitions config     │
         └─────────────────────────────┘
                               │
                               ├─ Returns false? → Abort, return false
                               │
                               └─ Returns void? → Continue
                                               │
                                               ▼
         ┌─────────────────────────────┐
         │ Execute Registered Callbacks│
         │ transitionCallbacks.get()   │
         └─────────────────────────────┘
                               │
                               ├─ Any returns false? → Abort, return false
                               │
                               └─ All succeed? → Continue
                                               │
                                               ▼
         ┌─────────────────────────────┐
         │ Update State (Conditional)  │
         │ if (isWritable) {           │
         │   stateRef.value = target   │
         │ }                           │
         │ else {                      │
         │   // State updated externally│
         │   // through computed source │
         │ }                           │
         └─────────────────────────────┘
                               │
                               ▼
         ┌─────────────────────────────┐
         │ Execute Entry Callbacks     │
         │ entryCallbacks.get(target)  │
         └─────────────────────────────┘
                               │
                               ▼
         ┌─────────────────────────────┐
         │ Execute onStateChange       │
         │ (if provided)               │
         │ Note: For read-only states,│
         │ this should update external │
         │ source to reflect new state │
         └─────────────────────────────┘
                               │
                               ▼
                          Return true
```

## Data Structures

### TransitionMap

```typescript
type TransitionMap<T> = {
  [fromState in T]?: {
    [toState in T]?: (from: T, to: T) => void | false
  }
}

// Example:
{
  [Status.Pending]: {
    [Status.Running]: (from, to) => { /* callback */ }
  },
  [Status.Running]: {
    [Status.Paused]: (from, to) => { /* callback */ },
    [Status.Finished]: (from, to) => { /* callback */ }
  }
}
```

### Callback Storage

```typescript
// Transition callbacks (registered via onTransition)
transitionCallbacks: Map<string, Callback[]>
// Key format: "fromState->toState"
// Example: "pending->running" → [callback1, callback2, ...]

// Entry callbacks (registered via onEnter)
entryCallbacks: Map<T, Callback[]>
// Key: target state
// Example: Status.Running → [callback1, callback2, ...]

// Exit callbacks (registered via onExit)
exitCallbacks: Map<T, Callback[]>
// Key: source state
// Example: Status.Pending → [callback1, callback2, ...]
```

## Callback Execution Order

When `transitionTo(targetState)` is called:

```
1. EXIT callbacks (from current state)
   └─ exitCallbacks.get(currentState)
      └─ Execute all callbacks

2. TRANSITION callbacks (from config)
   └─ transitions[currentState][targetState]
      └─ Execute callback
         └─ If returns false → ABORT

3. REGISTERED transition callbacks
   └─ transitionCallbacks.get("currentState->targetState")
      └─ Execute all callbacks
         └─ If any returns false → ABORT

4. UPDATE STATE (Conditional)
   └─ if (isWritable) {
        stateRef.value = targetState
      } else {
        // State update happens externally
        // through computed's source (e.g., in onStateChange)
      }

5. ENTRY callbacks (to new state)
   └─ entryCallbacks.get(targetState)
      └─ Execute all callbacks
      └─ Note: Executes even for read-only states

6. GLOBAL state change callback
   └─ onStateChange(previousState, newState)
      └─ Executes after state is updated (or should be updated) and entry callbacks run
      └─ Always executes (unless transition was aborted)
      └─ For read-only states: Use this to update external source
```

**Notes:**

- `onStateChange` is executed last, after the state has been updated (or should be updated) and all entry callbacks have run.
- For **read-only states (ComputedRef)**: All callbacks execute, but state update happens externally. Use `onStateChange` to update the computed's source.
- For **writable states (Ref)**: State is updated directly by the state machine.

## Read-Only State Support

The state machine fully supports read-only states (ComputedRef). This enables powerful patterns where the state is derived from external sources.

### How It Works

```
Read-Only State Flow:
1. transitionTo() is called
2. ✅ Validation executes (same as writable)
3. ✅ All callbacks execute (exit, transition, entry)
4. ⚠️ State update skipped (cannot write to ComputedRef)
5. ✅ onStateChange executes
   └─ Should update external source
   └─ ComputedRef automatically reflects the change
6. ✅ Returns true (transition successful)
```

### Key Points

- **Validation works**: `canTransitionTo()` works identically for read-only states
- **Callbacks execute**: All callbacks (exit, transition, entry, onStateChange) execute normally
- **State update**: Must happen externally through `onStateChange` callback
- **reset()**: Is a no-op for read-only states (reset externally if needed)
- **No errors**: No warnings or errors - it's a supported pattern

### When to Use

- State is derived from external source (e.g., `computed(() => store.value.status)`)
- You want validation and callbacks but external state management
- State can change from multiple sources (not just state machine)

## State Management Modes

### Mode 1: Internal State

```typescript
const machine = useStateMachine({
  initialState: Status.Pending,
  transitions,
})
// Creates: ref(Status.Pending)
// State is managed internally
// Always writable
```

### Mode 2: External Ref

```typescript
const myState = ref(Status.Pending)
const machine = useStateMachine({
  state: myState,
  transitions,
})
// Uses: myState
// State is managed externally
// Writable (Ref)
```

### Mode 3: External ComputedRef (Read-Only)

```typescript
const computedState = computed(() => someValue.status)
const machine = useStateMachine({
  state: computedState,
  transitions,
  onStateChange: (from, to) => {
    // Update external source - computed will reflect the change
    someValue.status = to
  },
})
// Uses: computedState
// State is read-only (ComputedRef)
// ✅ transitionTo() works - validates and executes callbacks
// ⚠️ State update happens in onStateChange (external source)
// ✅ All callbacks (exit, transition, entry) execute normally
```

## Validation Flow

```
canTransitionTo(targetState)
         │
         ▼
    Get current state
    (from state.value)
         │
         ▼
    Get valid targets
    (from transitions[currentState])
         │
         ▼
    Check if targetState
    is in valid targets
         │
         ├─ YES → Return true
         │
         └─ NO → Return false
```

## Key Features

### 1. Type Safety

- Generic type `T extends string | number | symbol`
- TypeScript enforces valid transitions at compile time
- Transition map is type-checked

### 2. Reactive State

- Uses Vue's `Ref` or `ComputedRef`
- State changes are reactive
- Works with Vue's reactivity system

### 3. Transition Validation

- Only allows transitions defined in `transitions` map
- Invalid transitions return `false`
- No runtime errors for invalid transitions

### 4. Callback System

- **Transition callbacks**: Execute during specific transitions
- **Entry callbacks**: Execute when entering a state
- **Exit callbacks**: Execute when leaving a state
- **Global callback**: Execute on any state change
- Callbacks can abort transitions by returning `false`

### 5. Abort Mechanism

- Any callback can return `false` to abort transition
- State is not updated if transition is aborted
- All callbacks before abort point are executed

## Example Flow

```typescript
// Setup
const transitions = {
  [Status.Pending]: {
    [Status.Running]: (from, to) => {
      console.log(`${from} -> ${to}`)
      // Can return false to abort
    },
  },
}

const machine = useStateMachine({
  initialState: Status.Pending,
  transitions,
  onStateChange: (previousState, newState) => {
    console.log(`Global: ${previousState} -> ${newState}`)
  },
})

// Register additional callbacks
machine.onEnter(Status.Running, () => {
  console.log('Entered Running')
})

machine.onExit(Status.Pending, () => {
  console.log('Exited Pending')
})

// Register transition-specific callback using onTransition
machine.onTransition(Status.Pending, Status.Running, (from, to) => {
  console.log(`Registered callback: ${from} -> ${to}`)
  // Can return false to abort transition
})

// Transition
machine.transitionTo(Status.Running)
// Output:
// 1. "Exited Pending"
// 2. "pending -> running" (from transitions config)
// 3. "Registered callback: pending -> running" (from onTransition)
// 4. State updated to Running
// 5. "Entered Running"
// 6. "Global: pending -> running"
```

## Error Handling

```
Invalid Transition
  └─ canTransitionTo() returns false
     └─ transitionTo() returns false
        └─ No state change, no callbacks executed

Read-Only State (ComputedRef)
  └─ ComputedRef detected
     └─ transitionTo() still works ✅
        └─ Validation executes
        └─ All callbacks execute
        └─ State update skipped (happens externally)
        └─ onStateChange should update external source
        └─ reset() is a no-op (state reset externally)

Aborted Transition
  └─ Callback returns false
     └─ transitionTo() returns false
        └─ State not updated
        └─ Callbacks before abort point executed
        └─ Works for both writable and read-only states
```

## Memory Management

```
Callback Storage
  ├─ transitionCallbacks: Map (grows with onTransition calls)
  ├─ entryCallbacks: Map (grows with onEnter calls)
  └─ exitCallbacks: Map (grows with onExit calls)

Cleanup
  └─ clearCallbacks()
     └─ Clears all Maps
     └─ Frees memory
```

## Performance Considerations

1. **Validation**: O(1) lookup in transitions map
2. **Callbacks**: O(n) execution where n = number of callbacks
3. **State Update**: O(1) Vue reactivity update
4. **Memory**: O(m) where m = number of registered callbacks

## Integration Patterns

### Pattern 1: Store Integration

```typescript
// In Pinia store
const statusRef = ref(Status.Pending)
const machine = useStateMachine({
  state: statusRef,
  transitions,
})
// State machine writes to statusRef
// Store reads from statusRef
```

### Pattern 2: Component Integration

```typescript
// In component
const machine = useStateMachine({
  initialState: Status.Pending,
  transitions,
})
// Use machine.state.value in template
// Call machine.transitionTo() in methods
```

### Pattern 3: Read-Only State with External Update

```typescript
// Using ComputedRef - state machine validates and executes callbacks
// State update happens through onStateChange
const computedState = computed(() => externalSource.value.status)

const machine = useStateMachine({
  state: computedState,
  transitions,
  onStateChange: (from, to) => {
    // Update external source - computed reflects the change
    externalSource.value.status = to
  },
})

// transitionTo() works perfectly
machine.transitionTo(Status.Running)
// ✅ Validates transition
// ✅ Executes all callbacks
// ✅ Updates external source via onStateChange
// ✅ Computed state reflects the change
```

### Pattern 4: Bidirectional Sync

```typescript
// Sync external state with state machine
watch(
  () => externalState.value,
  (newVal) => {
    if (machine.state.value !== newVal) {
      machine.state.value = newVal
    }
  },
)
```
