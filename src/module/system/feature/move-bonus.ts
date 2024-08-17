import { MoveBonusSchema, MoveBonusType } from "./data.ts"
import { gid } from "@data"
import { BaseFeature } from "./base.ts"
import { feature } from "@util"

class MoveBonus extends BaseFeature<MoveBonusSchema> {
	static override defineSchema(): MoveBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			// ...LeveledAmount.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false,  blank: false,initial: feature.Type.MoveBonus }),
			move_type: new fields.StringField({ initial: gid.Ground }),
			limitation: new fields.StringField({ choices: Object.values(MoveBonusType), initial: MoveBonusType.Base }),
		}
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface MoveBonus extends BaseFeature<MoveBonusSchema>, ModelPropsFromSchema<MoveBonusSchema> {}

export { MoveBonus }
