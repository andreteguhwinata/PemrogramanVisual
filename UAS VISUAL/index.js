const electron = require("electron");
const { v4 : uuidv4} = require ('uuid');
uuidv4();
const fs = require ('fs');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let todayWindow;
let createWindow;
let listWindow;

let allRent = [];

fs.readFile("db.json", (err, jsonRents) => {
    if(!err){
        const oldRent = JSON.parse(jsonRents);
        allRent = oldRent;
    }
});

app.on("ready",  () => {
    todayWindow = new BrowserWindow({
       webPreferences : {
           nodeIntegration : true
        },
        title : "RentCar v1.0"  
    });

    todayWindow.loadURL(`file://${__dirname}/today.html`);
    todayWindow.on("closed", () => {

        const jsonRent = JSON.stringify(allRent);
        fs.writeFileSync("db.json", jsonRent);

        app.quit();
        todayWindow = null;
    });

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);

});

const listWindowCreator = () =>{
    listWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration : true
        },

        width: 600,
        height: 400,
        title : "All Rents"
    });
    
    listWindow.setMenu(null);
    listWindow.loadURL(`file://${__dirname}/list.html`);

    listWindow.on("closed", () => (listWindow = null ));
};

const createWindowCreator = () =>{
    createWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration : true
        },

        width: 600,
        height: 400,
        title : "Add New Rents"
    });
    
    createWindow.setMenu(null);
    createWindow.loadURL(`file://${__dirname}/create.html`);

    createWindow.on("closed", () => (createtWindow = null ));
};

const aboutWindowCreator = () =>{
    aboutWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration : true
        },

        width: 600,
        height: 400,
        title : "About"
    });
    
    aboutWindow.setMenu(null);
    aboutWindow.loadURL(`file://${__dirname}/about.html`);

    aboutWindow.on("about", () => (aboutWindow = null ));
};

ipcMain.on("rent:create", (event, rent) =>{
    rent["id"] = uuidv4();
    rent["done"] = 0;
    allRent.push(rent);
    sendTodayRents();
    createWindow.close();

    console.log(allRent);
});

ipcMain.on("rent:request:list", event => {
    listWindow.webContents.send('rent:response:list', allRent);
});

ipcMain.on("rent:about", event => {
    console.log("Let me introduce");
});
ipcMain.on("rent:request:today", event => {
    sendTodayRents();
    console.log("here the rent request");
});

ipcMain.on("rent:done", (event,id) => {
    allRent.forEach((rent) => {
        rent.done = 1
    })

    sendTodayRents()
});


const sendTodayRents = () => {
    const today = new Date().toISOString().slice(0,10);
    const filtered = allRent.filter(
        rent => rent.date === today
    );

    todayWindow.webContents.send("rent:response:today", filtered);
};
 
 
const menuTemplate = [{
    label : "File",
    submenu : [{
        label : "New Rent",

            click(){
                createWindowCreator();
            }
        },
        {
            label : "All Rents",
            click(){
                listWindowCreator();
            }
        },
        {
            label: "Quit",
            accelerato : process.platform === "darwin" ? "Command+Q" :
            "Ctrl+Q",
            click(){
                app.quit(); 
            }


        }

    ]
},
{
    label: "View",
    submenu : [{ role : "reload"}, {role: "toggledevtools"}]
},
{
    label: "About",
    click(){
        aboutWindowCreator();
    
    }

    
}

]