import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { TemplatePicker, TemplatePickerSchema } from "@system"
import { cell, display, StringBuilder } from "@util"
import { CellData } from "./fields/cell-data.ts"
import { SheetSettings } from "../sheet-settings.ts"

class SkillContainerData extends ItemDataModel.mixin(BasicInformationTemplate, ContainerTemplate, ReplacementTemplate) {
	static override childTypes = new Set([ItemType.Skill, ItemType.SkillContainer, ItemType.Technique])

	static override defineSchema(): SkillContainerSchema {
		const fields = foundry.data.fields
		return this.mergeSchema(super.defineSchema(), {
			template_picker: new fields.SchemaField(TemplatePicker.defineSchema()),
		}) as SkillContainerSchema
	}

	override get cellData(): Record<string, CellData> {
		return {
			name: new CellData({
				type: cell.Type.Text,
				primary: this.processedName,
				secondary: this.secondaryText(display.Option.isInline),
				tooltip: this.secondaryText(display.Option.isTooltip),
			}),
			difficulty: new CellData({}),
			level: new CellData({}),
			relativeLevel: new CellData({}),
			points: new CellData({}),
			tags: new CellData({
				type: cell.Type.Tags,
				primary: this.combinedTags,
			}),
			reference: new CellData({
				type: cell.Type.PageRef,
				primary: this.reference,
				secondary: this.reference_highlight === "" ? this.nameWithReplacements : this.reference_highlight,
			}),
		}
	}

	get processedName(): string {
		return this.nameWithReplacements
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = SheetSettings.for(this.parent.actor)
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.processedNotes)
		}
		return buffer.toString()
	}
}

interface SkillContainerData extends ModelPropsFromSchema<SkillContainerSchema> {}

type SkillContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {
		template_picker: fields.SchemaField<TemplatePickerSchema>
	}

export { SkillContainerData, type SkillContainerSchema }