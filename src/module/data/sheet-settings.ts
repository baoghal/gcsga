import { ErrorGURPS } from "@util"
import fields = foundry.data.fields
import { ActorGURPS2 } from "@module/document/actor.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { BodyGURPS, BodySchema, BodySource } from "./hit-location.ts"
import { ActorDataModel } from "./abstract.ts"
import { DefaultSheetSettings, SheetSettingsSchema } from "@module/settings/sheet-settings-config.ts"
import { AttributeSettings, AttributeSettingsSchema } from "@module/settings/attributes-config.ts"
import { SETTINGS, SYSTEM_NAME } from "./constants.ts"

// export interface PageSettings {
// 	paper_size: paper.Size
// 	orientation: paper.Orientation
// 	top_margin: paper.Length
// 	left_margin: paper.Length
// 	bottom_margin: paper.Length
// 	right_margin: paper.Length
// }

// export enum BlockLayoutKey {
// 	BlockLayoutReactionsKey = "reactions",
// 	BlockLayoutConditionalModifiersKey = "conditional_modifiers",
// 	BlockLayoutMeleeKey = "melee",
// 	BlockLayoutRangedKey = "ranged",
// 	BlockLayoutTraitsKey = "traits",
// 	BlockLayoutSkillsKey = "skills",
// 	BlockLayoutSpellsKey = "spells",
// 	BlockLayoutEquipmentKey = "equipment",
// 	BlockLayoutOtherEquipmentKey = "other_equipment",
// 	BlockLayoutNotesKey = "notes",
// }
//
// type BlockLayoutString = `${BlockLayoutKey}` | `${BlockLayoutKey} ${BlockLayoutKey}`

type CharacterSheetSettingsSchema = SheetSettingsSchema &
	AttributeSettingsSchema & {
		body_type: fields.SchemaField<BodySchema, SourceFromSchema<BodySchema>, BodyGURPS>
	}

type CharacterSheetSettingsSource = Omit<SourceFromSchema<CharacterSheetSettingsSchema>, "body_type"> & {
	body_type: BodySource
}

class SheetSettings extends foundry.abstract.DataModel<ActorDataModel, CharacterSheetSettingsSchema> {
	get actor(): ActorGURPS2 {
		return this.parent.parent
	}

	static override defineSchema(): CharacterSheetSettingsSchema {
		const fields = foundry.data.fields

		const sheetSettings = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS)
		const sheetSettingsSchema = DefaultSheetSettings.defineSchema()
		for (const key of Object.keys(sheetSettingsSchema) as (keyof SheetSettingsSchema)[]) {
			sheetSettingsSchema[key].initial = sheetSettings[key]
		}

		const attributeSettings = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES)
		const attributeSettingsSchema = AttributeSettings.defineSchema()
		for (const key of Object.keys(attributeSettingsSchema) as (keyof AttributeSettingsSchema)[]) {
			attributeSettingsSchema[key].initial = attributeSettings[key]
		}

		return {
			...sheetSettingsSchema,
			...attributeSettingsSchema,
			body_type: new fields.SchemaField(BodyGURPS.defineSchema()),
		}
	}

	static default(): SheetSettings {
		return new SheetSettings({})
	}

	static for(actor: ActorGURPS2 | null): SheetSettings {
		if (actor instanceof ActorGURPS2) {
			if (actor.hasTemplate(ActorTemplateType.Settings)) {
				return actor.system.settings
			} else {
				console.error(`Actor "${actor.name}" does not support Sheet Settings. Returning default settings.`)
			}
		} else {
			ErrorGURPS(`Actor does not exist.Returning default settings.`)
		}
		return SheetSettings.default()
	}
}

interface SheetSettings
	extends foundry.abstract.DataModel<ActorDataModel, CharacterSheetSettingsSchema>,
		ModelPropsFromSchema<CharacterSheetSettingsSchema> {}

export { SheetSettings }
export type { CharacterSheetSettingsSchema, CharacterSheetSettingsSource }
