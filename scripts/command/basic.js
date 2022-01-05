const config = require('../../values/config.json');
const fetch = require("node-fetch");
const basicCommands = {
    randomDogCommand: async function (e) {
        const response = await fetch(config.apis.dog);
        data = await response.json();
        if (response) {
            e.channel.send(data.message);
        }
    },
    randomCatCommand: async function (e) {
        const response = await fetch(config.apis.cat);
        data = await response.json();
        if (data) {
            e.channel.send(data[0].url);
        }
    },
    randomMemeCommand: async function (e) {
        const response = await fetch(config.apis.meme);
        data = await response.json();
        if (response) {
            e.channel.send(data.data.memes[Math.floor(Math.random() * 100)].url);
        }
    },

    randomActivityCommand: async function

        (e) {
        const response = await fetch(config.apis.activity);
        data = await response.json();
        if (response) {
            const embedActivity = new Discord.MessageEmbed()
                .setColor("#0099ff")
                .setTitle(data.type)
                .setDescription(data.activity);
            e.channel.send({embeds: [embedActivity]});
        }
    },

    helpCommand: function (msg) {
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

        msg.channel.send({embeds: [embedHelp]});
    },

    covidCommand: function (arg, msg) {
        arg = arg.substring(6, arg.length);
        this.covid(arg, msg).catch((_) => {
            msg.channel.send(
                "Currently unable to retrieve data, please try another country/try again later..."
            );
        });
    },

    covid: async function (country, e) {
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
                e.channel.send({embeds: [exampleEmbed]});
            });
        });

        req.end();
    }
    ,
    translate: async function (args, translateString, e) {
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
                "x-rapidapi-key": config["api-tokens"].translate,
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
                qs.stringify({q: translateString, target: args[2], source: args[1]})
                // qs.stringify({ q: "telor", target: "en", source: "id" })
            );
        } catch {
            e.channel.send(
                "Please input a valid language code (ex: ptranslate id en telor)"
            );
        }
        req.end();
    },

    grantSudo: function (msg) {
        let admin = phatConstants.admins.includes(msg.author.id);
        if (!admin) message.reply("Sorry, you lack the permission...");
        return admin;
    },
}

module.exports = basicCommands;
