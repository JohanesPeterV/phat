const config = require('../../values/config.json');

const ytdl = require("ytdl-core");

const gttsid = require("node-gtts")("id");
const gttsen = require("node-gtts")("en");
const gttsjp = require("node-gtts")("ja");
const {createAudioPlayer, NoSubscriberBehavior} = require("@discordjs/voice");
const ytsr = require("ytsr");

const {
    joinVoiceChannel,
    createAudioResource,
    AudioPlayerStatus,
} = require("@discordjs/voice");


const musicCommands = {

    queue: new Map(),
    play: function (guild, curr) {
        song = curr.songs[0];
        if (song === undefined || !song || typeof song === "undefined") {
            curr.state = "idle";
            curr.timeOut = setTimeout(() => {
                this.queue.delete(guild.id);
                curr.connection.disconnect();
            }, 1800000);
            return;
        } else {
            if (curr.timeOut) {
                clearTimeout(curr.timeOut);
                curr.timeOut = null;
            }
            curr.state = "active";
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
            try {
                switch (song.sl) {
                    case "id":
                        rs = createAudioResource(gttsid.stream(song.text));
                        break;
                    case "en":
                        rs = createAudioResource(gttsen.stream(song.text));
                        break;
                    case "ja":
                        rs = createAudioResource(gttsjp.stream(song.text));
                        break;
                }
            } catch {
                curr.textChannel.send("I cannot play " + song.title);
                curr.songs.shift();
                this.play(guild, curr);
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
                this.play(guild, curr);
            }
        });
        curr.player.on("error", (error) => {
            console.log(error);
        });

        curr.textChannel.send(`Now playing: **${song.title}**`);
    },

    validateUrl: async function (arg, msg) {
        if (arg) {
            var regExp =
                /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
            if (arg.match(regExp)) {
                return arg;
            }
        }

        try {
            msg.channel.send("Searching " + arg);
            const filters = await ytsr.getFilters(arg);
            const filteredQuery = filters.get("Type").get("Video");
            const srResult = await ytsr(filteredQuery.url, {
                limit: 1,
                gl: "us",
                hl: "en",
            });
            if (!srResult.items[0]) {
                this.queue.delete(msg.guildId);
                msg.channel.send("Search result not found");
                return false;
            }
            arg = srResult.items[0].url;

            return arg;
        } catch {
            msg.channel.send("Search error occured");
            return false;
        }
    },

    vcValidation: function (msg) {
        const VC = msg.member.voice.channel;
        const AFKVC = this.queue.get(msg.guildId)
            ? this.queue.get(msg.guildId).voiceChannel
            : null;
        if (!VC && !AFKVC) {
            msg.channel.send("You must be in a voice channel to use this command");
            return false;
        }
        const permissions = VC
            ? VC.permissionsFor(msg.client.user)
            : AFKVC.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            msg.channel.send("I don't have the permission to join and talk.");
            return false;
        }
        return true;
    },
    getSong: async function (msg, arg) {
        arg = await this.validateUrl(arg, msg);
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
    },
    playMusic: async function (msg, arg) {
        if (!arg.includes("play ")) {
            msg.channel.send("Please enter a valid syntax: pplay [url/searchstring]");
            return;
        }
        arg = arg.substring(5, arg.length);
        if (!this.vcValidation(msg)) return;

        const curr = await getSong(msg, arg);
        if (!curr) return;
        this.addToQueue(msg, curr, false);

    },

    getSpeech: function (msg, arg, language) {
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
    },
    speechCommand: async function (msg, args, arg) {
        if (!this.vcValidation(msg)) {
            return;
        }
        if (arg.length < 15) {
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
                currLanguage = "ja";
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

        this.addToQueue(msg, curr, false);
    },

    addToQueue: async function (msg, curr, silent) {
        if (!curr) {
            return;
        }
        const serverQueue = this.queue.get(msg.guildId);

        const VC = msg.member.voice.channel
            ? msg.member.voice.channel
            : serverQueue.voiceChannel;

        if (!serverQueue) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: VC,
                connection: null,
                songs: [],
                volume: 1,
                playing: true,
                player: null,
                timeOut: null,
                state: "active",
            };
            this.queue.set(msg.guild.id, queueConstruct);
            try {
                queueConstruct.songs.push(curr);

                try {
                    const connection = await joinVoiceChannel({
                        channelId: VC.id,
                        guildId: VC.guildId,
                        adapterCreator: VC.guild.voiceAdapterCreator,
                    });
                    queueConstruct.connection = connection;
                    this.play(msg.guild, queueConstruct);
                } catch (err) {
                    console.log(err);
                    this.queue.delete(msg.guild.id);
                    msg.channel.send(err);
                    return;
                }
            } catch {
                this.queue.delete(msg.guildId);
                msg.channel.send("Please enter a valid url");
                return false;
            }
        } else {
            serverQueue.songs.push(curr);
            if (!silent) msg.channel.send(curr.title + " has been added to the queue!");
            console.log(serverQueue.state);
            if (serverQueue.state === "idle") this.play(msg.guild, serverQueue);
        }
    },

    queueCommand: function (msg) {
        const serverQueue = this.queue.get(msg.guild.id);
        if (!serverQueue) {
            msg.channel.send("No Queue available");
            return;
        }
        queueString = "";
        flag = 0;
        serverQueue.songs.every((song) => {
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
            if (flag++ < 15) {
                return true;
            }
            return false;
        });
        const embedQueue = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle("Queue")
            .setDescription(queueString);
        msg.channel.send({embeds: [embedQueue]});
    },

    pauseCommand: function (msg) {
        const serverQueue = this.queue.get(msg.guild.id);
        if (!serverQueue) msg.channel.send("Nothing to pause...");
        if (serverQueue.player.state == AudioPlayerStatus.Paused) {
            msg.channel.send("The player is already paused...");
            return;
        }
        serverQueue.player.pause();
        msg.channel.send("Pausing player");
    },

    continueCommand: function (msg) {
        const serverQueue = this.queue.get(msg.guild.id);
        if (!serverQueue) msg.channel.send("Nothing to continue...");
        if (serverQueue.player.state == AudioPlayerStatus.Playing) {
            msg.channel.send("The player is already playing...");
            return;
        }
        serverQueue.player.unpause();
        msg.channel.send("Resuming player");
    },

    stopCommand: function (msg) {
        const serverQueue = this.queue.get(msg.guild.id);
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
    },

    skipCommand: function (msg) {
        const serverQueue = this.queue.get(msg.guild.id);
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
}

module.exports = musicCommands;
