import { DiceGURPS } from "@module/dice"
import { SYSTEM_NAME } from "@module/settings"
import { DamageCalculator } from "."
import { DamageAttacker, DamageRoll } from "./damage_roll"
import { createDamageTarget, DamageTarget } from "./damage_target"
import { DamageType } from "./damage_type"

class ApplyDamageDialog extends Application {
	static open() {
		console.log("Apply Damage!")

		// @ts-ignore game.actors.get until types v10
		let attacker = game.actors.get("T1F2t39tufdO1OGA")

		let roll: DamageRoll = {
			locationId: "torso",
			attacker: attacker,
			dice: new DiceGURPS("3d+1"),
			basicDamage: 0,
			damageType: DamageType.injury,
			damageModifier: "",
			weapon: null,
			armorDivisor: 0,
			rofMultiplier: 0,
			range: null,
			isHalfDamage: false,
			isShotgunCloseRange: false,
			vulnerability: 0,
			internalExplosion: false,
		}

		// @ts-ignore game.actors.get until types v10
		let actor = game.actors.get("T1F2t39tufdO1OGA")
		let target: DamageTarget = createDamageTarget(actor)

		// Let target: DamageTarget = {
		// 	ST: 0,
		// 	hitPoints: {
		// 		value: 0,
		// 		current: 0,
		// 	},
		// 	hitLocationTable: new HitLocationTableAdapter({
		// 		name: "Humanoid",
		// 		roll: new DiceGURPS("3d"),
		// 		locations: [],
		// 	}),

		// 	getTrait: function (name: string): TraitAdapter | undefined {
		// 		throw new Error("Function not implemented.")
		// 	},

		// 	hasTrait: function (name: string): boolean {
		// 		throw new Error("Function not implemented.")
		// 	},

		// 	isUnliving: false,
		// 	isHomogenous: false,
		// 	isDiffuse: false,
		// }

		const app = new ApplyDamageDialog(roll, target)
		app.render(true)
	}

	private calculator: DamageCalculator

	constructor(roll: DamageRoll, target: DamageTarget, options = {}) {
		super(options)
		this.calculator = new DamageCalculator(roll, target)
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			popOut: true,
			minimizable: false,
			resizable: false,
			id: "ApplyDamageDialog",
			template: `systems/${SYSTEM_NAME}/templates/damage_calculator/apply-damage.hbs`,
			classes: ["apply-damage"],
		})
	}

	getData(options?: Partial<ApplicationOptions> | undefined): object {
		return mergeObject(super.getData(options), {
			attacker: this.attacker,
		})
	}

	private get attacker(): DamageAttacker {
		return this.calculator.damageRoll.attacker
	}
}

export { ApplyDamageDialog }
