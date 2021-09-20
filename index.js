const config = require("./config.json");
const credentials = require("./my_credentials.json");
const fetch = require("node-fetch");
const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");


const client = new Discord.Client({
  autoReconnect: true,
  presence: { status: "online" },
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
});

// const request = require('request')
const qs = require("querystring");
const http = require("https");
const ytdl = require("ytdl-core");

var gttsid = require("node-gtts")("id");
var gttsen = require("node-gtts")("en");
var gttsjp = require("node-gtts")("ja");

const {
  joinVoiceChannel,
  createAudioResource,
  // AudioPlayer,
  // VoiceConnectionStatus,
  // entersState,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const { createAudioPlayer, NoSubscriberBehavior } = require("@discordjs/voice");
const ytsr = require("ytsr");
client.on("voiceStateUpdate", async (oldState, newState) => {
  if (oldState.member.id == client.user.id) {
    if (!newState.channel) {
      queue.delete(oldState.guild.id);
    }
  }
  // if(newState.member.id=='727839410212569128'){
  //   if(newState.member.voice)newState.member.voice.disconnect();
  // }
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  let arg = msg.content;
  if(!arg)return;
  if (!arg[0].toLowerCase == "p") return;
  arg = arg.substring(1, arg.length);
  let args = arg.split(" ");

  args[0] = args[0].toLowerCase();
  makeDecision(msg, args, arg, false);
});

function makeDecision(msg, args, arg, admin) {
  const commands = config.commands;
  switch (args[0]) {
    case "sudo":
      args.shift();
      arg = arg.substring("5", arg.length);
      admin = grantSudo(msg);
      makeDecision(msg, args, arg, true);
      break;
    case commands.randomdog:
      randomDogCommand(msg);
      break;
    case commands.randommeme:
      randomMemeCommand(msg);
      break;
    case commands.randomactivity:
      randomActivityCommand(msg);
      break;
    case commands.help:
      helpCommand(msg);
      break;
    case commands.covidinfo:
      covidCommand(arg, msg);
      break;
    case commands.translate:
      translate(args, arg, msg);
      break;
    case commands.playmusic:
      playMusic(msg, arg);
      break;
    case commands.stopmusic:
      stopCommand(msg);
      break;
    case commands.skipmusic:
      skipCommand(msg);
      break;
    case commands.listmusic:
      queueCommand(msg);
      break;
    case commands.pausemusic:
      pauseCommand(msg);
      break;
    case commands.continuemusic:
      continueCommand(msg);
      break;
    case commands.speech:
      speechCommand(msg, args, arg);
      break;
    case commands.cricket:
      playMusic(msg, "play https://www.youtube.com/watch?v=K8E_zMLCRNg");
      break;
    case commands[202]:
      if (admin) command202(msg);
      else {
        msg.channel.send("Only root can use this command (try using sudo).");
      }
      break;
  }

}



const Drive = require("node-google-drive");
const rootFolder = config["root-folder-202"];
const drive202 = new Drive({ ROOT_FOLDER: rootFolder });

var files202;
async function initDrive() {
  let gdrive = await drive202.useServiceAccountAuth(credentials);
  files202 = await drive202.listFiles(rootFolder, null, false);
}

initDrive();

const admins = [
  "727839410212569128",
  "267590135162470401",
  "640864098271100929",
  "272641788789915648",
  "659069308617621514",
  "636201389940408341",
  "367296175096725506",
  "646164977396482090",
  "295384747402592257",
];
function grantSudo(msg) {
  let admin = admins.includes(msg.author.id);
  if (!admin) message.reply("Sorry, you lack the permission...");
  return admin;
}

client.login(config.token);

process.stdin.resume();

function exitHandler(options, exitCode) {
  if (options.cleanup) {
    const dir = "./assets/202";
    fs.readdirSync(dir).forEach((file) =>
      fs.unlink(path.join(dir, file), (err) => {
        if (err) throw err;
      })
    );
    // (err, files) => {
    //   console.log('masuk')
    //   if (err) throw err;
    //   for (const file of files) {
    //     console.log('masuk')
    //     fs.unlink(path.join(dir, file), (err) => {
    //       if (err) throw err;
    //     });
    //   }
    // }
  }
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on("exit", exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));

var flag = 0;
async function command202(msg) {
  let currFile =
    files202.files[Math.floor(Math.random() * files202.files.length)];
  let path = "./assets/202/" + currFile.name;
  while (flag != files202.files.length && fs.existsSync(path)) {
    currFile =
      files202.files[Math.floor(Math.random() * files202.files.length)];
    path = "./assets/202/" + currFile.name;
  }
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



async function translate(args, translateString, e) {
  if (!args[1] || !args[2] || args[1].length > 2 || args[2].length > 2) {
    e.channel.send("Please input a valid syntax (ex: ptranslate id en telor)");
  }
  translateString = translateString.substring(16, translateString.length);

  const options = {
    method: "POST",
    hostname: "google-translate1.p.rapidapi.com",
    port: null,
    path: "/language/translate/v2",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "accept-encoding": "application/gzip",
      "x-rapidapi-key": "834040954fmsh58200765605a90dp1dfe06jsncb549e7cc5e8",
      "x-rapidapi-host": "google-translate1.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req = http.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      let body = Buffer.concat(chunks);
      body = JSON.parse(body.toString());
      if (typeof body.data.translations === "undefined") {
        e.channel.send(
          "Please input a valid language code (ex: ptranslate id en telor)"
        );
      }
      // if(typeof body.translations!=="undefined")
      e.channel.send(body.data.translations[0].translatedText);
    });
  });

  try {
    req.write(
      qs.stringify({ q: translateString, target: args[2], source: args[1] })
      // qs.stringify({ q: "telor", target: "en", source: "id" })
    );
  } catch {
    e.channel.send(
      "Please input a valid language code (ex: ptranslate id en telor)"
    );
  }
  req.end();
}

