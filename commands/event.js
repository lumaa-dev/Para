const { EmbedBuilder, AutocompleteInteraction, ApplicationCommand, ApplicationCommandOptionType, PermissionFlagsBits, ChatInputCommandInteraction, Message } = require("discord.js");
const { awaitMessage } = require("../functions/js/cmds");
const { correctEpoch } = require("../functions/js/other");

module.exports = {
	/**@type {ApplicationCommand} */
	data: {
		name: "event",
		description: "Annoncez un évènement",
		defaultMemberPermissions: [PermissionFlagsBits.ManageEvents],
		options: [
			{
				name: "nom",
				description: "Nom de l'évènement",
				required: true,
				type: ApplicationCommandOptionType.String,
				autocomplete: true,
			},
			{
				name: "limite",
				description: "Limite de membre qui peuvent rejoindre",
				required: false,
				type: ApplicationCommandOptionType.Integer,
				minValue: 2,
				maxValue: 100
			},
		],
	},
	customData: {
		category: "ints",
		dev: false,
		help: {
			usage: "/event [nom] [limite]",
		},
	},
	/**
	 * 
	 * @param {ChatInputCommandInteraction} interaction 
	 * @returns 
	 */
	async execute(interaction) {
		const id = interaction.options.getString("nom");
		const maxUsers = interaction.options.getInteger("limite");
		let description;

		await interaction.reply({
			content: "Envoyez une courte description de votre évènement.",
		});

		await awaitMessage(interaction.channel, interaction.user, async (collected) => {
			/**@type {Message}*/
			const message = collected.first();

			if (message.content.length > 4095)
				return message.reply({
					content: "WOW T'AS VRAIMENT UTILISÉ 4096+ CHARACTÈRE.",
				});

			description = message.content;
			await message.delete()
		});

		if (typeof description !== "string") return;

		const event = interaction.guild.scheduledEvents.cache.get(id);

		const eventEmbed = new EmbedBuilder()
			.setTitle(`Nouvel évènement ! - ${event.name}`)
			.setDescription(
				`Description :\n> ${description
					.split("\n")
					.join("\n> ")}\n\n- Limite de membres : 0/${
					maxUsers ?? 0
				}\n- <t:${correctEpoch(event.scheduledStartTimestamp)}:R>`
			);

		function oneLength(variable) {
			if (String(variable).length == 1) {
				variable = `0${variable}`;
			}
			return variable;
		}

		interaction.editReply({
			content: "Nouvel événement :",
			embeds: [eventEmbed],
		});
	},
	async completeAuto(/**@type {AutocompleteInteraction}*/interaction) {
		const input = interaction.options.getFocused();

		/**@type {import("discord.js").ApplicationCommandOptionChoiceData[]} */
		let choices = [];
		interaction.guild.scheduledEvents.cache.each((event) =>
			choices.push({ name: event.name, value: event.id })
		);

		const filtered = choices.filter((choice) => choice.name.startsWith(input));
		await interaction.respond(filtered);
	}
};
