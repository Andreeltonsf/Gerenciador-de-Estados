import { useSyncExternalStore } from 'react';

/* eslint-disable prettier/prettier */
type SetterFn<T> = (prevState: T) => Partial<T>;
type SetStateFn<T> = (partialState: Partial<T> | SetterFn<T>) => void;

export function createStore<TState>(
  createState: (setState: SetStateFn<TState>, getState: () => TState) => TState,
) {
  let state: TState;

  // biome-ignore lint/style/useConst: <explanation>
  let listeners: Set<() => void>;

  function notifyListeners() {
    // biome-ignore lint/complexity/noForEach: <explanation>
    listeners.forEach((listener) => listener());
  }

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    const newValue =
      typeof partialState === 'function' ? partialState(state) : partialState;

    state = { ...state, ...newValue };
    notifyListeners();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function getState() {
    return state;
  }
  function useStore<TValue>(
    selector: (currentState: TState) => TValue,
  ): TValue {
    return useSyncExternalStore(subscribe, () => selector(state));
  }

  state = createState(setState, getState);
  listeners = new Set();

  return { useStore };
}