async function covid(country, e) {
  const options = {
    method: "GET",
    hostname: "covid-193.p.rapidapi.com",
    port: null,
    path: "/statistics?country=" + country,
    headers: {
      "x-rapidapi-key": "834040954fmsh58200765605a90dp1dfe06jsncb549e7cc5e8",
      "x-rapidapi-host": "covid-193.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req = http.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      const body = Buffer.concat(chunks);
      const data = JSON.parse(body.toString()).response[0];
      if (data === undefined) {
        e.channel.send("Please input a valid country..");
        return;
      }
      if (data.cases === undefined) {
        e.channel.send("Please input a valid country..");
        return;
      }
      const population = data.population;
      const newC = data.cases.new;
      const currC = data.cases.active;
      const recovered = data.cases.recovered;
      const totalC = data.cases.total;
      const newD = data.deaths.new;
      const totalD = data.deaths.total;
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Covid Status Report")
        .setDescription("Covid status in " + country)
        .addFields(
          // { name: 'Covid Cases',
          // value: 'Cases'

          // },
          // { name: '\u200B', value: '\u200B' },
          {
            name: "Covid cases",
            value:
              "```" +
              "New Cases       :" +
              newC +
              "\n" +
              "Active Cases    :" +
              currC +
              "\n" +
              "Total Cases     :" +
              totalC +
              "\n" +
              "Total Recovered :" +
              recovered +
              "\n" +
              "```",
            inline: true,
          },

          {
            name: "Death Caused by covid",
            value:
              "```" +
              "New Deaths  :" +
              newD +
              "\n" +
              "Total Deaths:" +
              totalD +
              "```",
            inline: true,
          }
        )

        .setTimestamp()
        .setFooter(country + " currently have " + population + " citizens");
      e.channel.send({ embeds: [exampleEmbed] });
    });
  });

  req.end();
}

async function randomMemeCommand(e) {
  const response = await fetch(config.apis.meme);
  data = await response.json();
  if (response) {
    e.channel.send(data.data.memes[Math.floor(Math.random() * 100)].url);
  }
}
async function randomDogCommand(e) {
  const response = await fetch(config.apis.dog);
  data = await response.json();
  if (response) {
    e.channel.send(data.message);
  }
}
async function randomActivityCommand(e) {
  const response = await fetch(config.apis.activity);
  data = await response.json();
  if (response) {
    const embedActivity = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle(data.type)
      .setDescription(data.activity);
    e.channel.send({ embeds: [embedActivity] });
  }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const Guilds = client.guilds.cache.map((guild) => guild.name);
  console.log(Guilds);

  // console.log(client.fetchGuildPreview())
});

const queue = new Map();

