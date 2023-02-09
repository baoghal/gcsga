// Import { EffectGURPS } from "@item/effect"
import { ActorGURPS } from "@module/config"
// Import { pick } from "@util"
import { TokenDocumentGURPS } from "./document"

class TokenGURPS extends Token {
	get actor(): ActorGURPS {
		return super.actor as ActorGURPS
	}

	// Async showFloatyText(params: ShowFloatyEffectParams): Promise<void> {
	// 	if (!this.isVisible) return
	// 	/**
	// 	 * If the floaty text is generated by an effect being created/deleted
	// 	 * We do not display it if the effect is unidentified
	// 	 */
	// 	if (!game.user?.isGM && typeof params !== "number") {
	// 		const [_, document] = Object.entries(params)[0]
	// 		if (document instanceof EffectGURPS && document.system) return
	// 	}

	// 	const scrollingTextArgs = ((): any | null => {
	// 		if (typeof params === "number") {
	// 			const quantity = params
	// 			const maxHP = this.actor?.maxHP
	// 			if (!(quantity && typeof maxHP === "number")) return null

	// 			const percent = Math.clamped(Math.abs(quantity) / maxHP, 0, 1)
	// 			const textColors = {
	// 				damage: 16711680, // Reddish
	// 				healing: 65280, // Greenish
	// 			}
	// 			return [
	// 				this.center,
	// 				params.signedString(),
	// 				{
	// 					anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
	// 					jitter: 0.25,
	// 					fill: textColors[quantity < 0 ? "damage" : "healing"],
	// 					fontSize: 16 + 32 * percent, // Range between [16, 48]
	// 					stroke: 0x000000,
	// 					strokeThickness: 4,
	// 				},
	// 			]
	// 		} else {
	// 			const [change, details] = Object.entries(params)[0]
	// 			const isAdded = change === "create"
	// 			const sign = isAdded ? "+ " : "- "
	// 			const appendedNumber = details.level ? ` ${details.level}` : ""
	// 			const content = `${sign}${details.name}${appendedNumber}`
	// 			const anchorDirection = isAdded ? CONST.TEXT_ANCHOR_POINTS.TOP : CONST.TEXT_ANCHOR_POINTS.BOTTOM
	// 			const textStyle = pick(this._getTextStyle(), ["fill", "fontSize", "stroke", "strokeThickness"])

	// 			return [
	// 				this.center,
	// 				content,
	// 				{
	// 					...textStyle,
	// 					anchor: anchorDirection,
	// 					direction: anchorDirection,
	// 					jitter: 0.25,
	// 				},
	// 			]
	// 		}
	// 	})()
	// 	if (!scrollingTextArgs) return
	// 	// console.log(scrollingTextArgs)

	// 	await this._animation
	// 	await (canvas as any).interface?.createScrollingText(...scrollingTextArgs)
	// }

	override _onApplyStatusEffect(statusId: string, active: boolean): void {
		// @ts-ignore
		super._onApplyStatusEffect(statusId, active)
		if (["stealth"].includes(statusId)) {
			;(canvas as any)?.perception.update({ refreshVision: true, refreshLighting: true }, true)
			;(this as any)?.mesh.refresh()
		}
	}
}

// Type NumericFloatyEffect = { name: string | null; level?: number | null }
// type ShowFloatyEffectParams =
// 	| number
// 	| { create: NumericFloatyEffect }
// 	| { update: NumericFloatyEffect }
// 	| { delete: NumericFloatyEffect }

interface TokenGURPS extends Token {
	document: TokenDocumentGURPS
	/** A reference to an animation that is currently in progress for this Token, if any */
	_animation: Promise<unknown> | null
}

export { TokenGURPS }
