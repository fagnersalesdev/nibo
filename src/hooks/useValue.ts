export function useValue<
  TState
>(initialState: TState): [() => TState, (state: TState | ((actualState: TState) => TState)) => void] {
  return [
    () => initialState,
    (newState: TState | ((actualState: TState) => TState)) => {
      initialState = newState instanceof Function ? newState(initialState) : newState
    }
  ]
} 