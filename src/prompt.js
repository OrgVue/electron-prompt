const { ipcRenderer } = require("electron")

const buttonOK = document.querySelector("#ok")
const buttonCancel = document.querySelector("#cancel")
const dataEl = document.getElementById("data")
const label = document.querySelector("#label")

let id = null,
  options

document.addEventListener("DOMContentLoaded", event => {
  id = document.location.hash.replace("#", "")
  try {
    options = JSON.parse(ipcRenderer.sendSync(`prompt-get-options:${id}`))
  } catch (e) {
    return promptError(e)
  }

  dataEl.setAttribute("type", options.type || "text") // can be "hidden"?

  dataEl.addEventListener("keyup", event => {
    if (event.which === 13) {
      // return key pressed
      clickOK()
    }
    if (event.which === 27) {
      // escape key pressed
      clickCancel()
    }
  })

  const clickOK = () => {
    sendData(dataEl.value)
  }

  const clickCancel = () => {
    sendData(null)
  }

  label.textContent = options.label
  buttonOK.addEventListener("click", clickOK)
  buttonCancel.addEventListener("click", clickCancel)

  const sendData = data => {
    ipcRenderer.sendSync(`prompt-post-data:${id}`, data)
  }

  dataEl.focus()
})
