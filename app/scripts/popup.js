const textarea = document.getElementById('commands-textarea')
const button = document.getElementById('commands-save-button')
const errorText = document.getElementById('commands-error-text')
const successText = document.getElementById('commands-success-text')

chrome.storage.sync.get('commands', function({ commands }) {
  if (commands) {
    textarea.value = commands
  }
})

button.onclick = () => {
  try {
    const data = JSON.parse(textarea.value)
    if (!Array.isArray(data)) {
      failure('Invalid command list')
      return
    }

    chrome.storage.sync.set({ commands: textarea.value }, function() {
      success('commands saved')
    })
  } catch (err) {
    failure('Invalid command list')
  }
}

function success(text) {
  successText.style.display = 'block'
  errorText.style.display = 'hidden'
  successText.innerText = text
}

function failure(text) {
  successText.style.display = 'hidden'
  errorText.style.display = 'block'
  errorText.innerText = text
}
