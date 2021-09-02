const config = require("./config.json");
const fetch = require("node-fetch");
const Discord = require("discord.js");
const client = new Discord.Client({
  autoReconnect: true,
  presence: { status: "online" },
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
});
// const request = require('request')
const qs = require("querystring");
const http = require("https");
const ytdl = require("ytdl-core");

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
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  let arg = msg.content;
  if (!arg.startsWith(config.prefix)) return;
  arg = arg.substring(2, arg.length);
  args = arg.split(" ");

  switch (args[0]) {
    case config.commands.randomdog:
      randomDogCommand(msg);
      break;
    case config.commands.randommeme:
      randomMemeCommand(msg);
      break;
    case config.commands.randomactivity:
      randomActivityCommand(msg);
      break;
    case config.commands.help:
      helpCommand(msg);
      break;
    case config.commands.covidinfo:
      covidCommand(arg, msg);
      break;
    case config.commands.idtoen:
      arg = arg.substring(3, arg.length);
      translate("id", "en", arg, msg);
      break;
    case config.commands.entoid:
      arg = arg.substring(3, arg.length);
      translate("en", "id", arg, msg);
      break;
    case config.commands.playmusic:
      playMusic(msg, arg);
      break;
    case config.commands.stopmusic:
      stopCommand(msg);
      break;
    case config.commands.skipmusic:
      skipCommand(msg);
      break;
    case config.commands.listmusic:
      queueCommand(msg);
      break;
    case config.commands.pausemusic:
      pauseCommand(msg);
      break;
    case config.commands.continuemusic:
      continueCommand(msg);
      break;
    case config.commands.speech:
      playSpeech(msg,arg);
      break;
  }
});

client.login(config.token);

async function translate(sourceL, targetL, translateString, e) {
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
      const body = Buffer.concat(chunks);
      e.channel.send(
        JSON.parse(body.toString()).data.translations[0].translatedText
      );
    });
  });

  req.write(
    qs.stringify({ q: translateString, target: targetL, source: sourceL })
  );
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
});

const queue = new Map();
var gtts = require('node-gtts')('en');
async function play(guild, curr) {
  song = curr.songs[0];

  if (song === undefined) {
    curr.connection.disconnect();
    queue.delete(guild.id);
    return;
  }
  let rs;
  if (curr.type == 0) {
    rs = createAudioResource(
      ytdl(song.url, {
        filter: "audio",
        quality: "highest",
      })
    );
  } else {
    rs = createAudioResource(gtts.stream(song.text));
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
    msg.channel.send("You must be in a voice channel.");
    return false;
  }
  const permissions = VC.permissionsFor(msg.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    msg.channel.send("Need permission to join and talk.");
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

function getSpeech(msg, arg) {
  if (!arg) return false;
  try {
    const curr = {
      title: "Speech: " + arg,
      text: arg,
      duration: "Unknown",
      link: "-",
      type: 1,
      requester: msg.author.id,
    };
    return curr;
  } catch (e) {
    msg.channel.send("Please enter a valid url");
    return false;
  }
}

async function playSpeech(msg, arg) {
  if (!arg.includes("speech ")) {
    msg.channel.send("Please enter a valid syntax: p speech [speechstring]");
    return;
  }

  arg = arg.substring(7, arg.length);
  if (!vcValidation(msg)) return;
  const curr = getSpeech(msg, arg);
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
      value: "JP20-2(https://jpv.my.id/)",
    });

  msg.channel.send({ embeds: [embedHelp] });
}
