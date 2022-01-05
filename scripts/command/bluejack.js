const config = require('../../values/config.json');
const constants=require('../constants');
const Drive = require("node-google-drive");
const {reverse} = require("dns");
const rootFolder = config["root-folder-202"];
const drive202 = new Drive({ROOT_FOLDER: rootFolder});
const credentials = require("../../values/my_credentials.json");
const fs = require("fs");

var files202;

var flag = 0;
async function initDrive() {
    let gdrive = await drive202.useServiceAccountAuth(credentials);
    files202 = await drive202.listFiles(rootFolder, null, false);

    console.log(files202.files.length);
}

initDrive();


const bluejackCommands = {
    grantSudo: function (msg) {
        let admin = constants.admins.includes(msg.author.id);
        if (!admin) message.reply("Sorry, you lack the permission...");
        return admin;
    },
    commandRandomImage:async function (msg) {
        let currFile =
            files202.files[Math.floor(Math.random() * files202.files.length)];
        let path = "./assets/202/" + currFile.name;
        do {
            currFile =
                files202.files[Math.floor(Math.random() * files202.files.length)];
            path = "./assets/202/" + currFile.name;
        } while (flag != files202.files.length && fs.existsSync(path));
        try {
            if (!fs.existsSync(path)) {
                //file exists
                await drive202.getFile(currFile, "./assets/202");
                msg.channel.send({
                    files: [path],
                    content: currFile.name,
                });
                flag++;
            } else {
                await msg.channel.send({
                    files: [path],
                    content: currFile.name,
                });
            }
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = bluejackCommands;
