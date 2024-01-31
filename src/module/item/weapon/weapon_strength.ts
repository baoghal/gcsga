import { Int } from "@util/fxp.ts"
import { WeaponField } from "./weapon_field.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { feature } from "@util/enum/feature.ts"
import { BaseWeaponGURPS } from "./document.ts"
import { EquipmentContainerGURPS, EquipmentGURPS } from "@item"

export class WeaponStrength extends WeaponField {
	min?: number

	bipod?: boolean

	mounted?: boolean

	musketRest?: boolean

	twoHanded?: boolean

	twoHandedUnready?: boolean

	static parse(s: string): WeaponStrength {
		const ws = new WeaponStrength()
		s = s.trim()
		if (s !== "") {
			s = s.toLowerCase()
			ws.bipod = s.includes("b")
			ws.mounted = s.includes("m")
			ws.musketRest = s.includes("r")
			ws.twoHanded = s.includes("†") || s.includes("*")
			ws.twoHandedUnready = s.includes("‡")
			;[ws.min] = Int.extract(s)
			ws.validate()
		}
		return ws
	}

	resolve(w: BaseWeaponGURPS, tooltip: TooltipGURPS | null): WeaponStrength {
		const result = new WeaponStrength()
		Object.assign(result, this)
		if (w.actor) {
			if (w.container instanceof (EquipmentGURPS || EquipmentContainerGURPS)) {
				const st = Math.max(w.container.ratedStrength, 0)
				if (st !== 0) result.min = st
			}
		}
		result.bipod = w.resolveBoolFlag(wswitch.Type.Bipod, result.bipod ?? false)
		result.mounted = w.resolveBoolFlag(wswitch.Type.Mounted, result.mounted ?? false)
		result.musketRest = w.resolveBoolFlag(wswitch.Type.MusketRest, result.musketRest ?? false)
		result.twoHanded = w.resolveBoolFlag(wswitch.Type.TwoHanded, result.twoHanded ?? false)
		result.twoHandedUnready = w.resolveBoolFlag(
			wswitch.Type.TwoHandedAndUnreadyAfterAttack,
			result.twoHandedUnready ?? false,
		)
		result.min ??= 0
		for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponMinSTBonus))
			result.min += bonus.adjustedAmountForWeapon(w)
		result.validate()

		return result
	}

	override toString(): string {
		let buffer = ""
		if (this.min && this.min > 0) buffer += this.min.toString()
		if (this.bipod) buffer += "B"
		if (this.mounted) buffer += "M"
		if (this.musketRest) buffer += "R"
		if (this.twoHanded || this.twoHandedUnready) {
			if (this.twoHandedUnready) buffer += "‡"
			else buffer += "†"
		}

		return buffer
	}

	validate(): void {
		if (this.twoHandedUnready) this.twoHanded = false
	}
}
