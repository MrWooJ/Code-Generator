const electron = require('electron')
const path = require('path')
const url = require('url')

process.env.NODE_ENV = 'development'

const {
	app,
	BrowserWindow,
	Menu,
	ipcMain,
	dialog
} = electron

let mainWindow

app.on('ready', function () {
	let {
		width,
		height
	} = require('electron').screen.getPrimaryDisplay().size

	mainWindow = new BrowserWindow({
		width: width * 4 / 5,
		height: height
	})
	mainWindow.setResizable(false)

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/html/mainWindow.html'),
		protocol: 'file:',
		slashes: true
	}))

	mainWindow.on('closed', function () {
		mainWindow = null
		app.quit()
	})

	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
	Menu.setApplicationMenu(mainMenu)
})

ipcMain.on('inputSnippet', function (e, text) {
	var controller = require('./controller/cppController.js')
	var output = controller.starter(text).toString()
	mainWindow.webContents.send('TranslatedCode', output)
})

ipcMain.on('codeSnippet', function (e, text) {
	var controller = require('./controller/cppController.js')
	controller.compiler(text, function(err, sterr, stdout) {
		if (err)
			return mainWindow.webContents.send('STDERR', err)
		mainWindow.webContents.send('STDOUT', stdout)
		mainWindow.webContents.send('STDERR', sterr)		
	})
})

ipcMain.on('alert', function (e, data) {
	dialog.showErrorBox(data.title, data.message)
})

const mainMenuTemplate = [{
		label: 'File',
		submenu: [{
				label: 'New',
				accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
				click() {
					mainWindow.webContents.send('Reset')
				}
			},
			{
				label: 'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit()
				}
			}
		]
	},
	{
		label: 'Input Actions',
		submenu: [{
				label: 'Default Input',
				accelerator: process.platform == 'darwin' ? 'Command+d' : 'Ctrl+d',
				click() {
					mainWindow.webContents.send('Default')
				}
			},
			{
				label: 'Clear Input',
				accelerator: process.platform == 'darwin' ? 'Command+c' : 'Ctrl+c',
				click() {
					mainWindow.webContents.send('Reset')
				}
			},
			{
				label: 'Translate',
				accelerator: process.platform == 'darwin' ? 'Command+t' : 'Ctrl+t',
				click() {
					mainWindow.webContents.send('Translate')
				}
			}
		]
	},
	{
		label: 'Output Actions',
		submenu: [{
				label: 'Export',
				accelerator: process.platform == 'darwin' ? 'Command+e' : 'Ctrl+e',
				click() {
					mainWindow.webContents.send('Export')
				}
			},
			{
				label: 'Compile & Run',
				accelerator: process.platform == 'darwin' ? 'Command+b' : 'Ctrl+b',
				click() {
					mainWindow.webContents.send('CompileRun')
				}
			}
		]
	}
]

if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({})
}

if (process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [{
				role: 'reload'
			},
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools()
				}
			}
		]
	})
}