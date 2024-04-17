import { ActorGURPS } from "@actor"
import { ConditionGURPS } from "@item"
import { ConditionSource } from "@item/data/index.ts"
import { TokenGURPS } from "@module/canvas/index.ts"
import { COMPENDIA, ConditionID, ItemType, ManeuverID, SYSTEM_NAME } from "@module/data/constants.ts"
import { AllManeuverIDs, ApplicableConditions } from "@module/data/types.ts"
import { ErrorGURPS, LocalizeGURPS, setHasElement, sluggify } from "@util"

export class ConditionManager {
	static #initialized = false

	static conditions: Map<string | ItemUUID, ConditionGURPS<null>> = new Map()
	static maneuvers: Map<string | ItemUUID, ConditionGURPS<null>> = new Map()

	private static CONDITION_SOURCES?: ConditionSource[] = CONDITION_SOURCES
	private static MANEUVER_SOURCES?: ConditionSource[] = MANEUVER_SOURCES

	/** Gets a list of condition slugs. */
	static get conditionsSlugs(): string[] {
		return [...this.conditions.keys()].filter(k => !k.startsWith("Compendium."))
	}

	static get maneuverSources(): string[] {
		return [...this.maneuvers.keys()].filter(k => !k.startsWith("Compendium."))
	}

	static initialize(): void {
		if (this.#initialized) return

		this.conditions = new Map(
			this.CONDITION_SOURCES?.flatMap(source => {
				const condition: ConditionGURPS<null> = new ConditionGURPS(source, {
					pack: `${SYSTEM_NAME}.${COMPENDIA.CONDITIONS}`,
				})
				return [
					[condition.system.slug!, condition],
					[condition.uuid, condition],
				]
			}) ?? [],
		)
		delete this.CONDITION_SOURCES

		this.maneuvers = new Map(
			this.MANEUVER_SOURCES?.flatMap(source => {
				const maneuver: ConditionGURPS<null> = new ConditionGURPS(source, {
					pack: `${SYSTEM_NAME}.${COMPENDIA.MANEUVERS}`,
				})
				return [
					[maneuver.system.slug!, maneuver],
					[maneuver.uuid, maneuver],
				]
			}) ?? [],
		)
		delete this.MANEUVER_SOURCES

		if (game.i18n.lang !== "en") {
			const conditionLang = LocalizeGURPS.translations.gurps.status
			for (const condition of this.conditions.values()) {
				condition.name = condition._source.name = conditionLang[`${condition.system.slug}` as ConditionID]
			}

			const maneuverLang = LocalizeGURPS.translations.gurps.maneuver
			for (const maneuver of this.maneuvers.values()) {
				maneuver.name = maneuver._source.name = maneuverLang[`${maneuver.system.slug}` as ManeuverID]
			}
		}

		this.#initialized = true
	}

	/**
	 * Get a condition using the condition name.
	 * @param slug A condition slug
	 */
	static getCondition(slug: ConditionID, modifications?: DeepPartial<ConditionSource>): ConditionGURPS<null>
	static getCondition(slug: string, modifications?: DeepPartial<ConditionSource>): ConditionGURPS<null> | null
	static getCondition(slug: string, modifications: DeepPartial<ConditionSource> = {}): ConditionGURPS<null> | null {
		slug = sluggify(slug)
		if (!setHasElement(new Set(ApplicableConditions), slug)) return null

		const condition = ConditionManager.conditions.get(slug)?.clone(modifications)
		if (!condition) throw ErrorGURPS("Unexpected failure looking up condition")

		return condition
	}

	/**
	 * Get a maneuver using the maneuver name.
	 * @param slug A maneuver slug
	 */
	static getManeuver(slug: ManeuverID, modifications?: DeepPartial<ConditionSource>): ConditionGURPS<null>
	static getManeuver(slug: string, modifications?: DeepPartial<ConditionSource>): ConditionGURPS<null> | null
	static getManeuver(slug: string, modifications: DeepPartial<ConditionSource> = {}): ConditionGURPS<null> | null {
		slug = sluggify(slug)
		if (!setHasElement(new Set(AllManeuverIDs), slug)) return null

		const condition = ConditionManager.maneuvers.get(slug)?.clone(modifications)
		if (!condition) throw ErrorGURPS("Unexpected failure looking up condition")

		return condition
	}

	static updateConditionValue(itemId: string, actor: ActorGURPS, level: number): Promise<void>
	static updateConditionValue(itemId: string, token: TokenGURPS, level: number): Promise<void>
	static updateConditionValue(itemId: string, actorOrToken: ActorGURPS | TokenGURPS, level: number): Promise<void>
	static async updateConditionValue(
		itemId: string,
		actorOrToken: ActorGURPS | TokenGURPS,
		level: number,
	): Promise<void> {
		const actor = "prototypeToken" in actorOrToken ? actorOrToken : actorOrToken.actor
		const condition = actor?.items.get(itemId)

		if (condition?.isOfType(ItemType.Condition)) {
			if (level === 0 || !condition.system.can_level) {
				await condition.delete()
			} else {
				level = Math.min(level, condition.system.levels.max ?? 0)
				await condition.update({ "system.levels.current": level })
			}
		}
	}
}
