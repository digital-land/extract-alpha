export class ReactiveProp<T> {
  private state: T
  private subscribers: Function[]

  constructor (initialState: T) {
    this.state = initialState
    this.subscribers = []
  }

  get (): T {
    return this.state
  }

  set (value: T) {
    if (this.state === value) {
      return
    }
    this.state = value
    this.subscribers.forEach((subscriber) => {
      subscriber(value)
    })
  }

  subscribe (callback: Function) {
    this.subscribers.push(callback)
  }

  unsubscribe (callback: Function) {
    const index = this.subscribers.indexOf(callback)
    if (index !== -1) {
      this.subscribers.splice(index, 1)
    }
  }
}
