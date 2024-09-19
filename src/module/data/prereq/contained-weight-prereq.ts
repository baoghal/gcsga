import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import fields = foundry.data.fields
import { LocalizeGURPS, TooltipGURPS, Weight, prereq } from "@util"
import { ActorType, ItemType, NumericCompareType } from "@module/data/constants.ts"
import { WeightCriteria, WeightCriteriaSchema } from "@module/util/weight-criteria.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { ActorInst } from "../actor/helpers.ts"

class ContainedWeightPrereq extends BasePrereq<ContainedWeightPrereqSchema> {
	static override TYPE = prereq.Type.ContainedWeight

	static override defineSchema(): ContainedWeightPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				initial: prereq.Type.ContainedWeight,
			}),
			has: new fields.BooleanField({ initial: true }),
			qualifier: new fields.SchemaField(WeightCriteria.defineSchema(), {
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: Weight.format(5, Weight.Unit.Pound),
				},
			}),
		}
	}

	satisfied(actor: ActorInst<ActorType.Character>, exclude: unknown, tooltip: TooltipGURPS | null): boolean {
		let satisfied = false

		if (exclude instanceof ItemGURPS2 && exclude.isOfType(ItemType.EquipmentContainer)) {
			const units = SheetSettings.for(actor).default_weight_units
			const weight = exclude.system.extendedWeight(false, units) - exclude.system.adjustedWeight(false, units)
			satisfied = this.qualifier.matches(weight)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied && tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.ContainedWeight, {
					has: this.hasText,
					qualifier: this.qualifier.toString(),
				}),
			)
		}
		return satisfied
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedWeightPrereq
	extends BasePrereq<ContainedWeightPrereqSchema>,
		ModelPropsFromSchema<ContainedWeightPrereqSchema> {}

type ContainedWeightPrereqSchema = BasePrereqSchema & {
	has: fields.BooleanField
	qualifier: fields.SchemaField<WeightCriteriaSchema, SourceFromSchema<WeightCriteriaSchema>, WeightCriteria>
}

export { ContainedWeightPrereq, type ContainedWeightPrereqSchema }