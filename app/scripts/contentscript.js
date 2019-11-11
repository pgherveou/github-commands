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
    function foo() {
      console.log('onclick')
    }

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
        textarea.value = li.dataset.value
        this.hide()
      })
    })

    if (this.element.parentElement !== textarea) {
      textarea.insertAdjacentElement('beforebegin', this.element)
    }
  }
}

const popup = new Popup()
chrome.storage.sync.get('commands', function({ commands }) {
  popup.commands = JSON.parse(commands)
})

document.addEventListener('keyup', e => {
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
          e.target.value = popup.activeCommand
          popup.hide()
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
