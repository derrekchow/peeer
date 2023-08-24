'use strict';
const path = require('path');
const {app, BrowserWindow, Menu} = require('electron');
/// const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');

unhandled();
debug();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('com.interhouse.peeer');

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const window_ = new BrowserWindow({
		title: app.name,
	});

	window_.on('ready-to-show', () => {
		window_.show();
	});

	window_.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});

	window_.setAspectRatio(4/3)

	await window_.loadFile(path.join(__dirname, 'index.html'));

	return window_;
	
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});



(async () => {
	await app.whenReady();

	const template = [
		{
		  label: app.name,
		  submenu: [
			{ role: 'quit' },
			{ role: 'toggleDevTools' }
		  ]
		},
		{
		   label: 'File',
		   submenu: [
			  {
				label: 'Save',
				accelerator: 'Command+S',
				click: (item, mainWindow, event) => {
				  mainWindow.webContents.send('save-canvas')
				}
			  },
		   ]
		},
		{
		  label: 'Edit',
		  submenu: [
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' }
		  ]
		}
	]
	  
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();

	// mainWindow.webContents.
})();
