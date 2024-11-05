import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { NumericComparison, TooltipGURPS, Weight, prereq } from "@util"
import { ActorType, ItemType } from "@module/data/constants.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { ActorInst } from "../actor/helpers.ts"
import { WeightCriteriaField } from "../item/fields/weight-criteria-field.ts"
import { createDummyElement } from "@module/applications/helpers.ts"

class ContainedWeightPrereq extends BasePrereq<ContainedWeightPrereqSchema> {
	static override TYPE = prereq.Type.ContainedWeight

	static override defineSchema(): ContainedWeightPrereqSchema {
		return {
			...super.defineSchema(),
			qualifier: new WeightCriteriaField({
				required: true,
				nullable: false,
				choices: NumericComparison.CustomOptionsChoices("GURPS.Item.Prereqs.FIELDS.ContainedWeight.Qualifier"),
				initial: {
					compare: NumericComparison.Option.AtMostNumber,
					qualifier: Weight.format(5, Weight.Unit.Pound),
				},
			}),
		}
	}

	satisfied(actor: ActorInst<ActorType.Character>, exclude: unknown, tooltip: TooltipGURPS | null): boolean {
		let satisfied = false

		if (exclude instanceof ItemGURPS2 && exclude.isOfType(ItemType.EquipmentContainer)) {
			const units = SheetSettings.for(actor).default_weight_units
			const weight =
				(exclude.system.extendedWeight(false, units) as number) -
				(exclude.system.adjustedWeight(false, units) as number)
			satisfied = this.qualifier.matches(weight)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied && tooltip !== null) {
			tooltip.push(game.i18n.localize("GURPS.Tooltip.Prefix"))
			tooltip.push(
				game.i18n.format("GURPS.Prereq.ContainedWeight", {
					has: this.hasText,
					qualifier: this.qualifier.toString(),
				}),
			)
		}
		return satisfied
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.prereqs.${this.index}`

		// Root element
		const element = super.toFormElement(enabled)

		if (!enabled) {
			element.append(createDummyElement(`${prefix}.qualifier.compare`, this.qualifier.compare))
			element.append(createDummyElement(`${prefix}.qualifier.qualifier`, this.qualifier.qualifier))
		}

		// Name
		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields", "secondary")
		rowElement.append(
			this.schema.fields.qualifier.fields.compare.toInput({
				name: enabled ? `${prefix}.qualifier.compare` : "",
				value: this.qualifier.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement.append(
			this.schema.fields.qualifier.fields.qualifier.toInput({
				name: enabled ? `${prefix}.qualifier.qualifier` : "",
				value: this.qualifier.qualifier,
				disabled: !enabled,
			}) as HTMLElement,
		)
		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedWeightPrereq
	extends BasePrereq<ContainedWeightPrereqSchema>,
		ModelPropsFromSchema<ContainedWeightPrereqSchema> {}

type ContainedWeightPrereqSchema = BasePrereqSchema & {
	qualifier: WeightCriteriaField<true, false, true>
}

export { ContainedWeightPrereq, type ContainedWeightPrereqSchema }