function play(guild, curr) {
  song = curr.songs[0];

  if (song === undefined||!song||typeof song==="undefined") {
    queue.delete(guild.id);

    curr.timeOut = setTimeout(() => {
      curr.connection.disconnect();
    }, 1800000);
    return;
  } else {
    if (curr.timeOut) {
      clearTimeout(curr.timeOut);
      curr.timeOut=null;
    }
  }
  let rs;
  if (song.type === 0) {
    rs = createAudioResource(
      ytdl(song.url, {
        filter: "audio",
        quality: "highest",
        
      })
    );
  } else {
    try{
      
      switch(song.sl){
        case 'id':
          rs = createAudioResource(gttsid.stream(song.text));
          break;
          case 'en':
            
        rs = createAudioResource(gttsen.stream(song.text));
            break;
            case 'ja':
              rs = createAudioResource(gttsjp.stream(song.text));
              break;
                
      }
      
    }catch{
      curr.textChannel.send("I cannot play "+song.title);
      curr.songs.shift();
      play(guild,curr);
      return;
    }
  }
  curr.player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
      
    },
  });
  
    curr.player.play(rs);
    curr.connection.subscribe(curr.player);
    curr.player.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle") {
        curr.songs.shift();
        play(guild, curr);
      }
    });
    curr.player.on("error", (error) => {
      console.log(error);
  
    });
  
    curr.textChannel.send(`Now playing: **${song.title}**`);
  


}

async function validateUrl(arg, msg) {
  if (arg) {
    var regExp =
      /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (arg.match(regExp)) {
      return arg;
    }

  }

  msg.channel.send("Searching " + arg);
  const filters = await ytsr.getFilters(arg);
  const filteredQuery = filters.get("Type").get("Video");
  const srResult = await ytsr(filteredQuery.url, {
    limit: 1,
    gl: "us",
    hl: "en",
  });
  if (!srResult.items[0]) {
    queue.delete(msg.guildId);
    msg.channel.send("Search result not found");
    return null;
  }
  arg = srResult.items[0].url;

  return arg;
}

function vcValidation(msg) {
  const VC = msg.member.voice.channel;
  if (!VC) {
    msg.channel.send("You must be in a voice channel to use this command");
    return false;
  }
  const permissions = VC.permissionsFor(msg.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    msg.channel.send("I don't have the permission to join and talk.");
    return false;
  }
  return true;
}

async function getSong(msg, arg) {
  arg = await validateUrl(arg, msg);
  if (!arg) return false;
  try {
    const song = await ytdl.getInfo(arg);
    const curr = {
      title: song.videoDetails.title,
      url: song.videoDetails.video_url,
      duration: song.videoDetails.lengthSeconds,
      link: song.videoDetails.video_url,
      type: 0,
      requester: msg.author.id,
    };
    return curr;
  } catch (e) {
    msg.channel.send("Please enter a valid url");
    return false;
  }
}

async function playMusic(msg, arg) {
  if (!arg.includes("play ")) {
    msg.channel.send("Please enter a valid syntax: p play [url/searchstring]");
    return;
  }

  arg = arg.substring(5, arg.length);
  if (!vcValidation(msg)) return;
  const curr = await getSong(msg, arg);
  if (!curr) return;
  addToQueue(msg, curr);
}

function getSpeech(msg, arg, language) {
  if (!arg) return false;
  const curr = {
    title: "Speech: " + arg,
    text: arg,
    duration: "Unknown",
    link: "-",
    type: 1,
    sl: language,
    requester: msg.author.id,
  };
  return curr;
}

async function speechCommand(msg, args, arg) {
  if (!vcValidation(msg)) {
    return;
  }
  if (arg.lengt < 15) {
    msg.channel.send(
      "Please enter a valid syntax: pspeech [language] [speechstring]\nAvailable languages: id(indonesia), en(english), ja(japanese)"
    );
    return;
  }
  let currLanguage;
  switch (args[1].toLowerCase()) {
    case "en":
      currLanguage = "en";
      break;
    case "id":
      currLanguage = "id";
      break;
      case "ja":
        currLanguage="ja";
        break;
    default:
      msg.channel.send(
        "Please enter a valid syntax: pspeech [language] [speechstring]\nAvailable languages: id(Indonesia), en(English)"
      );
      return;
  }
  arg = arg.substring("9", arg.length);

  const curr = getSpeech(msg, arg, currLanguage);
  if (!curr) return;

  addToQueue(msg, curr);
}

