const fs = require("fs");
const { EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction } = require("discord.js");
const { para } = require("../functions/config.json");
const { onlyJs } = require("../functions/js/cmds");

module.exports = {
	data: {
		name: "help",
		description: "Obtenez de l'aide sur les commandes",
		options: [
			{
				name: "categorie",
				description: "Catégorie d'aide que vous demandez",
				required: false,
				type: ApplicationCommandOptionType.String,
				choices: [
					{
						name: "Modération",
						value: "mods",
					},
					{
						name: "Interactions",
						value: "ints",
					},
					{
						name: "Divers / Autre",
						value: "else",
					},
				],
			},
			{
				name: "commande",
				description: "La commande dont vous voulez avoir de l'aide",
				type: ApplicationCommandOptionType.String,
				autocomplete: true,
				required: false,
			},
		],
	},
	customData: {
		category: "else",
		dev: false,
		help: {
			usage: "/help [catégorie]* OU [commande]*",
		},
	},
	async execute(/**@type {ChatInputCommandInteraction}*/ interaction) {
		const selected = interaction.options?.get("categorie");
		const input = interaction.options?.getString("commande");
		await interaction.deferReply();

		if (input !== null && para.cmds.includes(input)) {
			const { data, customData } = require("./" + input);
			const ephemeral = customData.dev ? true : false;

			const cmdEmbed = new EmbedBuilder()
				.setTitle(`/${data.name} - ${nameCategory(customData.category)}`)
				.setDescription(
					`*${data.description}*\nUtilisation : \`${customData.help.usage}\``
				)
				.setFooter({ text: customData.category })
				.setColor("Random");

			await interaction.editReply({ ephemeral: ephemeral, embeds: [cmdEmbed] });
		} else {
			if (selected === null) {
				const categories = para.categoriesName.slice(0, -1);

				var cmdsNames = [];
				const filtered = await filterCmds(false, false);
				filtered.forEach((cmd) => cmdsNames.push(`\`/${cmd.data.name}\``));

				cmdsNames.toString().replace(/,/g, ", ");

				const helpEmbed = new EmbedBuilder()
					.setTitle("Catégories et commandes disponibles :")
					.setDescription(
						`Catégories : ${arrayToCorrectString(
							categories
						)}\nCommandes : ${arrayToCorrectString(cmdsNames)}`
					)
					.setFooter({
						text: "Utilisez /help [catégorie] pour voir les commandes de la catégorie correspondante",
					});

				interaction.editReply({ embeds: [helpEmbed] });
			} else if (selected.value !== null) {
				const category = rightCategory(await filterCmds(), selected.value);
				const msgTemplate = "**/%name** - *%description*\n`%usage`\n\n";
				var embedDescription = `Voici les commandes dans la catégorie **${nameCategory(
					selected.value
				)}** :\n\n`;

				if (category.length < 1) {
					return await interaction.editReply({
						content:
							"Il n'y a __pour l'instant__ aucune commandes dans cette catégorie...",
					});
				}

				category.forEach((cmd) => {
					embedDescription += msgTemplate
						.replace("%name", cmd.data.name)
						.replace("%description", cmd.data.description)
						.replace("%usage", cmd.customData.help.usage);
				});

				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`Commandes - ${nameCategory(selected.value)}`)
							.setDescription(embedDescription)
							.setFooter({ text: selected.value })
							.setColor("Random"),
					],
				});
			} else {
				throw new Error("Category is undefined");
			}
		}
	},
	async completeAuto(interaction) {
		const input = interaction.options.getFocused();

		const cmds = await filterCmds(false);
		const filtered = cmds.filter((cmd) => {
			if (cmd.data.name !== "help" && cmd.customData.dev !== true) {
				return cmd.data.name.startsWith(input);
			}
		});

		await interaction.respond(
			filtered.map((cmd) => ({ name: cmd.data.name, value: cmd.data.name }))
		);
	},
};

/**
 * It reads the commands folder, filters out the non-js files, and then sorts the commands into their
 * respective categories or not.
 * @param {Boolean} separated - true/false
 * @param {Boolean} hasDev - Includes developper commands
 * @returns {Object} An object with 4 keys, each key has an array of objects.
 */
async function filterCmds(separated = true, hasDev = false) {
	const files = await fs.readdirSync(__dirname);
	const cmds = onlyJs(files);

	var result;

	cmds.sort((a, b) => {
		const aData = require("../commands/" + a.replace(".js", ""));
		const bData = require("../commands/" + b.replace(".js", ""));
		aData.data.name.normalize().localeCompare(bData.data.name.normalize());
	});


	var categories = {
		mods: [],
		ints: [],
		else: [],
		devs: [],
	};
	cmds.forEach((cmd) => {
		const data = require("../commands/" + cmd.replace(".js", ""));
	
		if (separated === true) {
			const category = data.customData.category;
			

			if (data.customData.dev === true)
				categories.devs.push({
					data: data.data,
					customData: data.customData,
					name: para.categoriesName[3],
				});
			if (category === "mods")
				categories.mods.push({
					data: data.data,
					customData: data.customData,
					name: para.categoriesName[0],
				});
			if (category === "ints")
				categories.ints.push({
					data: data.data,
					customData: data.customData,
					name: para.categoriesName[1],
				});
			if (category === "else")
				categories.else.push({
					data: data.data,
					customData: data.customData,
					name: para.categoriesName[2],
				});

			result = categories;
			return categories;
		} else {
			if (!Array.isArray(result)) result = [];
			if (
				(hasDev === true && data.customData.dev === true) ||
				data.customData.dev !== true
			)
				result.push({ data: data.data, customData: data.customData });
			return result;
		}
	});

	return result;
}

/**
 * It returns the right category
 * @param {Object} categories - The categories object from the main function
 * @param {String} selected - The category that the user selected.
 * @returns {Array<Object>} The value of the selected category.
 */
function rightCategory(categories, selected) {
	if (!para.possibleCategories.includes(selected))
		throw new ReferenceError(
			"rightCategory() selected value isn't a valid category"
		);
	if (selected === "mods") return categories.mods;
	if (selected === "ints") return categories.ints;
	if (selected === "else") return categories.else;
	if (selected === "devs") return categories.devs;
}

/**
 * It returns the right category
 * @param {String} selected - The category that the user selected.
 * @returns {String} The value of the selected category.
 */
function nameCategory(selected) {
	if (!para.possibleCategories.includes(selected))
		throw new ReferenceError(
			"nameCategory() selected value isn't a valid category"
		);
	if (selected === "mods") return para.categoriesName[0];
	if (selected === "ints") return para.categoriesName[1];
	if (selected === "else") return para.categoriesName[2];
	if (selected === "devs") return para.categoriesName[3];
}

/**
 * It takes an array of categories and returns a string of the categories
 * @param {Array<String>} categories - An array of categories.
 * @returns {String} A string of categories.
 */
function arrayToCorrectString(categories) {
	var array = [];
	categories.forEach((category) => array.push(`\`${category}\``));

	return array.toString().replace(/,/g, ", ");
}
