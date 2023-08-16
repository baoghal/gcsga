import { ContainerGURPS } from "@item/container"
import { ItemDataGURPS } from "@module/config"
import { ItemType, SYSTEM_NAME } from "@module/data"
import { Context } from "types/foundry/common/abstract/document.mjs"
import { ItemData } from "types/foundry/common/data/module.mjs"
import { BaseItemSourceGURPS, ItemConstructionContextGURPS, ItemFlags } from "./data"

class BaseItemGURPS extends Item {
	constructor(data: ItemDataGURPS | any, context: Context<Actor> & ItemConstructionContextGURPS = {}) {
		if (context.gurps?.ready) {
			super(data, context)
		} else {
			mergeObject(context, {
				gurps: {
					ready: true,
				},
			})
			const ItemConstructor = CONFIG.GURPS.Item.documentClasses[data.type as ItemType]
			if (ItemConstructor) return new ItemConstructor(data, context)
			throw Error(`Invalid Item Type "${data.type}"`)
		}
	}

	// override delete(context?: DocumentModificationContext | undefined): Promise<any> {
	// 	if (!(this.parent instanceof Item)) return super.delete(context)
	// 	return this.container?.deleteEmbeddedDocuments("Item", [this.id!])
	// }
	//

	static override async createDialog(
		data: { folder?: string } = {},
		options: Partial<FormApplicationOptions> = {}
	): Promise<any | undefined> {
		const original = game.system.documentTypes.Item
		game.system.documentTypes.Item = original.filter(
			(itemType: string) => ![ItemType.Condition].includes(itemType as any)
		)
		options = { ...options, classes: [...(options.classes ?? []), "dialog-item-create"] }
		const newItem = super.createDialog(data, options) as Promise<BaseItemGURPS | undefined>
		game.system.documentTypes.Item = original
		return newItem
	}

	static override async updateDocuments(
		updates: any[],
		context: DocumentModificationContext & { options: any }
	): Promise<any[]> {
		if (!(context.parent instanceof Item)) return super.updateDocuments(updates, context)
		return context.parent.updateEmbeddedDocuments("Item", updates, context.options)
	}

	static override getDefaultArtwork(itemData: ItemData): { img: string } {
		let type = itemData.type.replace("_container", "")
		if (type === ItemType.Technique) type = ItemType.Skill
		else if (type === ItemType.RitualMagicSpell) type = ItemType.Spell
		else if (type === ItemType.Equipment) type = "equipment"
		else if (type === ItemType.LegacyEquipment) type = "legacy_equipment"
		return { img: `systems/${SYSTEM_NAME}/assets/icons/${type}.svg` }
	}

	get container(): Actor | ContainerGURPS | null {
		if (!this.actor && !this.pack) return null
		const id = this.getFlag(SYSTEM_NAME, ItemFlags.Container) as string | null
		if (id === null) return this.actor ?? this.compendium
		if (this.actor) return (this.actor?.items.get(id) as ContainerGURPS) ?? null
		if (this.compendium) return (fromUuidSync(`Compendium.${this.pack}.Item.${id}`) as ContainerGURPS) ?? null
		return null
	}

	get parents(): Array<any> {
		if (!this.container && !this.compendium) return []
		const grandparents = this.container instanceof BaseItemGURPS ? this.container.parents : []
		if (!this.container) return [this.compendium, ...grandparents]
		return [this.container, ...grandparents]
	}

	exportSystemData(_keepOther: boolean): any {
		return {}
	}

	// get parentCount(): number {
	// 	let i = 0
	// 	let p: any = this.container
	// 	while (p) {
	// 		i++
	// 		p = p.container
	// 	}
	// 	return i
	// }

	prepareData(): void {
		super.prepareData()
	}
}

interface BaseItemGURPS extends Item {
	system: any
	_id: string
	_source: BaseItemSourceGURPS
}

export { BaseItemGURPS }