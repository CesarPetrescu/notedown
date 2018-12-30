export default class History
{
    constructor(_options)
    {
        this.root = _options.root
        this.root.history = this

        this.states = []
        this.saving = false
        this.locked = false
        this.index = 0
        this.limitSize = 1024
    }

    getState()
    {
        const state = {}

        // Text
        state.text = this.root.lines.getText()

        // Cursor
        state.cursorPosition = this.root.cursor.position.clone()

        // Selection
        state.selectionRange = this.root.lines.selectionRange.clone().normalize()

        return state
    }

    setState(_index = null)
    {
        const index = _index === null ? this.index : _index
        const state = this.states[index]

        // No state
        if(!state)
        {
            return
        }

        // Lock history
        this.locked = true

        // Text
        this.root.lines.empty()
        this.root.lines.addText(state.text)

        // Cursor
        this.root.cursor.setPosition(state.cursorPosition)

        // Selection
        this.root.lines.updateSelection(state.selectionRange.start, state.selectionRange.end)

        // Unlock history
        this.locked = false
    }

    isStateDifferent(_stateA, _stateB)
    {
        return _stateA.text !== _stateB.text
    }

    saveState()
    {
        // Locked
        if(this.locked)
        {
            return
        }

        // Already saving
        if(this.saving)
        {
            return
        }

        // Erase states and reset index
        this.states.splice(0, this.index)
        this.index = 0

        // Compare current state and latest state
        const state = this.getState()
        const latestState = this.states[0]

        // State didn't change
        if(typeof latestState  !== 'undefined' && !this.isStateDifferent(state, latestState))
        {
            console.log('same')
            return
        }

        // Save state
        this.states.unshift(state)

        // Trim states
        this.states.splice(this.limitSize, this.states.length)

        this.saving = true

        window.requestAnimationFrame(() =>
        {
            this.saving = false
        })
    }

    undo()
    {
        // Limit
        if(this.index > this.states.length - 2)
        {
            return
        }

        // Save current state in order to redo to it
        if(this.index === 0)
        {
            const state = this.getState()
            this.states.unshift(state)

            this.index = 0
        }

        // Update index
        this.index++

        // Set state
        this.setState()
    }

    redo()
    {
        // Limit
        if(this.index <= 0)
        {
            return
        }

        // Update index
        this.index--

        // Set state
        this.setState()
    }

    log(_info = '')
    {
        console.log('---------------')
        console.log(_info)
        console.log('---------------')
        console.log(`index: ${this.index} / length: ${this.states.length}`)
        let i = 0
        for(const _state of this.states)
        {
            console.log(`[${i === this.index ? 'x' : ' '}] ${_state.text} ${' '.repeat(i)}`)
            i++
        }
    }
}
