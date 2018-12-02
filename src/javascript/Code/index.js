import Lines from './Lines.js'
import Textarea from './Textarea.js'
import Cursor from './Cursor.js'

export default class Code
{
    constructor()
    {
        this.setContainer()
        this.setLines()
        this.setCursor()
        this.setTextarea()
        this.setSelection()
    }

    setCursor()
    {
        this.cursor = new Cursor({
            measures: this.lines.measures
        })
        this.container.$element.appendChild(this.cursor.$element)

        // Events callback
        const mousedown = (_event) =>
        {
            const position = this.getPosition(_event.clientX, _event.clientY)
            this.cursor.setPosition(position)

            window.addEventListener('mousemove', mousemove)
            window.addEventListener('mouseup', mouseup)
        }
        const mousemove = (_event) =>
        {
            const position = this.getPosition(_event.clientX, _event.clientY)
            this.cursor.setPosition(position)
        }
        const mouseup = () =>
        {
            window.removeEventListener('mousemove', mousemove)
            window.removeEventListener('mouseup', mousemove)
        }

        // Mousedown
        this.container.$element.addEventListener('mousedown', mousedown)
    }

    setContainer()
    {
        this.container = {}

        // Element
        this.container.$element = document.createElement('div')
        this.container.$element.classList.add('code')
        document.body.appendChild(this.container.$element)
    }

    getPosition(_x, _y)
    {
        let lineIndex = null
        let rowIndex = null

        let beforeFirstLine = false
        let afterLastLine = false

        /**
         * Line
         */
        lineIndex = Math.floor(_y / this.lines.measures.lineHeight)

        // Before first line
        if(lineIndex < 0)
        {
            beforeFirstLine = true
            lineIndex = 0
        }

        // After last line
        else if(lineIndex > this.lines.items.length - 1)
        {
            afterLastLine = true
            lineIndex = this.lines.items.length - 1
        }

        /**
         * Row
         */
        // Before first line
        if(beforeFirstLine)
        {
            rowIndex = 0
        }
        // After last line
        else if(afterLastLine)
        {
            // Has no line
            if(this.lines.items.length === 0)
            {
                rowIndex = 0
            }
            // Last line
            else
            {
                const lastLine = this.lines.items[this.lines.items.length - 1]
                rowIndex = lastLine.originalText.length
            }
        }
        // Between first and last line
        else
        {
            rowIndex = Math.round(_x / this.lines.measures.rowWidth)

            const line = this.lines.items[lineIndex]

            if(rowIndex < 0)
            {
                rowIndex = 0
            }
            else if(rowIndex > line.originalText.length)
            {
                rowIndex = line.originalText.length
            }
        }

        return {
            lineIndex,
            rowIndex
        }
    }

    setTextarea()
    {
        this.textarea = new Textarea()
        this.container.$element.appendChild(this.textarea.$element)
    }

    setSelection()
    {
        this.selection = {}
        this.selection.direction = 'normal'
        this.selection.start = { lineIndex: 0, rowIndex: 0 }
        this.selection.end = { lineIndex: 0, rowIndex: 0 }

        // Events callback
        const mousedown = (_event) =>
        {
            this.selection.start = this.getPosition(_event.clientX, _event.clientY)
            this.selection.end = { ...this.selection.start }

            this.lines.updateSelection(this.selection)

            window.addEventListener('mousemove', mousemove)
            window.addEventListener('mouseup', mouseup)
        }
        const mousemove = (_event) =>
        {
            this.selection.end = this.getPosition(_event.clientX, _event.clientY)

            if(this.selection.end.lineIndex < this.selection.start.lineIndex || this.selection.end.lineIndex === this.selection.start.lineIndex && this.selection.end.rowIndex < this.selection.start.rowIndex)
            {
                this.selection.direction = 'reverse'
            }
            else
            {
                this.selection.direction = 'normal'
            }

            this.lines.updateSelection(this.selection)
        }
        const mouseup = () =>
        {
            window.removeEventListener('mousemove', mousemove)
            window.removeEventListener('mouseup', mousemove)
        }

        // Mousedown
        this.container.$element.addEventListener('mousedown', mousedown)
    }

    setLines()
    {
        this.lines = new Lines()
        this.container.$element.appendChild(this.lines.$element)
        this.lines.updateMeasures()
    }

    destruct()
    {
        this.container.$element.remove()
    }
}