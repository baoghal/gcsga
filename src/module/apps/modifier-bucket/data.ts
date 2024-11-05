// import { ModifierItem, RollModifierTags, SETTINGS, SYSTEM_NAME } from "@module/data/index.ts"
// import { Length,  objectHasKey } from "@util"

export function loadModifiers(): void {
	// const books = game.settings.get(SYSTEM_NAME, SETTINGS.BASE_BOOKS)
	// let meleeMods: ModifierItem[] = []
	// let rangedMods: ModifierItem[] = []
	// let defenseMods: ModifierItem[] = []
	// if (books === "dfrpg") {
	// 	meleeMods = [
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.determined,
	// 			modifier: 4,
	// 			reference: "DFX30",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.telegraphic,
	// 			modifier: 4,
	// 			reference: "MA113",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.deceptive,
	// 			modifier: -2,
	// 			reference: "B369",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.move,
	// 			modifier: -2,
	// 			max: 9,
	// 			reference: "DFX31",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.strong,
	// 			modifier: 2,
	// 			reference: "DFX30",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.mighty_blow,
	// 			modifier: 2,
	// 			cost: { id: "fp", value: 1 },
	// 			reference: "MA131",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.heroic_charge,
	// 			modifier: 0,
	// 			cost: { id: "fp", value: 1 },
	// 			reference: "MA131",
	// 		},
	// 	]
	// 	rangedMods = [
	// 		{
	// 			tags: ["Ranged Combat"],
	// 			id: translations.gurps.modifier.ranged.aim,
	// 			modifier: 1,
	// 			reference: "DFX29",
	// 		},
	// 		{
	// 			tags: ["Ranged Combat"],
	// 			id: translations.gurps.modifier.ranged.determined,
	// 			modifier: 1,
	// 			reference: "DFX30",
	// 		},
	// 	]
	// 	defenseMods = [
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.all_out_defense,
	// 			modifier: 2,
	// 			reference: "DFX31",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.shield,
	// 			modifier: 1,
	// 			reference: "DFA107",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.acrobatics_success,
	// 			modifier: 2,
	// 			reference: "DFX48",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.dodge_and_drop,
	// 			modifier: 3,
	// 			reference: "DFX50",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.dodge_retreat,
	// 			modifier: 3,
	// 			reference: "DFX50",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.block_parry_retreat,
	// 			modifier: 1,
	// 			reference: "DFX50",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.acrobatics_fail,
	// 			modifier: -2,
	// 			reference: "DFX48",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.dodge_side,
	// 			modifier: -2,
	// 			reference: "DFX47",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.dodge_rear,
	// 			modifier: -4,
	// 			reference: "DFX47",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.deceptive,
	// 			modifier: -1,
	// 			reference: "DFX38",
	// 		},
	// 		{ tags: ["Defense"], id: translations.gurps.modifier.defense.will, modifier: -1 },
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.feverish_defense,
	// 			modifier: +2,
	// 			cost: { id: "fp", value: 1 },
	// 		},
	// 	]
	// } else {
	// 	meleeMods = [
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.determined,
	// 			modifier: 4,
	// 			reference: "B365",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.telegraphic,
	// 			modifier: 4,
	// 			reference: "MA113",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.deceptive,
	// 			modifier: -2,
	// 			reference: "B369",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.move,
	// 			modifier: -2,
	// 			max: 9,
	// 			reference: "B365",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.strong,
	// 			modifier: 2,
	// 			reference: "B365",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.mighty_blow,
	// 			modifier: 2,
	// 			cost: { id: "fp", value: 1 },
	// 			reference: "MA131",
	// 		},
	// 		{
	// 			tags: ["Melee Combat"],
	// 			id: translations.gurps.modifier.melee.heroic_charge,
	// 			modifier: 0,
	// 			cost: { id: "fp", value: 1 },
	// 			reference: "MA131",
	// 		},
	// 	]
	// 	rangedMods = [
	// 		{ tags: ["Ranged Combat"], id: translations.gurps.modifier.ranged.aim, modifier: 1 },
	// 		{
	// 			tags: ["Ranged Combat"],
	// 			id: translations.gurps.modifier.ranged.determined,
	// 			modifier: 1,
	// 			reference: "B365",
	// 		},
	// 	]
	// 	defenseMods = [
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.all_out_defense,
	// 			modifier: 2,
	// 			reference: "B365",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.shield,
	// 			modifier: 1,
	// 			reference: "B374",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.acrobatics_success,
	// 			modifier: 2,
	// 			reference: "B374",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.dodge_and_drop,
	// 			modifier: 3,
	// 			reference: "B377",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.dodge_retreat,
	// 			modifier: 3,
	// 			reference: "B375",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.block_parry_retreat,
	// 			modifier: 1,
	// 			reference: "B377",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.acrobatics_fail,
	// 			modifier: -2,
	// 			reference: "B375",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.dodge_side,
	// 			modifier: -2,
	// 			reference: "B390",
	// 		},
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.dodge_rear,
	// 			modifier: -4,
	// 			reference: "B391",
	// 		},
	// 		{ tags: ["Defense"], id: translations.gurps.modifier.defense.deceptive, modifier: -1 },
	// 		{ tags: ["Defense"], id: translations.gurps.modifier.defense.will, modifier: -1 },
	// 		{
	// 			tags: ["Defense"],
	// 			id: translations.gurps.modifier.defense.feverish_defense,
	// 			modifier: +2,
	// 			cost: { id: "fp", value: 1 },
	// 		},
	// 	]
	// }
	// CONFIG.GURPS.meleeMods = meleeMods
	// CONFIG.GURPS.rangedMods = rangedMods
	// CONFIG.GURPS.defenseMods = defenseMods
	//
	// const modifiersStatus: ModifierItem[] = [
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.status, title: true },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.shock_1, modifier: -1 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.shock_2, modifier: -2 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.shock_3, modifier: -3 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.shock_4, modifier: -4 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.stunned, modifier: -4 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.afflictions, title: true },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.cough_dx, modifier: -3 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.cough_iq, modifier: -1 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.drowsy, modifier: -2 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.drunk, modifier: -4 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.tipsy, modifier: -1 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.tipsy_cr, modifier: -2 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.nausea, modifier: -2 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.nausea_def, modifier: -1 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.moderate_pain, modifier: -2 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.moderate_pain_hpt, modifier: -1 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.severe_pain, modifier: -4 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.severe_pain_hpt, modifier: -2 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.terrible_pain, modifier: -6 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.terrible_pain_hpt, modifier: -3 },
	// 	{ tags: ["Status"], id: translations.gurps.modifier.status.retching, modifier: -5 },
	// ]
	//
	// // TODO: get default length units, use that for string, current values are in yards
	// const modifiersSpeedStandard: ModifierItem[] = [
	// 	...[
	// 		[-1, 3],
	// 		[-2, 5],
	// 		[-3, 7],
	// 		[-4, 10],
	// 		[-5, 15],
	// 		[-6, 20],
	// 		[-7, 30],
	// 		[-8, 50],
	// 		[-9, 70],
	// 		[-10, 100],
	// 		[-11, 150],
	// 		[-12, 200],
	// 		[-13, 300],
	// 		[-14, 500],
	// 	].map(([r, d]) => {
	// 		const adjDistance = Length.format(Length.toInches(d, Length.Unit.Yard), Length.Unit.Yard)
	// 		return {
	// 			tags: [RollModifierTags.Range],
	// 			modifier: r,
	// 			id: game.i18n.format(translations.gurps.modifier.speed.range, {
	// 				distance: adjDistance,
	// 			}),
	// 		}
	// 	}),
	// 	{
	// 		tags: [RollModifierTags.Range],
	// 		modifier: -15,
	// 		id: game.i18n.format(translations.gurps.modifier.speed.range, {
	// 			distance: `${Length.format(Length.toInches(500, Length.Unit.Yard), Length.Unit.Yard)}+`,
	// 		}),
	// 	},
	// ]
	// const modifiersSpeedSimple: ModifierItem[] = [
	// 	{
	// 		tags: [RollModifierTags.Range],
	// 		id: translations.gurps.modifier.speed.close,
	// 		modifier: 0,
	// 	},
	// 	{
	// 		tags: [RollModifierTags.Range],
	// 		id: translations.gurps.modifier.speed.short,
	// 		modifier: -3,
	// 	},
	// 	{
	// 		tags: [RollModifierTags.Range],
	// 		id: translations.gurps.modifier.speed.medium,
	// 		modifier: -7,
	// 	},
	// 	{
	// 		tags: [RollModifierTags.Range],
	// 		id: translations.gurps.modifier.speed.long,
	// 		modifier: -11,
	// 	},
	// 	{
	// 		tags: [RollModifierTags.Range],
	// 		id: translations.gurps.modifier.speed.extreme,
	// 		modifier: -15,
	// 	},
	// ]
	//
	// const modifiersSpeedTens: ModifierItem[] = [...Array(50).keys()].map(e => {
	// 	const adjDistance = Length.format(Length.toInches((e + 1) * 10, Length.Unit.Yard), Length.Unit.Yard)
	// 	return {
	// 		tags: [RollModifierTags.Range],
	// 		modifier: -(e + 1),
	// 		id: game.i18n.format(translations.gurps.modifier.speed.range, {
	// 			distance: adjDistance,
	// 		}),
	// 	}
	// })
	//
	// const modifiersSize: ModifierItem[] = [
	// 	{ id: translations.gurps.modifier.size.melee_ranged, title: true },
	// 	...[
	// 		[-10, 1.5],
	// 		[-9, 2],
	// 		[-8, 3],
	// 		[-7, 5],
	// 		[-6, 8],
	// 		[-5, 12],
	// 		[-4, 18],
	// 		[-3, 12 * 2],
	// 		[-2, 12 * 3],
	// 		[-1, 12 * 4.5],
	// 		[0, 12 * 6],
	// 		[1, 12 * 9],
	// 		[2, 12 * 15],
	// 		[3, 12 * 21],
	// 		[4, 12 * 30],
	// 		[5, 12 * 45],
	// 		[6, 12 * 60],
	// 		[7, 12 * 90],
	// 		[8, 12 * 150],
	// 		[9, 12 * 210],
	// 		[10, 12 * 300],
	// 	].map(([m, l]) => {
	// 		let size = ""
	// 		if (l < 12) {
	// 			size = `${Length.format(l, Length.Unit.Inch)} (${Length.format(l, Length.Unit.Centimeter)})`
	// 		} else if (l < 12 * 3) {
	// 			size = `${Length.format(l, Length.Unit.Feet)} (${Length.format(l, Length.Unit.Centimeter)})`
	// 		} else {
	// 			size = `${Length.format(l, Length.Unit.Yard)}/${Length.format(l, Length.Unit.Feet)} (${Length.format(
	// 				l,
	// 				Length.Unit.Meter,
	// 			)})`
	// 		}
	// 		return {
	// 			tags: ["Size"],
	// 			modifier: m,
	// 			id: game.i18n.format(translations.gurps.modifier.size.size, { size: size }),
	// 		}
	// 	}),
	// ]
	//
	// const modifiersLocation: ModifierItem[] = [
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.eyes, modifier: -9 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.skull, modifier: -7 },
	// 	{
	// 		tags: ["Hit Location"],
	// 		id: translations.gurps.modifier.hit_location.skull_behind,
	// 		modifier: -5,
	// 	},
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.face, modifier: -5 },
	// 	{
	// 		tags: ["Hit Location"],
	// 		id: translations.gurps.modifier.hit_location.face_behind,
	// 		modifier: -7,
	// 	},
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.nose, modifier: -7 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.jaw, modifier: -6 },
	// 	{
	// 		tags: ["Hit Location"],
	// 		id: translations.gurps.modifier.hit_location.neck_vein,
	// 		modifier: -8,
	// 	},
	// 	{
	// 		tags: ["Hit Location"],
	// 		id: translations.gurps.modifier.hit_location.limb_vein,
	// 		modifier: -5,
	// 	},
	// 	{
	// 		tags: ["Hit Location"],
	// 		id: translations.gurps.modifier.hit_location.arm_shield,
	// 		modifier: -4,
	// 	},
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.arm, modifier: -2 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.torso, modifier: 0 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.vitals, modifier: -3 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.heart, modifier: -5 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.groin, modifier: -3 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.leg, modifier: -2 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.hand, modifier: -4 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.foot, modifier: -4 },
	// 	{ tags: ["Hit Location"], id: translations.gurps.modifier.hit_location.neck, modifier: -5 },
	// 	{
	// 		tags: ["Hit Location"],
	// 		id: translations.gurps.modifier.hit_location.chinks_torso,
	// 		modifier: -8,
	// 	},
	// 	{
	// 		tags: ["Hit Location"],
	// 		id: translations.gurps.modifier.hit_location.chinks_other,
	// 		modifier: -10,
	// 	},
	// ]
	//
	// const modifiersCover: ModifierItem[] = [
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.cover, title: true },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.head_only, modifier: -5 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.head_and_shoulders, modifier: -4 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.half_exposed, modifier: -3 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.light_cover, modifier: -2 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.same_sized_figure, modifier: -4 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.prone_no_cover, modifier: -4 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.prone_head_up, modifier: -5 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.prone_head_down, modifier: -7 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.crouching_no_cover, modifier: -2 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.occupied_hex, modifier: -4 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.posture, title: true },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.melee_crawling, modifier: -4 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.ranged_sitting, modifier: -2 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.defense_crawling, modifier: -3 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.melee_crouching, modifier: -2 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.ranged_crouching, modifier: -2 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.hit_ranged_crouching, modifier: -2 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.melee_kneeling, modifier: -2 },
	// 	{ tags: ["Cover"], id: translations.gurps.modifier.cover.defense_kneeling, modifier: -2 },
	// ]
	//
	// const modifiersDifficulty: ModifierItem[] = [
	// 	{
	// 		tags: ["Difficulty"],
	// 		id: translations.gurps.modifier.task_difficulty.automatic,
	// 		modifier: 10,
	// 	},
	// 	{ tags: ["Difficulty"], id: translations.gurps.modifier.task_difficulty.trivial, modifier: 8 },
	// 	{
	// 		tags: ["Difficulty"],
	// 		id: translations.gurps.modifier.task_difficulty.very_easy,
	// 		modifier: 6,
	// 	},
	// 	{ tags: ["Difficulty"], id: translations.gurps.modifier.task_difficulty.easy, modifier: 4 },
	// 	{
	// 		tags: ["Difficulty"],
	// 		id: translations.gurps.modifier.task_difficulty.very_favorable,
	// 		modifier: 2,
	// 	},
	// 	{
	// 		tags: ["Difficulty"],
	// 		id: translations.gurps.modifier.task_difficulty.favorable,
	// 		modifier: 1,
	// 	},
	// 	{
	// 		tags: ["Difficulty"],
	// 		id: translations.gurps.modifier.task_difficulty.unfavorable,
	// 		modifier: -1,
	// 	},
	// 	{
	// 		tags: ["Difficulty"],
	// 		id: translations.gurps.modifier.task_difficulty.very_unfavorable,
	// 		modifier: -2,
	// 	},
	// 	{ tags: ["Difficulty"], id: translations.gurps.modifier.task_difficulty.hard, modifier: -4 },
	// 	{
	// 		tags: ["Difficulty"],
	// 		id: translations.gurps.modifier.task_difficulty.very_hard,
	// 		modifier: -6,
	// 	},
	// 	{
	// 		tags: ["Difficulty"],
	// 		id: translations.gurps.modifier.task_difficulty.dangerous,
	// 		modifier: -8,
	// 	},
	// 	{
	// 		tags: ["Difficulty"],
	// 		id: translations.gurps.modifier.task_difficulty.impossible,
	// 		modifier: -10,
	// 	},
	// ]
	//
	// const modifiersQuality: ModifierItem[] = [
	// 	{
	// 		tags: ["Quality"],
	// 		id: translations.gurps.modifier.equipment_quality.best_possible,
	// 		modifier: -10,
	// 	},
	// 	{
	// 		tags: ["Quality"],
	// 		id: translations.gurps.modifier.equipment_quality.best_possible,
	// 		modifier: 4,
	// 	},
	// 	{ tags: ["Quality"], id: translations.gurps.modifier.equipment_quality.fine, modifier: 2 },
	// 	{ tags: ["Quality"], id: translations.gurps.modifier.equipment_quality.good, modifier: 1 },
	// 	{
	// 		tags: ["Quality"],
	// 		id: translations.gurps.modifier.equipment_quality.improvised,
	// 		modifier: -2,
	// 	},
	// 	{
	// 		tags: ["Quality"],
	// 		id: translations.gurps.modifier.equipment_quality.improvised_tech,
	// 		modifier: -5,
	// 	},
	// 	{ tags: ["Quality"], id: translations.gurps.modifier.equipment_quality.missing, modifier: -1 },
	// 	{ tags: ["Quality"], id: translations.gurps.modifier.equipment_quality.none, modifier: -5 },
	// 	{
	// 		tags: ["Quality"],
	// 		id: translations.gurps.modifier.equipment_quality.none_tech,
	// 		modifier: -10,
	// 	},
	// ]
	//
	// const modifiersLighting: ModifierItem[] = [
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.torch, modifier: -1 },
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.flashlight, modifier: -2 },
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.candlelight, modifier: -3 },
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.full_moon, modifier: -4 },
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.half_moon, modifier: -5 },
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.quarter_moon, modifier: -6 },
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.starlight, modifier: -7 },
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.starlight_clouds, modifier: -8 },
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.moonless, modifier: -9 },
	// 	{ tags: ["Lighting"], id: translations.gurps.modifier.light.total_darkness, modifier: -10 },
	// ]
	//
	// const modifiersRof: ModifierItem[] = [
	// 	...[
	// 		[1, "5-8"],
	// 		[2, "9-12"],
	// 		[3, "13-15"],
	// 		[4, "17-24"],
	// 		[5, "25-49"],
	// 		[6, "50-99"],
	// 	].map(([m, l]) => {
	// 		return {
	// 			id: game.i18n.format(translations.gurps.modifier.rof.rof, { rof: l }),
	// 			modifier: Number(m),
	// 		}
	// 	}),
	// ]
	//
	// let modifiersSpeed: ModifierItem[] = []
	// const modifierSetting = game.settings.get(SYSTEM_NAME, SETTINGS.SSRT)
	// if (modifierSetting === "standard") modifiersSpeed = modifiersSpeedStandard
	// else if (modifierSetting === "simplified") modifiersSpeed = modifiersSpeedSimple
	// else if (modifierSetting === "tens") modifiersSpeed = modifiersSpeedTens
	//
	// const commonMods: { title: string; items: ModifierItem[]; open?: boolean }[] = [
	// 	{
	// 		title: translations.gurps.modifier.status.title,
	// 		items: modifiersStatus,
	// 	},
	// 	{
	// 		title: translations.gurps.modifier.speed.title,
	// 		items: modifiersSpeed,
	// 	},
	// 	{
	// 		title: translations.gurps.modifier.size.title,
	// 		items: modifiersSize,
	// 	},
	// 	{
	// 		title: translations.gurps.modifier.hit_location.title,
	// 		items: modifiersLocation,
	// 	},
	// 	{
	// 		title: translations.gurps.modifier.cover.title,
	// 		items: modifiersCover,
	// 	},
	// 	{
	// 		title: translations.gurps.modifier.task_difficulty.title,
	// 		items: modifiersDifficulty,
	// 	},
	// 	{
	// 		title: translations.gurps.modifier.equipment_quality.title,
	// 		items: modifiersQuality,
	// 	},
	// 	{
	// 		title: translations.gurps.modifier.light.title,
	// 		items: modifiersLighting,
	// 	},
	// 	{
	// 		title: translations.gurps.modifier.rof.title,
	// 		items: modifiersRof,
	// 	},
	// ]
	// CONFIG.GURPS.commonMods = commonMods
	// CONFIG.GURPS.allMods = [
	// 	...meleeMods,
	// 	...rangedMods,
	// 	...defenseMods,
	// 	...modifiersStatus,
	// 	...modifiersSpeed,
	// 	...modifiersSize,
	// 	...modifiersLocation,
	// 	...modifiersCover,
	// 	...modifiersDifficulty,
	// 	...modifiersQuality,
	// 	...modifiersLighting,
	// 	...modifiersRof,
	// ].filter(e => objectHasKey(e, "title"))
}
