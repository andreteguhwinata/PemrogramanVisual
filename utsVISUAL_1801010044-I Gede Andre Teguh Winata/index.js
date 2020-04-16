const electron = require("electron");
const { v4 : uuidv4 } = require("uuid");
uuidv4();
const {
    app,
    BrowserWindow, 
    Menu, 
    ipcMain
} = electron;

let todayWindow;
let createWindow;
let listWindow;
let aboutWindow;

let allRent = [];

app.on("ready", ()=>{
    todayWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration:true
        },
        title : "RentCar v1.0"
    });

    todayWindow.loadURL(`file://${__dirname}/today.html`);
    todayWindow.on("closed", ()=>{
        app.quit();
        todayWindow=null;
    });

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);

});

const listWindowCreator = () => {
    listWindow = new BrowserWindow({
    webPreferences: {
        nodeIntegration: true
    },
    width: 600,
    height: 400,
    title: "All Rents"
    });

    listWindow.setMenu(null);
    listWindow.loadURL(`file://${__dirname}/list.html`);
    listWindow.on("closed", () => (listWindow = null));
};
const createWindowCreator = () => {
    createWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 600,
        height: 400,
        title: "Add New Rent"
        });
    
        createWindow.setMenu(null);
        createWindow.loadURL(`file://${__dirname}/create.html`);
        createWindow.on("closed", () => (createWindow = null));
    };
const aboutWindowCreator = () => {
        aboutWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            width: 600,
            height: 400,
            title: "About"
            });
        
            aboutWindow.setMenu(null);
            aboutWindow.loadURL(`file://${__dirname}/about.html`);
            aboutWindow.on("closed", () => (aboutWindow = null));
        };    

    ipcMain.on("rent:create", (event, rent) => {
        rent["id"] = uuidv4();
        rent["done"] = 0;
        allRent.push(rent);

        createWindow.close();
        console.log(allRent);
    });

    ipcMain.on("rent:request:list", event => {
        listWindow.webContents.send('rent:request:list', allRent);
    });

    ipcMain.on("rent:about", event => {
        console.log("Let me introduce");
    });
    ipcMain.on("rent:request:today", event => {
        console.log("here the rent request");
    });
    ipcMain.on("rent:done", (event, id) => {
        console.log("rent listed!");
    });



const menuTemplate = [{
        label : "File",
        submenu: [{
                label : "New Rent",

                click() {
                    createWindowCreator();
                }
            },
            {
                label: "All Rents",
                click() {
                    listWindowCreator();
                }
            },
            {
                label:"Quit",
                click() {
                app.quit();
                }
            }
        ]
    },

{
    label: "View",
    submenu: [{ role : "reload"}, {role: "toggledevtools"}]
}, 
{   
    label: "About",
    click(){
        aboutWindowCreator();
    }
}
]