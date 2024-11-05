// import { SkillSource, SkillSystemSource } from "@item/skill/data.ts"
// import { TraitSource, TraitSystemSource } from "@item/trait/data.ts"
// import {
// 	ImportedEquipmentContainerSystemSource,
// 	ImportedEquipmentModifierContainerSystemSource,
// 	ImportedEquipmentModifierSystemSource,
// 	ImportedEquipmentSystemSource,
// 	ImportedFeature,
// 	ImportedItemSource,
// 	ImportedItemType,
// 	ImportedMeleeWeaponSystemSource,
// 	ImportedNoteContainerSystemSource,
// 	ImportedNoteSystemSource,
// 	ImportedPrereqList,
// 	ImportedRangedWeaponSystemSource,
// 	ImportedRitualMagicSpellSystemSource,
// 	ImportedSkillContainerSystemSource,
// 	ImportedSkillDefault,
// 	ImportedSkillSystemSource,
// 	ImportedSpellContainerSystemSource,
// 	ImportedSpellSystemSource,
// 	ImportedStudy,
// 	ImportedTechniqueSystemSorce,
// 	ImportedTemplatePicker,
// 	ImportedTraitContainerSystemSource,
// 	ImportedTraitModifierContainerSystemSource,
// 	ImportedTraitModifierSystemSource,
// 	ImportedTraitSystemSource,
// } from "./data.ts"
// import { TechniqueSource, TechniqueSystemSource } from "@item/technique/data.ts"
// import { SpellSource, SpellSystemSource } from "@item/spell/data.ts"
// import { EquipmentSource, EquipmentSystemSource } from "@item/equipment/data.ts"
// import { ItemKind, ItemType, NumericCompareType, SYSTEM_NAME, gid } from "@data"
// import { ItemSourceGURPS } from "@item/data/index.ts"
// import { Feature, Prereq, PrereqListSchema, SkillDefaultSchema, Study, TemplatePickerSchema } from "@system"
// import {
//
// 	affects,
// 	container,
// 	difficulty,
// 	emcost,
// 	emweight,
// 	feature,
// 	generateId,
// 	picker,
// 	prereq,
// 	selfctrl,
// 	stdmg,
// 	study,
// 	tmcost,
// } from "@util"
// import { TraitContainerSource, TraitContainerSystemSource } from "@item/trait-container/data.ts"
// import { TraitModifierSource, TraitModifierSystemSource } from "@item/trait-modifier/data.ts"
// import {
// 	TraitModifierContainerSource,
// 	TraitModifierContainerSystemSource,
// } from "@item/trait-modifier-container/data.ts"
// import { SkillContainerSource, SkillContainerSystemSource } from "@item/skill-container/data.ts"
// import { RitualMagicSpellSource, RitualMagicSpellSystemSource } from "@item/ritual-magic-spell/data.ts"
// import { SpellContainerSource, SpellContainerSystemSource } from "@item/spell-container/data.ts"
// import { EquipmentContainerSource, EquipmentContainerSystemSource } from "@item/equipment-container/data.ts"
// import { EquipmentModifierSource, EquipmentModifierSystemSource } from "@item/equipment-modifier/data.ts"
// import {
// 	EquipmentModifierContainerSource,
// 	EquipmentModifierContainerSystemSource,
// } from "@item/equipment-modifier-container/data.ts"
// import { NoteSource, NoteSystemSource } from "@item/note/data.ts"
// import { NoteContainerSource, NoteContainerSystemSource } from "@item/note-container/data.ts"
// import { MeleeWeaponSource, MeleeWeaponSystemSource } from "@item/melee-weapon/data.ts"
// import { RangedWeaponSource, RangedWeaponSystemSource } from "@item/ranged-weapon/data.ts"
// import { DocumentStatsSchema, SourceFromTypedSchemaTypes } from "types/foundry/common/data/fields.js"
// import { TIDString } from "../tid.ts"
//
// interface ItemImportContext {
// 	parentId: string | null
// 	other?: boolean
// 	fileVersion: number
// 	// sort: number
// }
//
// abstract class ItemImporter {
// 	static importItems(
// 		list?: ImportedItemSource[],
// 		context: { other?: boolean; fileVersion: number } = { other: false, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		if (!list) return []
//
// 		const results: ItemSourceGURPS[] = []
//
// 		for (const item of list) {
// 			if ((context.fileVersion = 5)) item.type = this.getTypeFromKind(item.id)
// 			results.push(
// 				...ItemImportHandlers[item.type].importItem(item, {
// 					parentId: null,
// 					other: context.other,
// 					fileVersion: context.fileVersion,
// 				}),
// 			)
// 		}
// 		return results
// 	}
//
// 	abstract importItem(item: ImportedItemSource, context: ItemImportContext): ItemSourceGURPS[]
//
// 	static importPrereqs(
// 		prereqList?: ImportedPrereqList,
// 		parentId = "root",
// 	): SourceFromTypedSchemaTypes<Record<prereq.Type, ConstructorOf<Prereq>>>[] {
// 		if (!prereqList)
// 			return [
// 				{
// 					type: prereq.Type.List,
// 					id: parentId,
// 					all: true,
// 					when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
// 					prereqs: [],
// 				},
// 			]
//
// 		const list: SourceFromTypedSchemaTypes<Record<prereq.Type, ConstructorOf<Prereq>>>[] = []
// 		const root: SourceFromSchema<PrereqListSchema> = {
// 			type: prereq.Type.List,
// 			id: parentId,
// 			all: prereqList.all,
// 			when_tl: {
// 				compare: prereqList.when_tl?.compare ?? NumericCompareType.AnyNumber,
// 				qualifier: prereqList.when_tl?.qualifier ?? 0,
// 			},
// 			prereqs: [],
// 		}
// 		for (const child of prereqList?.prereqs ?? []) {
// 			const id = generateId()
// 			root.prereqs!.push(id)
// 			if (child.type === prereq.Type.List) {
// 				list.push(...this.importPrereqs(child, id))
// 			} else {
// 				list.push({ ...child, id } as any)
// 			}
// 		}
// 		list.unshift(root)
// 		return list
// 	}
//
// 	static importFeatures(
// 		featureList?: ImportedFeature[],
// 	): SourceFromTypedSchemaTypes<Record<feature.Type, ConstructorOf<Feature>>>[] {
// 		return featureList ?? []
// 	}
//
// 	static importStudy(studyList?: ImportedStudy[]): Study[] {
// 		return studyList ?? []
// 	}
//
// 	static importSkillDefault(skillDefault?: ImportedSkillDefault): SourceFromSchema<SkillDefaultSchema> {
// 		return {
// 			type: skillDefault?.type ?? gid.Dexterity,
// 			name: skillDefault?.name ?? null,
// 			specialization: skillDefault?.specialization ?? null,
// 			modifier: skillDefault?.modifier ?? 0,
// 			level: skillDefault?.level ?? 0,
// 			adjusted_level: skillDefault?.adjusted_level ?? 0,
// 			points: skillDefault?.points ?? 0,
// 		}
// 	}
//
// 	static importTemplatePicker(templatePicker?: ImportedTemplatePicker): SourceFromSchema<TemplatePickerSchema> {
// 		return templatePicker ?? { type: picker.Type.NotApplicable, qualifier: {} }
// 	}
//
// 	static getTypeFromKind(id: TIDString): ImportedItemType {
// 		const firstChar = id.substring(0, 1)
// 		switch (firstChar) {
// 			case ItemKind.Trait:
// 				return ImportedItemType.Trait
// 			case ItemKind.TraitContainer:
// 				return ImportedItemType.TraitContainer
// 			case ItemKind.TraitModifier:
// 				return ImportedItemType.TraitModifier
// 			case ItemKind.TraitModifierContainer:
// 				return ImportedItemType.TraitModifierContainer
// 			case ItemKind.Skill:
// 				return ImportedItemType.Skill
// 			case ItemKind.Technique:
// 				return ImportedItemType.Technique
// 			case ItemKind.SkillContainer:
// 				return ImportedItemType.SkillContainer
// 			case ItemKind.Spell:
// 				return ImportedItemType.Spell
// 			case ItemKind.RitualMagicSpell:
// 				return ImportedItemType.RitualMagicSpell
// 			case ItemKind.SpellContainer:
// 				return ImportedItemType.SpellContainer
// 			case ItemKind.Equipment:
// 				return ImportedItemType.Equipment
// 			case ItemKind.EquipmentContainer:
// 				return ImportedItemType.EquipmentContainer
// 			case ItemKind.EquipmentModifier:
// 				return ImportedItemType.EquipmentModifier
// 			case ItemKind.EquipmentModifierContainer:
// 				return ImportedItemType.EquipmentModifierContainer
// 			case ItemKind.Note:
// 				return ImportedItemType.Note
// 			case ItemKind.NoteContainer:
// 				return ImportedItemType.NoteContainer
// 			case ItemKind.WeaponMelee:
// 				return ImportedItemType.WeaponMelee
// 			case ItemKind.WeaponRanged:
// 				return ImportedItemType.WeaponRanged
// 			default:
// 				throw new Error("Invalid item kind")
// 		}
// 	}
//
// 	static getStats(): SourceFromSchema<DocumentStatsSchema> {
// 		const date = Date.now()
// 		return {
// 			systemId: SYSTEM_NAME,
// 			systemVersion: game.system.version,
// 			coreVersion: game.version,
// 			createdTime: date,
// 			modifiedTime: date,
// 			lastModifiedBy: game.user.id,
// 			compendiumSource: null,
// 			duplicateSource: null,
// 		}
// 	}
// }
//
// class TraitImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedTraitSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: TraitSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Trait,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			userdesc: item.userdesc ?? "",
// 			tags: item.tags ?? [],
// 			// modifiers handled separately
// 			base_points: item.base_points ?? 0,
// 			levels: item.levels ?? 0,
// 			points_per_level: item.points_per_level ?? 0,
// 			prereqs: ItemImporter.importPrereqs(item.prereqs),
// 			// weapons handled separately
// 			features: ItemImporter.importFeatures(item.features),
// 			study: ItemImporter.importStudy(item.study),
// 			cr: item.cr ?? selfctrl.Roll.NoCR,
// 			cr_adj: item.cr_adj ?? selfctrl.Adjustment.NoCRAdj,
// 			study_hours_needed:
// 				item.study_hours_needed === ""
// 					? study.Level.Standard
// 					: (item.study_hours_needed ?? study.Level.Standard),
// 			disabled: item.disabled ?? false,
// 			round_down: item.round_down ?? false,
// 			can_level: item.can_level ?? false,
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.modifiers?.reduce((acc, mod) => {
// 			if ((context.fileVersion = 5)) mod.type = ItemImporter.getTypeFromKind(mod.id)
// 			acc.push(
// 				...ItemImportHandlers[mod.type].importItem(mod, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		item.weapons?.reduce((acc, weapon) => {
// 			if ((context.fileVersion = 5)) weapon.type = ItemImporter.getTypeFromKind(weapon.id)
// 			acc.push(
// 				...ItemImportHandlers[weapon.type].importItem(weapon, {
// 					parentId: id,
// 					fileVersion: context.fileVersion,
// 				}),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: TraitSource = {
// 			_id: id,
// 			type: ItemType.Trait,
// 			name: systemData.name || translations.TYPES.Item[ItemType.Trait],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Trait}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class TraitContainerImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedTraitContainerSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: TraitContainerSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.TraitContainer,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			ancestry: item.ancestry ?? "",
// 			userdesc: item.userdesc ?? "",
// 			tags: item.tags ?? [],
// 			// modifiers handled separately
// 			// weapons handled separately
// 			cr: item.cr ?? selfctrl.Roll.NoCR,
// 			cr_adj: item.cr_adj ?? selfctrl.Adjustment.NoCRAdj,
// 			container_type: item.container_type ?? container.Type.Group,
// 			disabled: item.disabled ?? false,
// 			template_picker: ItemImporter.importTemplatePicker(item.template_picker),
// 			prereqs: ItemImporter.importPrereqs(item.prereqs),
// 			open: true,
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.children?.reduce((acc, child) => {
// 			if ((context.fileVersion = 5)) child.type = ItemImporter.getTypeFromKind(child.id)
// 			acc.push(
// 				...ItemImportHandlers[child.type].importItem(child, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		item.modifiers?.reduce((acc, mod) => {
// 			if ((context.fileVersion = 5)) mod.type = ItemImporter.getTypeFromKind(mod.id)
// 			acc.push(
// 				...ItemImportHandlers[mod.type].importItem(mod, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: TraitContainerSource = {
// 			_id: id,
// 			type: ItemType.TraitContainer,
// 			name: systemData.name || translations.TYPES.Item[ItemType.TraitContainer],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Trait}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class TraitModifierImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedTraitModifierSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: TraitModifierSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.TraitModifier,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			cost: item.cost ?? 0,
// 			levels: item.levels ?? 0,
// 			affects: item.affects ?? affects.Option.Total,
// 			cost_type: item.cost_type ?? tmcost.Type.Points,
// 			disabled: item.disabled ?? false,
// 			features: ItemImporter.importFeatures(item.features),
// 			replacements: item.replacements ?? {},
// 		}
//
// 		const newItem: TraitModifierSource = {
// 			_id: id,
// 			type: ItemType.TraitModifier,
// 			name: systemData.name || translations.TYPES.Item[ItemType.TraitModifier],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.TraitModifier}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class TraitModifierContainerImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedTraitModifierContainerSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: TraitModifierContainerSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.TraitModifierContainer,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			open: true,
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.children?.reduce((acc, child) => {
// 			if ((context.fileVersion = 5)) child.type = ItemImporter.getTypeFromKind(child.id)
// 			acc.push(
// 				...ItemImportHandlers[child.type].importItem(child, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: TraitModifierContainerSource = {
// 			_id: id,
// 			type: ItemType.TraitModifierContainer,
// 			name: systemData.name || translations.TYPES.Item[ItemType.TraitModifierContainer],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.TraitModifier}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class SkillImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedSkillSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: SkillSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Skill,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			specialization: item.specialization ?? "",
// 			tech_level: item.tech_level ?? "",
// 			tech_level_required: typeof item.tech_level === "string",
// 			difficulty: item.difficulty ?? "dx/a",
// 			points: item.points ?? 0,
// 			encumbrance_penalty_multiplier: item.encumbrance_penalty_multiplier ?? 0,
// 			defaulted_from: ItemImporter.importSkillDefault(item.defaulted_from),
// 			defaults: item.defaults?.map(e => ItemImporter.importSkillDefault(e)) ?? [],
// 			prereqs: ItemImporter.importPrereqs(item.prereqs),
// 			// weapons handled separately
// 			features: ItemImporter.importFeatures(item.features),
// 			study: ItemImporter.importStudy(item.study),
// 			study_hours_needed:
// 				item.study_hours_needed === ""
// 					? study.Level.Standard
// 					: (item.study_hours_needed ?? study.Level.Standard),
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.weapons?.reduce((acc, weapon) => {
// 			if ((context.fileVersion = 5)) weapon.type = ItemImporter.getTypeFromKind(weapon.id)
// 			acc.push(
// 				...ItemImportHandlers[weapon.type].importItem(weapon, {
// 					parentId: id,
// 					fileVersion: context.fileVersion,
// 				}),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: SkillSource = {
// 			_id: id,
// 			type: ItemType.Skill,
// 			name: systemData.name || translations.TYPES.Item[ItemType.Skill],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Skill}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class TechniqueImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedTechniqueSystemSorce,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: TechniqueSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Technique,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			tech_level: item.tech_level ?? "",
// 			tech_level_required: true,
// 			difficulty: item.difficulty ?? difficulty.Level.Average,
// 			points: item.points ?? 0,
// 			default: ItemImporter.importSkillDefault(item.default ?? { type: gid.Skill, name: "Skill", modifier: 0 }),
// 			defaults: item.defaults?.map(e => ItemImporter.importSkillDefault(e)) ?? [],
// 			limit: item.limit ?? 0,
// 			limited: typeof item.limit === "number",
// 			prereqs: ItemImporter.importPrereqs(item.prereqs),
// 			// weapons handled separately
// 			features: ItemImporter.importFeatures(item.features),
// 			study: ItemImporter.importStudy(item.study),
// 			study_hours_needed:
// 				item.study_hours_needed === ""
// 					? study.Level.Standard
// 					: (item.study_hours_needed ?? study.Level.Standard),
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.weapons?.reduce((acc, weapon) => {
// 			if ((context.fileVersion = 5)) weapon.type = ItemImporter.getTypeFromKind(weapon.id)
// 			acc.push(
// 				...ItemImportHandlers[weapon.type].importItem(weapon, {
// 					parentId: id,
// 					fileVersion: context.fileVersion,
// 				}),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: TechniqueSource = {
// 			_id: id,
// 			type: ItemType.Technique,
// 			name: systemData.name || translations.TYPES.Item[ItemType.Technique],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Skill}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class SkillContainerImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedSkillContainerSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: SkillContainerSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.SkillContainer,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			template_picker: ItemImporter.importTemplatePicker(item.template_picker),
// 			open: true,
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.children?.reduce((acc, child) => {
// 			if ((context.fileVersion = 5)) child.type = ItemImporter.getTypeFromKind(child.id)
// 			acc.push(
// 				...ItemImportHandlers[child.type].importItem(child, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: SkillContainerSource = {
// 			_id: id,
// 			type: ItemType.SkillContainer,
// 			name: systemData.name || translations.TYPES.Item[ItemType.SkillContainer],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Skill}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class SpellImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedSpellSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: SpellSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Spell,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			tech_level: item.tech_level ?? "",
// 			tech_level_required: typeof item.tech_level === "string",
// 			difficulty: item.difficulty ?? "dx/a",
// 			college: item.college ?? [],
// 			power_source: item.power_source ?? "",
// 			spell_class: item.spell_class ?? "",
// 			resist: item.resist ?? "",
// 			casting_cost: item.casting_cost ?? "",
// 			maintenance_cost: item.maintenance_cost ?? "",
// 			casting_time: item.casting_time ?? "",
// 			duration: item.duration ?? "",
// 			points: item.points ?? 0,
// 			prereqs: ItemImporter.importPrereqs(item.prereqs),
// 			// weapons handled separately
// 			study: ItemImporter.importStudy(item.study),
// 			study_hours_needed:
// 				item.study_hours_needed === ""
// 					? study.Level.Standard
// 					: (item.study_hours_needed ?? study.Level.Standard),
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.weapons?.reduce((acc, weapon) => {
// 			if ((context.fileVersion = 5)) weapon.type = ItemImporter.getTypeFromKind(weapon.id)
// 			acc.push(
// 				...ItemImportHandlers[weapon.type].importItem(weapon, {
// 					parentId: id,
// 					fileVersion: context.fileVersion,
// 				}),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: SpellSource = {
// 			_id: id,
// 			type: ItemType.Spell,
// 			name: systemData.name || translations.TYPES.Item[ItemType.Spell],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Spell}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class RitualMagicSpellImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedRitualMagicSpellSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: RitualMagicSpellSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.RitualMagicSpell,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			tech_level: item.tech_level ?? "",
// 			tech_level_required: typeof item.tech_level === "string",
// 			difficulty: item.difficulty ?? difficulty.Level.Hard,
// 			college: item.college ?? [],
// 			power_source: item.power_source ?? "",
// 			spell_class: item.spell_class ?? "",
// 			resist: item.resist ?? "",
// 			casting_cost: item.casting_cost ?? "",
// 			maintenance_cost: item.maintenance_cost ?? "",
// 			casting_time: item.casting_time ?? "",
// 			duration: item.duration ?? "",
// 			base_skill: item.base_skill ?? "Ritual Magic",
// 			prereq_count: item.prereq_count ?? 0,
// 			points: item.points ?? 0,
// 			prereqs: ItemImporter.importPrereqs(item.prereqs),
// 			// weapons handled separately
// 			study: ItemImporter.importStudy(item.study),
// 			study_hours_needed:
// 				item.study_hours_needed === ""
// 					? study.Level.Standard
// 					: (item.study_hours_needed ?? study.Level.Standard),
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.weapons?.reduce((acc, weapon) => {
// 			if ((context.fileVersion = 5)) weapon.type = ItemImporter.getTypeFromKind(weapon.id)
// 			acc.push(
// 				...ItemImportHandlers[weapon.type].importItem(weapon, {
// 					parentId: id,
// 					fileVersion: context.fileVersion,
// 				}),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: RitualMagicSpellSource = {
// 			_id: id,
// 			type: ItemType.RitualMagicSpell,
// 			name: systemData.name || translations.TYPES.Item[ItemType.RitualMagicSpell],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Spell}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class SpellContainerImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedSpellContainerSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: SpellContainerSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.SpellContainer,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			template_picker: ItemImporter.importTemplatePicker(item.template_picker),
// 			open: true,
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.children?.reduce((acc, mod) => {
// 			if ((context.fileVersion = 5)) mod.type = ItemImporter.getTypeFromKind(mod.id)
// 			acc.push(
// 				...ItemImportHandlers[item.type].importItem(mod, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: SpellContainerSource = {
// 			_id: id,
// 			type: ItemType.SpellContainer,
// 			name: systemData.name || translations.TYPES.Item[ItemType.SpellContainer],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Spell}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class EquipmentImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedEquipmentSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: EquipmentSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Equipment,
// 			description: item.description ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tech_level: item.tech_level ?? "",
// 			legality_class: item.legality_class ?? "",
// 			tags: item.tags ?? [],
// 			// modifiers handled separately
// 			rated_strength: item.rated_strength ?? null,
// 			quantity: item.quantity ?? 0,
// 			value: item.value ?? 0,
// 			weight: item.weight ?? "0 lb",
// 			max_uses: item.max_uses ?? 0,
// 			uses: item.uses ?? 0,
// 			prereqs: ItemImporter.importPrereqs(item.prereqs),
// 			// weapons handled separately
// 			features: ItemImporter.importFeatures(item.features),
// 			equipped: item.equipped ?? true,
// 			ignore_weight_for_skills: item.ignore_weight_for_skills ?? false,
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.modifiers?.reduce((acc, mod) => {
// 			if ((context.fileVersion = 5)) mod.type = ItemImporter.getTypeFromKind(mod.id)
// 			acc.push(
// 				...ItemImportHandlers[mod.type].importItem(mod, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		item.weapons?.reduce((acc, weapon) => {
// 			if ((context.fileVersion = 5)) weapon.type = ItemImporter.getTypeFromKind(weapon.id)
// 			acc.push(
// 				...ItemImportHandlers[weapon.type].importItem(weapon, {
// 					parentId: id,
// 					fileVersion: context.fileVersion,
// 				}),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: EquipmentSource = {
// 			_id: id,
// 			type: ItemType.Equipment,
// 			name: systemData.description || translations.TYPES.Item[ItemType.Equipment],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/equipment.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class EquipmentContainerImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedEquipmentContainerSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: EquipmentContainerSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.EquipmentContainer,
// 			description: item.description ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tech_level: item.tech_level ?? "",
// 			legality_class: item.legality_class ?? "",
// 			tags: item.tags ?? [],
// 			// modifiers handled separately
// 			rated_strength: item.rated_strength ?? null,
// 			quantity: item.quantity ?? 0,
// 			value: item.value ?? 0,
// 			weight: item.weight ?? "0 lb",
// 			max_uses: item.max_uses ?? 0,
// 			uses: item.uses ?? 0,
// 			prereqs: ItemImporter.importPrereqs(item.prereqs),
// 			// weapons handled separately
// 			features: ItemImporter.importFeatures(item.features),
// 			equipped: item.equipped ?? true,
// 			ignore_weight_for_skills: item.ignore_weight_for_skills ?? false,
// 			open: true,
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.children?.reduce((acc, child) => {
// 			if ((context.fileVersion = 5)) child.type = ItemImporter.getTypeFromKind(child.id)
// 			acc.push(
// 				...ItemImportHandlers[child.type].importItem(child, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		item.modifiers?.reduce((acc, mod) => {
// 			if ((context.fileVersion = 5)) mod.type = ItemImporter.getTypeFromKind(mod.id)
// 			acc.push(
// 				...ItemImportHandlers[mod.type].importItem(mod, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		item.weapons?.reduce((acc, weapon) => {
// 			if ((context.fileVersion = 5)) weapon.type = ItemImporter.getTypeFromKind(weapon.id)
// 			acc.push(
// 				...ItemImportHandlers[weapon.type].importItem(weapon, {
// 					parentId: id,
// 					fileVersion: context.fileVersion,
// 				}),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: EquipmentContainerSource = {
// 			_id: id,
// 			type: ItemType.EquipmentContainer,
// 			name: systemData.description || translations.TYPES.Item[ItemType.EquipmentContainer],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/equipment.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class EquipmentModifierImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedEquipmentModifierSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: EquipmentModifierSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.EquipmentModifier,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			cost_type: item.cost_type ?? emcost.Type.Original,
// 			weight_type: item.weight_type ?? emweight.Type.Original,
// 			disabled: item.disabled ?? false,
// 			tech_level: item.tech_level ?? "",
// 			cost: item.cost ?? "0",
// 			weight: item.weight ?? "",
// 			features: ItemImporter.importFeatures(item.features),
// 			replacements: item.replacements ?? {},
// 		}
//
// 		const newItem: EquipmentModifierSource = {
// 			_id: id,
// 			type: ItemType.EquipmentModifier,
// 			name: systemData.name || translations.TYPES.Item[ItemType.EquipmentModifier],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.EquipmentModifier}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class EquipmentModifierContainerImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedEquipmentModifierContainerSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: EquipmentModifierContainerSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.EquipmentModifierContainer,
// 			name: item.name ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			notes: item.notes ?? "",
// 			vtt_notes: item.vtt_notes ?? "",
// 			tags: item.tags ?? [],
// 			open: true,
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.children?.reduce((acc, child) => {
// 			if ((context.fileVersion = 5)) child.type = ItemImporter.getTypeFromKind(child.id)
// 			acc.push(
// 				...ItemImportHandlers[child.type].importItem(child, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: EquipmentModifierContainerSource = {
// 			_id: id,
// 			type: ItemType.EquipmentModifierContainer,
// 			name: systemData.name || translations.TYPES.Item[ItemType.EquipmentModifierContainer],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.EquipmentModifier}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class NoteImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedNoteSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: NoteSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Note,
// 			text: item.text ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			replacements: item.replacements ?? {},
// 		}
//
// 		const newItem: NoteSource = {
// 			_id: id,
// 			type: ItemType.Note,
// 			name: systemData.text || translations.TYPES.Item[ItemType.Note],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Note}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class NoteContainerImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedNoteContainerSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: NoteContainerSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.NoteContainer,
// 			text: item.text ?? "",
// 			reference: item.reference ?? "",
// 			reference_highlight: item.reference ?? "",
// 			open: true,
// 			replacements: item.replacements ?? {},
// 		}
//
// 		item.children?.reduce((acc, child) => {
// 			if ((context.fileVersion = 5)) child.type = ItemImporter.getTypeFromKind(child.id)
// 			acc.push(
// 				...ItemImportHandlers[child.type].importItem(child, { parentId: id, fileVersion: context.fileVersion }),
// 			)
// 			return acc
// 		}, results)
//
// 		const newItem: NoteContainerSource = {
// 			_id: id,
// 			type: ItemType.NoteContainer,
// 			name: systemData.text || translations.TYPES.Item[ItemType.NoteContainer],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Note}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class MeleeWeaponImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedMeleeWeaponSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: MeleeWeaponSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.WeaponMelee,
// 			damage: {
// 				base: "",
// 				st: stdmg.Option.Thrust,
// 				armor_divisor: 1,
// 				fragmentation: "",
// 				fragmentation_armor_divisor: 1,
// 				fragmentation_type: "",
// 				modifier_per_die: 0,
// 				...item.damage,
// 			},
// 			strength: item.strength ?? "",
// 			usage: item.usage ?? "",
// 			usage_notes: item.usage_notes ?? "",
// 			reach: item.reach ?? "",
// 			parry: item.parry ?? "",
// 			block: item.block ?? "",
// 			defaults: item.defaults?.map(e => ItemImporter.importSkillDefault(e)) ?? [],
// 		}
//
// 		const newItem: MeleeWeaponSource = {
// 			_id: id,
// 			type: ItemType.WeaponMelee,
// 			name: systemData.usage || translations.TYPES.Item[ItemType.WeaponMelee],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.WeaponMelee}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// class RangedWeaponImporter extends ItemImporter {
// 	override importItem(
// 		item: ImportedRangedWeaponSystemSource,
// 		context: ItemImportContext = { parentId: null, fileVersion: 4 },
// 	): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		const systemData: RangedWeaponSystemSource = {
// 			container: context.parentId,
// 			id: item.id,
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.WeaponRanged,
// 			damage: {
// 				base: "",
// 				st: stdmg.Option.Thrust,
// 				armor_divisor: 1,
// 				fragmentation: "",
// 				fragmentation_armor_divisor: 1,
// 				fragmentation_type: "",
// 				modifier_per_die: 0,
// 				...item.damage,
// 			},
// 			strength: item.strength ?? "",
// 			usage: item.usage ?? "",
// 			usage_notes: item.usage_notes ?? "",
// 			accuracy: item.accuracy ?? "",
// 			range: item.range ?? "",
// 			rate_of_fire: item.rate_of_fire ?? "",
// 			shots: item.shots ?? "",
// 			bulk: item.bulk ?? "",
// 			recoil: item.recoil ?? "",
// 			defaults: item.defaults?.map(e => ItemImporter.importSkillDefault(e)) ?? [],
// 		}
//
// 		const newItem: RangedWeaponSource = {
// 			_id: id,
// 			type: ItemType.WeaponRanged,
// 			name: systemData.usage || translations.TYPES.Item[ItemType.WeaponRanged],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.WeaponRanged}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: ItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		return results
// 	}
// }
//
// const ItemImportHandlers: Record<ImportedItemType, ItemImporter> = {
// 	[ImportedItemType.Trait]: new TraitImporter(),
// 	[ImportedItemType.TraitContainer]: new TraitContainerImporter(),
// 	[ImportedItemType.TraitModifier]: new TraitModifierImporter(),
// 	[ImportedItemType.TraitModifierContainer]: new TraitModifierContainerImporter(),
// 	[ImportedItemType.Skill]: new SkillImporter(),
// 	[ImportedItemType.Technique]: new TechniqueImporter(),
// 	[ImportedItemType.SkillContainer]: new SkillContainerImporter(),
// 	[ImportedItemType.Spell]: new SpellImporter(),
// 	[ImportedItemType.RitualMagicSpell]: new RitualMagicSpellImporter(),
// 	[ImportedItemType.SpellContainer]: new SpellContainerImporter(),
// 	[ImportedItemType.Equipment]: new EquipmentImporter(),
// 	[ImportedItemType.EquipmentContainer]: new EquipmentContainerImporter(),
// 	[ImportedItemType.EquipmentModifier]: new EquipmentModifierImporter(),
// 	[ImportedItemType.EquipmentModifierContainer]: new EquipmentModifierContainerImporter(),
// 	[ImportedItemType.Note]: new NoteImporter(),
// 	[ImportedItemType.NoteContainer]: new NoteContainerImporter(),
// 	[ImportedItemType.WeaponMelee]: new MeleeWeaponImporter(),
// 	[ImportedItemType.WeaponRanged]: new RangedWeaponImporter(),
// }
// export { ItemImporter }
