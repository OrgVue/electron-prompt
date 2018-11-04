const { BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const url = require("url")

const prompt = (options, parent) =>
  new Promise((resolve, reject) => {
    const id = `${new Date().getTime()}-${Math.random()}`

    const opts = Object.assign(
      {
        width: 370,
        height: 130,
        resizable: false,
        // resizable: true,
        title: "Prompt",
        label: "Please input a value:",
        alwaysOnTop: true,
        value: null,
        type: "input",
        selectOptions: null,
        icon: null
      },
      options || {}
    )

    let promptWindow = new BrowserWindow({
      width: opts.width,
      height: opts.height,
      resizable: opts.resizable,
      parent,
      skipTaskbar: true,
      alwaysOnTop: opts.alwaysOnTop,
      useContentSize: true,
      modal: Boolean(parent),
      title: opts.title,
      icon: opts.icon
    })

    const cleanup = () => {
      if (promptWindow) {
        promptWindow.close()
        promptWindow = null
      }
    }

    const getOptionsHandler = event => {
      event.returnValue = JSON.stringify(opts)
    }

    const postDataHandler = (event, value) => {
      resolve(value)
      event.returnValue = null
      cleanup() // closes the prompt
    }

    promptWindow.setMenu(null)

    ipcMain.on(`prompt-get-options:${id}`, getOptionsHandler)

    ipcMain.on(`prompt-post-data:${id}`, postDataHandler)

    promptWindow.on("closed", () => {
      ipcMain.removeListener(`prompt-get-options:${id}`, getOptionsHandler)
      ipcMain.removeListener(`prompt-post-data:${id}`, postDataHandler)
      resolve(null)
    })

    const promptUrl = url.format({
      protocol: "file",
      slashes: true,
      pathname: path.join(__dirname, "prompt.html"),
      hash: id
    })

    promptWindow.loadURL(promptUrl)

    // promptWindow.loadFile(`prompt.html#${id}`)

    // promptWindow.webContents.openDevTools()
  })

module.exports = prompt
