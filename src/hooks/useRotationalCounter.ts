export const useRotationalCounter = (props: {
  max: number | (() => number),
  initial?: number
}) => {
  let value: number = props.initial || 0

  let assertZero = (num: number) => num < 0 ? 0 : num

  return {
    increment() {
      value = value + 1 >= (props.max instanceof Function ? props.max() : props.max) ? 0 : value + 1
    },

    decrement() {
      value = assertZero(value - 1 < 0 ? (props.max instanceof Function ? props.max() : props.max) - 1 : value - 1)
    },

    now() {
      return value
    }
  }
}
