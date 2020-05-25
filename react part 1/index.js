const electron = require("electron")
const fs = require("fs")
const uuid = require ("uuid")

const {app, BrowserWindow, ipcMain, Menu} = electron

let mainWindow

let allAppointments = []

fs.readFile("db.json", (err, jsonAppointments) => {
    if(!err) {
        const oldAppointments = JSON.parse(jsonAppointments)
        allAppointments = oldAppointments
    }
})

const createWindow = () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            noteIntegration: true,
        },
        title: "Doctor Appointments",
    })
    const startUrl = 
        process.env.ELECTRON_START_URL || `file://${__dirname}/build/index.html`

        mainWindow.loadURL(startUrl)

        mainWindow.on("closed", ()=> {
            const jsonAppointments = JSON.stringify(allAppointments)
            fs.writeFileSync("db.json", jsonAppointments)

            app.quit()
            mainWindow = null
        })

        if (process.env.ELECTRON_START_URL){
            const mainMenu = Menu.buildFromTemplate(menuTemplate)
            Menu.setApplicationMenu(mainMenu)
        } else {
            Menu.setApplicationMenu(null)
        }

}

app.on("ready", createWindow)

ipcMain.on("appointment:create", (event, appointment) =>{
    appointment["id"] = uuid()
    appointment["done"] = 0

    allAppointments.push(appointment)
})

ipcMain.on("appointment:request:list", event=> {
    mainWindow.webContents.send("appointment:response:list", allAppointments)
})

ipcMain.on("appointment:request:today", event => {
    sendTodayAppointments();
})

ipcMain.on("appointment:done", (event,id) => {
    allAppointment.forEach((appointment) => {
        appointment.done = 1
    })

    sendTodayAppointments()
})

const sendTodayAppointments = () => {
    const today = new Date().toISOString().slice(0,10);
    const filtered = allAppointment.filter(
        appointment => appointment.date === today
    )

    mainWindow.webContents.send("appointment:response:today", filtered);
}

const menuTemplate = [
    {
        label: "View",
        submenu: [{role: "reload"}, {role: "toggledevtools"}]
    },
]
