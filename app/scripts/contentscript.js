// match "$var" in "/command $var"
const varRegex = /(\$\S+)/

class Popup {
  constructor() {
    this.commands = []
    const template = document.createElement('template')
    template.innerHTML = `<ul role="listbox" class="suggester-container suggester suggestions list-style-none position-absolute" style="top: 9px; left: 13px; max-height: 300px; overflow: scroll;" />`
    this.element = template.content.firstElementChild
  }

  get activated() {
    return this.element.parentElement && this.element.childNodes.length > 0
  }

  get activeCommand() {
    return this.element.querySelector('[aria-selected="true"]').dataset.value
  }

  hide() {
    this.element.style.display = 'none'
    this.element.innerHTML = ''
  }

  selectNext() {
    const previous = this.element.querySelector('[aria-selected="true"]')
    const current = previous.previousElementSibling || this.element.lastElementChild
    previous.removeAttribute('aria-selected')
    current.setAttribute('aria-selected', 'true')
    current.scrollIntoView()
  }

  selectPrevious() {
    const previous = this.element.querySelector('[aria-selected="true"]')
    const current = previous.nextElementSibling || this.element.firstElementChild
    previous.removeAttribute('aria-selected')
    current.setAttribute('aria-selected', 'true')
    current.scrollIntoView()
  }

  /**
   * @param {HTMLTextAreaElement} textarea
   */
  update(textarea) {
    const search = textarea.value
    const filteredCommands = search ? this.commands.filter(cmd => cmd.name.startsWith(search)) : []
    this.element.innerHTML = filteredCommands
      .map((cmd, index) => {
        return `
          <li role="option" data-value="${cmd.name}" ${index === 0 ? 'aria-selected="true"' : ''}>
              <div>${cmd.name}</div>
          </li>`
      })
      .join('\n')

    this.element.style.display = filteredCommands.length === 0 ? 'none' : 'block'

    this.element.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', e => {
        e.preventDefault()
        this.activate(textarea, li.dataset.value)
      })
    })

    if (this.element.parentElement !== textarea) {
      textarea.insertAdjacentElement('beforebegin', this.element)
    }
  }

  /**
   * @param {HTMLTextAreaElement} textarea
   * @param {string} command
   */
  activate(textarea, command) {
    textarea.value = command
    this.hide()
    const res = varRegex.exec(command)
    if (res && res[0]) {
      textarea.setSelectionRange(res.index, res.index + res[0].length)
    }
  }
}

const popup = new Popup()
chrome.storage.sync.get('commands', function({ commands }) {
  if (commands) {
    popup.commands = JSON.parse(commands)
  }
})

document.addEventListener('keydown', e => {
  switch (e.code) {
    case 'ArrowUp':
      {
        if (popup.activated) {
          e.preventDefault()
          popup.selectNext()
        }
      }
      break
    case 'ArrowDown':
      {
        if (popup.activated) {
          e.preventDefault()
          popup.selectPrevious()
        }
      }
      break
    case 'Enter':
      {
        if (popup.activated) {
          e.preventDefault()
          popup.activate(e.target, popup.activeCommand)
        }
      }
      break
    default: {
      if (e.target.tagName === 'TEXTAREA') {
        popup.update(e.target)
      }
    }
  }
})
