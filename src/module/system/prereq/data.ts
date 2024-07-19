import { prereq } from "@util/enum/prereq.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import fields = foundry.data.fields
import { NumericCriteriaSchema, WeightCriteriaSchema } from "@util"



export type BasePrereqSchema<TType extends prereq.Type> = {
	type: fields.StringField<TType>
}

export type AttributePrereqSchema = BasePrereqSchema<prereq.Type.Attribute> & {
	has: fields.BooleanField
	which: fields.StringField
	combined_with: fields.StringField
	qualifier: fields.SchemaField<NumericCriteriaSchema>
}

export type ContainedQuantityPrereqSchema = BasePrereqSchema<prereq.Type.ContainedQuantity> & {
	has: fields.BooleanField
	qualifier: fields.SchemaField<NumericCriteriaSchema>
}

export type ContainedWeightPrereqSchema = BasePrereqSchema<prereq.Type.ContainedWeight> & {
	has: fields.BooleanField
	qualifier: fields.SchemaField<WeightCriteriaSchema>
}

export type EquippedEquipmentPrereqSchema = BasePrereqSchema<prereq.Type.EquippedEquipment> & {
	name: fields.StringField<string, string, true, true>
}

export type PrereqListSchema = BasePrereqSchema<prereq.Type.List> & {
	all: fields.BooleanField<boolean, boolean, true, false, true>
	when_tl: fields.SchemaField<NumericCriteriaSchema>
	prereqs: fields.ArrayField<fields.SchemaField<PrereqSchema>>
}

export type SkillPrereqSchema = BasePrereqSchema<prereq.Type.Skill> & {
	has: fields.BooleanField
	name: fields.StringField<string, string, true, true>
	level: fields.NumberField<number, number, true, true>
	specialization: fields.StringField<string, string, true, true>
}

export type SpellPrereqSchema = BasePrereqSchema<prereq.Type.Spell> & {
	has: fields.BooleanField
	sub_type: fields.StringField<spellcmp.Type>
	qualifier: fields.StringField<string, string, true, true>
	quantity: fields.NumberField<number, number, true, true>
}

export type TraitPrereqSchema = BasePrereqSchema<prereq.Type.Trait> & {
	has: fields.BooleanField
	name: fields.StringField<string, string, true, true>
	level: fields.NumberField<number, number, true, true>
	notes: fields.StringField<string, string, true, true>
}

export type PrereqSchema =
	| PrereqListSchema
	| TraitPrereqSchema
	| AttributePrereqSchema
	| ContainedQuantityPrereqSchema
	| ContainedWeightPrereqSchema
	| EquippedEquipmentPrereqSchema
	| SkillPrereqSchema
	| SpellPrereqSchema



// export interface BasePrereqObj<TType extends prereq.Type> {
// 	type: TType
// }
//
// export interface AttributePrereqObj extends BasePrereqObj<prereq.Type.Attribute> {
// 	has: boolean
// 	which: string
// 	combined_with?: string
// 	qualifier?: NumericCriteriaObj
// }
//
// export interface ContainedQuantityPrereqObj extends BasePrereqObj<prereq.Type.ContainedQuantity> {
// 	has: boolean
// 	qualifier?: NumericCriteriaObj
// }
//
// export interface ContainedWeightPrereqObj extends BasePrereqObj<prereq.Type.ContainedWeight> {
// 	has: boolean
// 	qualifier?: WeightCriteriaObj
// }
// export interface EquippedEquipmentPrereqObj extends BasePrereqObj<prereq.Type.EquippedEquipment> {
// 	name?: StringCriteriaObj
// }
//
// export interface PrereqListObj extends BasePrereqObj<prereq.Type.List> {
// 	all: boolean
// 	when_tl?: NumericCriteriaObj
// 	prereqs?: PrereqObj[]
// }
// export interface SkillPrereqObj extends BasePrereqObj<prereq.Type.Skill> {
// 	has: boolean
// 	name?: StringCriteriaObj
// 	level?: NumericCriteriaObj
// 	specialization?: StringCriteriaObj
// }
// export interface SpellPrereqObj extends BasePrereqObj<prereq.Type.Spell> {
// 	has: boolean
// 	sub_type: spellcmp.Type
// 	qualifier?: StringCriteriaObj
// 	quantity?: NumericCriteriaObj
// }
// export interface TraitPrereqObj extends BasePrereqObj<prereq.Type.Trait> {
// 	has: boolean
// 	name?: StringCriteriaObj
// 	level?: NumericCriteriaObj
// 	notes?: StringCriteriaObj
// }
//

// export type PrereqObj =
// 	| PrereqListObj
// 	| TraitPrereqObj
// 	| AttributePrereqObj
// 	| ContainedQuantityPrereqObj
// 	| ContainedWeightPrereqObj
// 	| EquippedEquipmentPrereqObj
// 	| SkillPrereqObj
// 	| SpellPrereqObj
