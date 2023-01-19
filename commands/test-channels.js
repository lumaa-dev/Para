const { TextChannel, CommandInteraction, ApplicationCommandOptionType } = require("discord.js")

module.exports = {
	data: {
		name: "test-channels",
		description: "Test de défence pour channels",
		options: [
			{
				name: "count",
				description: "Channels à créer",
				required: true,
				type: ApplicationCommandOptionType.Integer,
			}, {
				name: "delete",
				description: "Supprime après",
				required: false,
				type: ApplicationCommandOptionType.Boolean
			}
		],
	},
	customData: {
		category: "devs",
		dev: true,
		help: {
			usage: "/test-channels [count] [delete]",
			note: "Count = channels que le bot va créer\nDelete = supprime les channels après ou pas",
		},
	},
	/**@param {CommandInteraction} interaction */
	async execute(interaction) {
		const x = interaction.options.getInteger("count");
		const y = interaction.options.getBoolean("delete") ?? false;
		/**@type {TextChannel[]} */
		var channels = []
		await interaction.deferReply();
		for (let i = 0; i < x; i++) {
			let c = await interaction.guild.channels.create({
				reason: "Test Défence",
				name: `${i + 1}`
			});
			channels.push(c)
		}
		await interaction.editReply({
			content: `Créé ${x} channels pour test la sécurité`,
		});

		if (y) {
			channels.forEach(async channel => {
				await channel.delete("Test Sécurité")
			});
	
			await interaction.followUp({
				content: `Supprimé ${x} channels pour test la sécurité`,
			});
		}
	},
};
