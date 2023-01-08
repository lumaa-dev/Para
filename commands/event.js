const { MessageEmbed, EmbedBuilder, AutocompleteInteraction } = require("discord.js");
const { awaitMessage } = require("../functions/js/cmds");
const { correctEpoch } = require("../functions/js/other");

module.exports = {
	data: {
		name: "event",
		description: "Annoncez un évènement",
		options: [
			{
				name: "nom",
				description: "Nom de l'évènement",
				required: true,
				type: "STRING",
				autocomplete: true,
			},
			// {
			// 	name: "date",
			// 	description: "Le format est : JJ/MM",
			// 	required: true,
			// 	type: "STRING",
			// 	//autocomplete: true,
			// },
			// {
			// 	name: "heure",
			// 	description: "Le format est : HH/MM",
			// 	required: true,
			// 	type: "STRING",
			// 	//autocomplete: true,
			// },
			{
				name: "limite",
				description: "Limite de membre qui peuvent rejoindre",
				required: false,
				type: "INTEGER",
			},
		],
	},
	customData: {
		category: "ints",
		dev: false,
		help: {
			usage: "/event [nom] [JJ/MM] [HH/MM] [limite]",
		},
	},
	async execute(interaction) {
		const name = interaction.options.getString("nom");
		const maxUsers = interaction.options.getInteger("limite");
		let description;

		await interaction.reply({
			content: "Envoyez une courte description de votre évènement.",
		});

		await awaitMessage(interaction.channel, interaction.user, (collected) => {
			const message = collected.first();

			if (message.content.length > 4095)
				return message.reply({
					content: "WOW T'AS VRAIMENT UTILISÉ 4096+ CHARACTÈRE !",
				});

			description = message.content;
		});

		if (typeof description !== "string") return;

		var jj = oneLength(date.split(/\//g)[0]);
		var mm = oneLength(date.split(/\//g)[1]);
		//const yyyy = date.split(/\//g)[2];

		var hh = oneLength(time.split(/\:/g)[0]);
		var min = oneLength(time.split(/\:/g)[1]);

		const timestamp = new Date();

		timestamp.setDate(Number(jj));
		timestamp.setMonth(Number(mm) - 1);
		timestamp.setHours(Number(hh), Number(min), 0);

		const eventEmbed = new EmbedBuilder()
			.setTitle(`Nouvel évènement ! - ${name}`)
			.setDescription(
				`Description :\n> ${description
					.split("\n")
					.join("\n> ")}\n\n- Limite de membres : 0/${
					maxUsers ?? 20
				}\n- <t:${correctEpoch(timestamp.getTime())}:R>`
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

		let choices = [];
		await interaction.guild.scheduledEvents.cache.each((event) =>
			choices.push({ name: event.name, value: event.name.trim().replace(/ +/g, "_") })
		);

		const filtered = choices.filter((choice) => choice.name.startsWith(input));
		await interaction.respond(filtered);
	},
	// async completeAuto(interaction) {
	// 	const input = interaction.options.getFocused(true);

	// 	let choices = [];

	// 	if (input.name === "heure") {
	// 		for (let h = 0; h < 23; h++) {
	// 			for (let m = 0; m < 59; m++) {
	// 				if (h.length == 1) h = `0${h}`;
	// 				if (m.length == 1) m = `0${m}`;
	// 				choices.push(`${h}:${m}`);
	// 			}
	// 		}
	// 	}

	// 	if (input.name === "date") {
	// 		for (let d = 0; d < 31; d++) {
	// 			for (let m = 0; +m < 12; m++) {
	// 				if (d.length == 1) d = `0${d}`;
	// 				if (m.length == 1) m = `0${m}`;
	// 				choices.push(`${d}/${m}`);
	// 			}
	// 		}
	// 	}

	// 	const filtered = choices.filter((choice) => choice.startsWith(input.value));

	// 	await interaction.respond(
	// 		filtered.map((choice) => ({ name: choice, value: choice }))
	// 	);
	// },
};
