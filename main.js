const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs');
const resizeImg = require('resize-img');
const { shell } = require('electron')

process.env.NODE_ENV = 'production';

const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV !== 'production';
let mainWindow;

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: isDev ? 1000 : 500,
        height: 750,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './render/index.html'))
}

const createAboutWindow = () => {
    const aboutWindow = new BrowserWindow({
        width: 300,
        height: 300,
        title: 'About Image Resizer',
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    })

    aboutWindow.loadFile(path.join(__dirname, './render/about.html'))
}

app.on('ready', () => {
    createMainWindow()

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('img:resize', (event, options) => {
    options.destination = path.join(os.homedir(), 'Downloads/ImageResizer')
    imgResize(options);
})

async function imgResize({ width, height, imgpath, destination }) {
    try {
        const image = await resizeImg(fs.readFileSync(imgpath), {
            width: +width,
            height: +height
        });

        // Create filename
        const filename = path.basename(imgpath);

        // Create destination folder if not exists
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination);
        }

        fs.writeFileSync(path.join(destination, filename), image);

        // Send message to renderer
        mainWindow.webContents.send('image:done');

        shell.showItemInFolder(destination)
    } catch (error) {
        console.log(error);
    }
}

const template = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow,
            },
        ]
    }] : []),
    {
        label: 'File',
        submenu: [
            { role: 'minimize' },
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    ...(!isMac ? [{
        label: 'About',
        click: createAboutWindow,
    }] : []),
    {
        label: 'View',
        submenu: [
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    ...(isDev ? [{
        label: 'Developer',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
        ],
    }] : []),
]