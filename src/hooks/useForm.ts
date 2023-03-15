type MakeUndefinable<T extends Record<any, any>> = {
  [K in keyof T]: T[K] | undefined
}

export function useForm<T extends Record<any, any>>(form: MakeUndefinable<T>) {
  let completed: boolean = false

  const checkIsCompleted = () => {
    for (const key of Object.keys(form)) {
      if (form[key] === undefined) return false
    }

    return true
  }

  return {
    fullfill<P extends keyof T>(key: P, value: T[P]) {
      form[key] = value
      completed = checkIsCompleted()
    },

    clear<P extends keyof T>(key: P) {
      form[key] = undefined
      completed = checkIsCompleted()
    },

    value<P extends keyof T>(key: P): MakeUndefinable<T>[P] {
      return form[key]
    },

    get isCompleted(): boolean {
      return completed
    },

    get data(): T {
      if (!completed) throw new Error('data can only be called after completing the form use `form#value instead`')
      return form as T
    }
  }
}