async function addToQueue(msg, curr) {
  if (!curr) {
    return;
  }
  const serverQueue = queue.get(msg.guildId);

  const VC = msg.member.voice.channel;
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: VC,
      connection: null,
      songs: [],
      volume: 1,
      playing: true,
      player: null,
      timeOut: null

    };
    queue.set(msg.guild.id, queueConstruct);
    try {
      queueConstruct.songs.push(curr);

      try {
        const connection = await joinVoiceChannel({
          channelId: VC.id,
          guildId: VC.guildId,
          adapterCreator: VC.guild.voiceAdapterCreator,
        });
        queueConstruct.connection = connection;
        play(msg.guild, queueConstruct);
      } catch (err) {
        console.log(err);
        queue.delete(msg.guild.id);
        msg.channel.send(err);
        return;
      }
    } catch {
      queue.delete(msg.guildId);
      msg.channel.send("Please enter a valid url");
      return false;
    }
  } else {
    serverQueue.songs.push(curr);
    msg.channel.send(curr.title + " has been added to the queue!");
  }
}

function queueCommand(msg) {
  const serverQueue = queue.get(msg.guild.id);
  if (!serverQueue) {
    msg.channel.send("No Queue available");
    return;
  }
  queueString = "";
  serverQueue.songs.forEach((song) => {
    queueString +=
      "[" +
      song.title +
      "](" +
      song.link +
      ") \n" +
      "Duration: " +
      (Math.floor(song.duration / 3600) > 0
        ? Math.floor(song.duration / 3600) + " hours ,"
        : "") +
      (Math.floor((song.duration % 3600) / 60) > 0
        ? Math.floor((song.duration % 3600) / 60) + "minutes ,"
        : "") +
      (song.duration % 60) +
      " seconds" +
      "\nRequested by: " +
      "<@" +
      song.requester +
      ">" +
      "\n\n";
  });
  const embedQueue = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Song Queue")
    .setDescription(queueString);
  msg.channel.send({ embeds: [embedQueue] });
}

function covidCommand(arg, msg) {
  arg = arg.substring(6, arg.length);
  covid(arg, msg).catch((_) => {
    msg.channel.send(
      "Currently unable to retrieve data, please try another country/try again later..."
    );
  });
}
function pauseCommand(msg) {
  const serverQueue = queue.get(msg.guild.id);
  if (!serverQueue) msg.channel.send("Nothing to pause...");
  if (serverQueue.player.state == AudioPlayerStatus.Paused) {
    msg.channel.send("The player is already paused...");
    return;
  }
  serverQueue.player.pause();
  msg.channel.send("Pausing player");
}

function continueCommand(msg) {
  const serverQueue = queue.get(msg.guild.id);
  if (!serverQueue) msg.channel.send("Nothing to continue...");
  if (serverQueue.player.state == AudioPlayerStatus.Playing) {
    msg.channel.send("The player is already playing...");
    return;
  }
  serverQueue.player.unpause();
  msg.channel.send("Resuming player");
}

function stopCommand(msg) {
  const serverQueue = queue.get(msg.guild.id);
  if (!msg.member.voice.channel) {
    msg.channel.send("You have to be in a voice channel to stop the music..");
    return;
  }
  if (!serverQueue) {
    msg.channel.send("No ongoing music");
    return;
  }
  serverQueue.songs = [];
  serverQueue.player.stop();
}

function skipCommand(msg) {
  const serverQueue = queue.get(msg.guild.id);

  if (!msg.member.voice.channel) {
    return msg.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  }
  if (!serverQueue) {
    return msg.channel.send("There is no song that I could skip!");
  }
  serverQueue.player.stop();
}
function helpCommand(msg) {
  let commands = config.commands;
  let desc = config.commandDescriptions;
  let params = config.commandParameters;
  let helpDesc = "";
  for (var key in commands) {
    helpDesc +=
      "p" +
      commands[key] +
      (params[key] ? " [" + params[key] + "]" : "") +
      ": " +
      desc[key] +
      "\n";
  }
  const embedHelp = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Command List")
    .setDescription(helpDesc)
    .addFields({
      name: "Bot Developer: ",
      value: "[JP20-2](https://jpv.my.id/)",
    });

  msg.channel.send({ embeds: [embedHelp] });
}
