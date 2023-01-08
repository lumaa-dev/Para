const Discord = require("discord.js");

module.exports = {
	createClient(intents) {
		const client = new Discord.Client({ intents: intents });
		if (!client || typeof client == "undefined")
			return console.error("Discord changed the way to get new clients");
		return client;
	},

	async setStatus(client, name, type = "PLAYING") {
		await client.user.setActivity(name, { type: type });
	},
};
