export default class HistoryManager {
  private undoStack: any[]
  private redoStack: any[]
  private state: any

  constructor (initialState: any) {
    this.undoStack = []
    this.redoStack = []
    this.state = initialState
  }

  // Record a new state (after user action)
  addState (newState: any) {
    this.undoStack.push(this.state)
    this.state = newState
    this.redoStack = []
    return {
      undoStackLength: this.undoStack.length,
      redoStackLength: this.redoStack.length
    }
  }

  undo () {
    if (this.undoStack.length === 0) {
      return
    }
    this.redoStack.push(this.state)
    this.state = this.undoStack.pop()
    return {
      state: this.state,
      undoStackLength: this.undoStack.length,
      redoStackLength: this.redoStack.length
    }
  }

  redo () {
    if (this.redoStack.length === 0) {
      return
    }
    this.undoStack.push(this.state)
    this.state = this.redoStack.pop()
    return {
      state: this.state,
      undoStackLength: this.undoStack.length,
      redoStackLength: this.redoStack.length
    }
  }

  clear () {
    this.undoStack = []
    this.redoStack = []
  }
}
