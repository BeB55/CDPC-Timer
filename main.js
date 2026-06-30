const { app, BrowserWindow, Menu } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
        contextIsolation: false
    }
  })

  win.loadFile('index.html')

  const template = [
    {
      label: 'Archivo',
      submenu: [
        { role: 'quit',
          label: 'Salir'
         }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo',
          label: 'Deshacer'
         },
        { role: 'redo',
          label: 'Rehacer'
         },
        { type: 'separator'},
        { role: 'cut',
          label: 'Cortar'
         },
        { role: 'copy',
          label: 'Copiar'
         },
        { role: 'paste',
          label: 'Pegar'
         }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload',
          label: 'Recargar'
         },
        { role: 'toggledevtools',
          label: 'Alternar Herramientas de Desarrollo'
         },
        { type: 'separator' },
        { role: 'togglefullscreen',
          label: 'Alternar Pantalla Completa'
         }
      ]
    },
    {
      label: 'ayuda',
      submenu: [
        {
          label: 'Changelog',
          click: () => {
            // Lógica para mostrar información sobre la aplicación
            win.webContents.executeJavaScript('mostrarChangelog()')
          }
        },
        {
          label: 'Acerca de',
          click: () => {
            // Lógica para mostrar información sobre la aplicación
            win.webContents.executeJavaScript('alert("CDPC Timer v1.2.0\\nDesarrollado por: BeB&Solutions")')    }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})