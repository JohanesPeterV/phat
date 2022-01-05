const config = require("./values/config.json");
const Discord = require("discord.js");
const basicCommands = require("./scripts/command/basic")
const bluejackCommands = require("./scripts/command/bluejack")
const musicCommands = require("./scripts/command/music")
require('./scripts/exit');
const client = new Discord.Client({
    autoReconnect: true,
    presence: {status: "online"},
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const Guilds = client.guilds.cache.map((guild) => guild.name);
    console.log(Guilds);
});

client.login(config.token);


function makeDecision(msg, args, arg, admin) {
    const commands = config.commands;
    switch (args[0]) {
        case 'sudo':
            args.shift();
            arg = arg.substring("5", arg.length);
            admin = bluejackCommands.grantSudo(msg);
            makeDecision(msg, args, arg, admin);
            break;
        case commands.randomdog:
            basicCommands.randomDogCommand(msg);
            break;
        case commands.randomcat:
            basicCommands.randomCatCommand(msg);
            break;
        case commands.randommeme:
            basicCommands.randomMemeCommand(msg);
            break;
        case commands.randomactivity:
            basicCommands.randomActivityCommand(msg);
            break;
        case commands.help:
            basicCommands.helpCommand(msg);
            break;
        case commands.covidinfo:
            basicCommands.covidCommand(arg, msg);
            break;
        case commands.translate:
            basicCommands.translate(args, arg, msg);
            break;
        case commands.playmusic:
            musicCommands.playMusic(msg, arg);
            break;
        case commands.stopmusic:
            musicCommands.stopCommand(msg);
            break;
        case commands.skipmusic:
            musicCommands.skipCommand(msg);
            break;
        case commands.listmusic:
            musicCommands.queueCommand(msg);
            break;
        case commands.pausemusic:
            musicCommands.pauseCommand(msg);
            break;
        case commands.continuemusic:
            musicCommands.continueCommand(msg);
            break;
        case commands.speech:
            musicCommands.speechCommand(msg, args, arg);
            break;
        case commands.wind:
            musicCommands.playMusic(msg, "play https://www.youtube.com/watch?v=Q-ewbdi0Hxc");
            break;
        case commands.cricket:
            musicCommands.playMusic(msg, "play https://www.youtube.com/watch?v=K8E_zMLCRNg");
            break;
        case commands[202]:
            if (admin) bluejackCommands.commandRandomImage(msg);
            else {
                msg.channel.send("Only root can use this command (try using sudo).");
            }
            break;
    }
}













function initListeners(){

    client.on("messageCreate", async (msg) => {
        if (msg.author.bot) return;
        let arg = msg.content;
        if (!arg||arg[0].toLowerCase() !== "p") return;
        arg = arg.substring(1, arg.length);
        let args = arg.split(" ");
        args[0] = args[0].toLowerCase();
        makeDecision(msg, args, arg, false);
    });
    client.on("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.member.id === client.user.id) {
            if (!newState.channel) {
                musicCommands.queue.delete(oldState.guild.id);
            }
        }
        if (
            newState.member.roles.cache.some((role) => role.name === "phat_grounded")
        ) {
            if (newState.member.voice) newState.member.voice.disconnect();
        }
    });
}
initListeners();
