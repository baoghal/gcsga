import { ItemType } from "@data"
import { FeatureObj } from "@feature/index.ts"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"
import { PrereqListObj } from "@prereq/data.ts"
import { WeightString } from "@util/weight.ts"

export type EquipmentSource = BaseContainerSource<ItemType.Equipment, EquipmentSystemSource>

export interface EquipmentSystemSource extends Omit<ItemGCSSystemSource, "open"> {
	type: ItemType.Equipment
	description: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tech_level: string
	legality_class: string
	tags: string[]
	rated_strength?: number
	quantity: number
	value: number
	weight: WeightString
	max_uses: number
	uses: number
	prereqs: PrereqListObj
	features: FeatureObj[]
	equipped: boolean
	ignore_weight_for_skills: boolean
}
