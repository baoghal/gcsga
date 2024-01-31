import { ActorSheetGURPS } from "@actor/base/sheet.ts"
import { CharacterGURPS } from "./document.ts"
import { CharacterSheetConfig } from "./config_sheet.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { ItemSourceGURPS } from "@item/data/index.ts"
import { ActorFlags } from "@actor/base/data.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { AttributeObj, ThresholdOp } from "@sytem/attribute/data.ts"
import { ResourceTrackerObj } from "@sytem/resource_tracker/data.ts"
import { PDF } from "@module/pdf/index.ts"
import {
	BaseWeaponGURPS,
	ConditionGURPS,
	ContainerGURPS,
	EquipmentContainerGURPS,
	EquipmentGURPS,
	ItemGCS,
	MeleeWeaponGURPS,
	RangedWeaponGURPS,
	RitualMagicSpellGURPS,
	SkillGURPS,
	SpellGURPS,
	TechniqueGURPS,
	TraitContainerGURPS,
	TraitGURPS,
} from "@item"
import { Length, LocalizeGURPS, WeaponResolver, Weight, WeightUnits, dom, evaluateToNumber, newUUID } from "@util"
import { ItemType } from "@item/types.ts"
import { ItemFlags } from "@item/data.ts"
import EmbeddedCollection from "types/foundry/common/abstract/embedded-collection.js"
import { RollType, SYSTEM_NAME, gid } from "@module/data/misc.ts"
import { PointRecordSheet } from "./points_sheet.ts"
import { RollGURPS } from "@module/roll/index.ts"
import { DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"
import { SheetSettings, sheetSettingsFor } from "@module/data/sheet_settings.ts"
import { attribute } from "@util/enum/attribute.ts"
import { Attribute } from "@sytem/attribute/index.ts"
import { CharacterMove, Encumbrance } from "./data.ts"
import { ConditionalModifier } from "@module/conditional_modifier.ts"
import { ResourceTracker } from "@sytem/resource_tracker/object.ts"
import { MoveType } from "@sytem/move_type/object.ts"
import { HitLocation } from "./hit_location.ts"
import { htmlQuery } from "@util/dom.ts"
import { ConditionID, ManeuverID, Posture, Postures } from "@item/condition/data.ts"

class CharacterSheetGURPS<TActor extends CharacterGURPS = CharacterGURPS> extends ActorSheetGURPS<TActor> {
	config: CharacterSheetConfig | null = null

	skillDefaultsOpen = false

	searchValue = ""

	noPrepare = false

	static override get defaultOptions(): ActorSheetOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: super.defaultOptions.classes.concat(["character"]),
			width: 800,
			height: 800,
			tabs: [{ navSelector: ".tabs-navigation", contentSelector: ".tabs-content", initial: "lifting" }],
			dragDrop: [{ dragSelector: ".item-list .item:not(.placeholder)", dropSelector: null }],
		})
	}

	override get template(): string {
		if (!game.user.isGM && this.actor.limited)
			return `/systems/${SYSTEM_NAME}/templates/actor/character/sheet-limited.hbs`
		return `/systems/${SYSTEM_NAME}/templates/actor/character/sheet.hbs`
	}

	protected override _onDrop(event: DragEvent): Promise<boolean | void> {
		const sheet = $(this.element)
		sheet.find(".item-list.dragsection").removeClass("dragsection")
		sheet.find(".item-list.dragindirect").removeClass("dragindirect")
		return super._onDrop(event)
	}

	protected override async _onDropItem(
		event: DragEvent,
		data: DropCanvasData<"Item", ItemGURPS>,
	): Promise<ItemGURPS[]> {
		const top = Boolean($(".border-top").length)
		const inContainer = Boolean($(".border-in").length)
		const other = [...$(event.target!), ...$(event.target!).parents()]
			.map(e => (e as unknown as HTMLElement).id)
			.some(e => e === "other-equipment")

		$(".border-bottom").removeClass("border-bottom")
		$(".border-top").removeClass("border-top")
		$(".border-in").removeClass("border-in")

		if (!this.actor.isOwner) return []

		const importData = {
			type: data.type,
			uuid: data.uuid,
		}
		const item = (await Item.implementation.fromDropData(importData)) as ItemGURPS
		if (!item) return []
		const itemData = item.toObject()
		let result: ItemGURPS[] = []

		// Handle item sorting within the same Actor
		if (this.actor.uuid === item.actor?.uuid) {
			result = await this._onSortItem(event, itemData, { top, inContainer, other })
		} else {
			result = await this._onDropNewItem(event, item, { top, inContainer, other })
		}

		const sheet = $(this.element)
		sheet.find(".item-list.dragsection").removeClass("dragsection")
		sheet.find(".item-list.dragindirect").removeClass("dragindirect")
		return result
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		// Edit total points when unspent points are edited

		if (Object.keys(formData).includes("actor.unspentPoints")) {
			formData["system.total_points"] = (formData["actor.unspentPoints"] as number) + this.actor.spentPoints
			delete formData["actor.unspentPoints"]
		}

		if (formData.thrust || formData.swing) {
			const autoDamage = {
				active: this.actor.flags[SYSTEM_NAME][ActorFlags.AutoDamage]?.active ?? false,
				thrust: new DiceGURPS(formData.thrust as string),
				swing: new DiceGURPS(formData.swing as string),
			}
			delete formData.thrust
			delete formData.swing
			formData[`flags.${SYSTEM_NAME}.${ActorFlags.AutoDamage}`] = autoDamage
		}

		// Set values inside system.attributes array, and amend written values based on input
		for (const i of Object.keys(formData)) {
			if (i.startsWith("attributes.")) {
				const attributes: AttributeObj[] =
					(formData["system.attributes"] as AttributeObj[]) ?? fu.duplicate(this.actor.system.attributes)
				const id = i.split(".")[1]
				const att = this.actor.attributes.get(id)
				if (att) {
					if (i.endsWith(".adj")) (formData[i] as number) -= att.max - att.adj
					if (i.endsWith(".damage")) (formData[i] as number) = Math.max(att.max - (formData[i] as number), 0)
				}
				const key = i.replace(`attributes.${id}.`, "")
				const index = attributes.findIndex(e => e.attr_id === id)
				fu.setProperty(attributes[index], key, formData[i])
				formData["system.attributes"] = attributes
				delete formData[i]
			}
			if (i.startsWith("resource_trackers.")) {
				const resource_trackers: ResourceTrackerObj[] =
					(formData["system.resource_trackers"] as ResourceTrackerObj[]) ??
					fu.duplicate(this.actor.system.resource_trackers)
				const id = i.split(".")[1]
				const tracker = this.actor.resourceTrackers.get(id)
				if (tracker) {
					let damage = tracker.max - Number(formData[i])
					if (tracker.tracker_def.isMaxEnforced) damage = Math.max(damage, 0)
					if (tracker.tracker_def.isMinEnforced) damage = Math.min(damage, tracker.max - tracker.min)
					if (i.endsWith(".damage")) (formData[i] as number) = damage
				}
				const key = i.replace(`resource_trackers.${id}.`, "")
				const index = resource_trackers.findIndex(e => e.tracker_id === id)
				fu.setProperty(resource_trackers[index], key, formData[i])
				formData["system.resource_trackers"] = resource_trackers
				delete formData[i]
			}
		}
		return super._updateObject(event, formData)
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		if (this.actor.editing) html.find(".rollable").addClass("noroll")

		html.find("input").on("change", event => this._resizeInput(event))
		html.find(".dropdown-toggle").on("click", event => this._onCollapseToggle(event))
		html.find(".ref").on("click", event => PDF.handle(event))
		html.find(".item").on("dblclick", event => this._openItemSheet(event))
		html.find(".equipped").on("click", event => this._onEquippedToggle(event))
		html.find(".rollable").on("mouseover", event => this._onRollableHover(event, true))
		html.find(".rollable").on("mouseout", event => this._onRollableHover(event, false))
		html.find(":not(.disabled) > > .rollable").on("click", event => this._onClickRoll(event))
		html.find(":not(.disabled) > > .rollable").on("contextmenu", event => this._onClickRoll(event))

		// Maneuver / Posture Selection
		html.find(".move-select").on("change", event => this._onMoveChange(event))

		// Hover Over
		// html.find(".item").on("dragover", event => this._onDragItem(event))
		// html.on("dragover", event => this._onDragItem(event))
		html[0].addEventListener("dragover", event => this._onDragItem(event))

		// Points Record
		html.find(".edit-points").on("click", event => this._openPointsRecord(event))

		// Manual Damage
		html.find(".damage-toggle").on("click", event => this._toggleAutoDamage(event))

		// Manual Attribute Threshold
		html.find(".threshold-toggle").on("click", event => this._toggleAutoThreshold(event))
		html.find(".threshold-select").on("change", event => this._onThresholdChange(event))

		// Manual Encumbrance
		html.find(".enc-toggle").on("click", event => this._toggleAutoEncumbrance(event))
		html.find(".encumbrance-marker.manual").on("click", event => this._setEncumbrance(event))

		// Context Menus
		new ContextMenu(html, ".item-list .item", [], { onOpen: this._onItemContext.bind(this) })
		new ContextMenu(html, ".item-list .header", [], { onOpen: this._onItemHeaderContext.bind(this) })
	}

	async _onThresholdChange(event: JQuery.ChangeEvent): Promise<TActor> {
		const name = event.target.dataset.name
		const autoThreshold = this.actor.flags[SYSTEM_NAME][ActorFlags.AutoThreshold]

		autoThreshold.manual[name] = this.actor
			.poolAttributes(false)
			.get(name)!
			.attribute_def.thresholds!.find(e => e.state === event.target.value)!

		return this.actor.setFlag(SYSTEM_NAME, ActorFlags.AutoThreshold, autoThreshold)
	}

	async _onMoveChange(event: JQuery.ChangeEvent): Promise<TActor | ConditionGURPS | null> {
		event.preventDefault()
		event.stopPropagation()
		const type = event.target.dataset.name
		switch (type) {
			case "maneuver":
				return this.actor.changeManeuver(event.target.value)
			case "posture":
				return this.actor.changePosture(event.target.value)
			default:
				return this.actor.setFlag(SYSTEM_NAME, ActorFlags.MoveType, event.target.value)
		}
	}

	_addPoolContextMenu(element: HTMLElement): void {
		const id = $(element).data("id")
		const attribute = this.actor.attributes.get(id)
		if (!attribute) return
		attribute.apply_ops ??= true
		const apply_ops = attribute.apply_ops
		ContextMenu.create(this, $(element), "*", [
			{
				name: "Apply Threshold Modifiers",
				icon: attribute.apply_ops ? "<i class='gcs-checkmark'></i>" : "",
				callback: _event => {
					const update: Record<string, unknown> = {}
					update[`attributes.${id}.apply_ops`] = !apply_ops
					return this._updateObject(null as unknown as Event, update)
				},
			},
		])
	}

	_onItemHeaderContext(element: HTMLElement): void {
		const type = $(element).parent(".item-list")[0].id
		if (!type) return
		ui.context!.menuItems = this._getHeaderContextOptions(type)
	}

	private _getHeaderContextOptions(type: string): ContextMenuEntry[] {
		switch (type) {
			case "traits":
				return [
					{
						name: LocalizeGURPS.translations.gurps.context.new_trait,
						icon: "<i class='gcs-trait'></i>",
						callback: () => this._newItem(ItemType.Trait),
					},
					{
						name: LocalizeGURPS.translations.gurps.context.new_trait_container,
						icon: "<i class='gcs-trait'></i>",
						callback: () => this._newItem(ItemType.TraitContainer),
					},
					{
						name: LocalizeGURPS.translations.gurps.context.new_natural_attacks,
						icon: "<i class='gcs-melee-weapon'></i>",
						callback: () => this._newNaturalAttacks(),
					},
				]
			case "skills":
				return [
					{
						name: LocalizeGURPS.translations.gurps.context.new_skill,
						icon: "<i class='gcs-skill'></i>",
						callback: () => this._newItem(ItemType.Skill),
					},
					{
						name: LocalizeGURPS.translations.gurps.context.new_skill_container,
						icon: "<i class='gcs-skill'></i>",
						callback: () => this._newItem(ItemType.SkillContainer),
					},
					{
						name: LocalizeGURPS.translations.gurps.context.new_technique,
						icon: "<i class='gcs-skill'></i>",
						callback: () => this._newItem(ItemType.Technique),
					},
				]
			case "spells":
				return [
					{
						name: LocalizeGURPS.translations.gurps.context.new_spell,
						icon: "<i class='gcs-spell'></i>",
						callback: () => this._newItem(ItemType.Spell),
					},
					{
						name: LocalizeGURPS.translations.gurps.context.new_spell_container,
						icon: "<i class='gcs-spell'></i>",
						callback: () => this._newItem(ItemType.SpellContainer),
					},
					{
						name: LocalizeGURPS.translations.gurps.context.new_ritual_magic_spell,
						icon: "<i class='gcs-spell'></i>",
						callback: () => this._newItem(ItemType.RitualMagicSpell),
					},
				]
			case "equipment":
				return [
					{
						name: LocalizeGURPS.translations.gurps.context.new_carried_equipment,
						icon: "<i class='gcs-equipment'></i>",
						callback: () => this._newItem(ItemType.Equipment),
					},
					{
						name: LocalizeGURPS.translations.gurps.context.new_carried_equipment_container,
						icon: "<i class='gcs-equipment'></i>",
						callback: () => this._newItem(ItemType.EquipmentContainer),
					},
				]
			case "other-equipment":
				return [
					{
						name: LocalizeGURPS.translations.gurps.context.new_other_equipment,
						icon: "<i class='gcs-equipment'></i>",
						callback: () => this._newItem(ItemType.Equipment, true),
					},
					{
						name: LocalizeGURPS.translations.gurps.context.new_other_equipment_container,
						icon: "<i class='gcs-equipment'></i>",
						callback: () => this._newItem(ItemType.EquipmentContainer, true),
					},
				]
			case "notes":
				return [
					{
						name: LocalizeGURPS.translations.gurps.context.new_note,
						icon: "<i class='gcs-note'></i>",
						callback: () => this._newItem(ItemType.Note),
					},
					{
						name: LocalizeGURPS.translations.gurps.context.new_note_container,
						icon: "<i class='gcs-note'></i>",
						callback: () => this._newItem(ItemType.NoteContainer),
					},
				]
			default:
				return []
		}
	}

	private async _newItem(type: ItemType, other = false) {
		const itemData: ItemSourceGURPS = {
			type,
			name: LocalizeGURPS.translations.TYPES.Item[type],
			system: { id: newUUID() },
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: null,
				},
			},
		}
		if (other) itemData.system.other = true
		await this.actor.createEmbeddedDocuments("Item", [itemData], {
			temporary: false,
			renderSheet: true,
			substitutions: false,
		})
	}

	private async _newNaturalAttacks() {
		const itemName = LocalizeGURPS.translations.gurps.item.natural_attacks
		const itemData = {
			type: ItemType.Trait,
			name: itemName,
			system: {
				reference: "B271",
			},
			flags: {
				[SYSTEM_NAME]: {
					contentsData: [
						{
							type: ItemType.MeleeWeapon,
							name: "Bite",
							_id: fu.randomID(),
							system: {
								usage: "Bite",
								reach: "C",
								parry: "No",
								block: "No",
								strength: "",
								damage: {
									type: "cr",
									st: "thr",
									base: "-1",
								},
								defaults: [{ type: "dx" }, { type: "skill", name: "Brawling" }],
							},
						},
						{
							type: ItemType.MeleeWeapon,
							name: "Punch",
							_id: fu.randomID(),
							system: {
								usage: "Punch",
								reach: "C",
								parry: "0",
								strength: "",
								damage: {
									type: "cr",
									st: "thr",
									base: "-1",
								},
								defaults: [
									{ type: "dx" },
									{ type: "skill", name: "Boxing" },
									{ type: "skill", name: "Brawling" },
									{ type: "skill", name: "Karate" },
								],
							},
						},
						{
							type: ItemType.MeleeWeapon,
							name: "Kick",
							_id: fu.randomID(),
							system: {
								usage: "Kick",
								reach: "C,1",
								parry: "No",
								strength: "",
								damage: {
									type: "cr",
									st: "thr",
								},
								defaults: [
									{ type: "dx", modifier: -2 },
									{ type: "skill", name: "Brawling", modifier: -2 },
									{ type: "skill", name: "Kicking" },
									{ type: "skill", name: "Karate", modifier: -2 },
								],
							},
						},
					],
				},
			},
		}
		const item = (
			await this.actor.createEmbeddedDocuments("Item", [itemData], { temporary: false })
		)[0] as ItemGURPS
		return item.sheet.render(true)
	}

	private _onItemContext(element: HTMLElement) {
		const item = this.actor.items.get(element.dataset.itemId ?? "") as ItemGURPS<TActor>
		if (!item) return
		ui.context!.menuItems = this._getItemContextOptions(item)
	}

	private _getItemContextOptions(item: ItemGURPS): ContextMenuEntry[] {
		const menuItems = []
		menuItems.push({
			name: LocalizeGURPS.translations.gurps.context.duplicate,
			icon: "",
			callback: async () => {
				const itemData = {
					type: item.type,
					name: item.name,
					system: item.system,
					flags: item.flags,
					sort: (item.sort ?? 0) + 1,
				}
				if (!(item.container instanceof CompendiumCollection))
					await item.container?.createEmbeddedDocuments("Item", [itemData])
			},
		})
		menuItems.push({
			name: LocalizeGURPS.translations.gurps.context.delete,
			icon: "<i class='gcs-trash'></i>",
			callback: () => {
				return this.actor.deleteEmbeddedDocuments("Item", [item.id!])
			},
		})
		if (item instanceof TraitGURPS || item instanceof TraitContainerGURPS) {
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.toggle_state,
				icon: "<i class='fas fa-sliders-simple'></i>",
				callback: () => {
					return item.update({ "system.disabled": item.enabled })
				},
			})
		}
		if (item instanceof EquipmentGURPS || item instanceof EquipmentContainerGURPS) {
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.toggle_state,
				icon: "<i class='fas fa-sliders-simple'></i>",
				callback: () => {
					return item.update({ "system.equipped": !item.equipped })
				},
			})
			if (item.other)
				menuItems.push({
					name: LocalizeGURPS.translations.gurps.context.move_to_carried,
					icon: "<i class='fas fa-arrows-cross'></i>",
					callback: () =>
						(item as Item).setFlag(
							SYSTEM_NAME,
							ItemFlags.Other,
							!item.getFlag(SYSTEM_NAME, ItemFlags.Other),
						),
				})
			else
				menuItems.push({
					name: LocalizeGURPS.translations.gurps.context.move_to_other,
					icon: "<i class='fas fa-arrows-cross'></i>",
					callback: () =>
						(item as Item).setFlag(
							SYSTEM_NAME,
							ItemFlags.Other,
							!item.getFlag(SYSTEM_NAME, ItemFlags.Other),
						),
				})
		}
		if (item instanceof TraitGURPS && item.isLeveled) {
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.increment,
				icon: "<i class='fas fa-up'></i>",
				callback: () => {
					let level = item.system.levels + 1
					if (level % 1) level = Math.floor(level)
					return item.update({ "system.levels": level })
				},
			})
			if (item.levels > 0)
				menuItems.push({
					name: LocalizeGURPS.translations.gurps.context.decrement,
					icon: "<i class='fas fa-down'></i>",
					callback: () => {
						let level = item.system.levels - 1
						if (level % 1) level = Math.ceil(level)
						return item.update({ "system.levels": level })
					},
				})
		}
		if (
			item instanceof SkillGURPS ||
			item instanceof TechniqueGURPS ||
			item instanceof SpellGURPS ||
			item instanceof RitualMagicSpellGURPS
		) {
			const sk = item as SkillGURPS
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.increment,
				icon: "<i class='fas fa-up'></i>",
				callback: () => {
					return sk.update({ "system.points": sk.system.points + 1 })
				},
			})
			if (sk.points > 0)
				menuItems.push({
					name: LocalizeGURPS.translations.gurps.context.decrement,
					icon: "<i class='fas fa-down'></i>",
					callback: () => {
						return sk.update({ "system.points": sk.system.points - 1 })
					},
				})
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.increase_level,
				icon: "<i class='fas fa-up-long'></i>",
				callback: () => {
					return sk.incrementSkillLevel()
				},
			})
			if (sk.points > 0)
				menuItems.push({
					name: LocalizeGURPS.translations.gurps.context.decrease_level,
					icon: "<i class='fas fa-down-long'></i>",
					callback: () => {
						return sk.decrementSkillLevel()
					},
				})
		}
		if (item instanceof EquipmentGURPS || item instanceof EquipmentContainerGURPS) {
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.increment,
				icon: "<i class='fas fa-up'></i>",
				callback: () => {
					return item.update({ "system.quantity": item.system.quantity + 1 })
				},
			})
			if (item.system.quantity > 0)
				menuItems.push({
					name: LocalizeGURPS.translations.gurps.context.decrement,
					icon: "<i class='fas fa-down'></i>",
					callback: () => {
						return item.update({ "system.quantity": item.system.quantity - 1 })
					},
				})
		}
		if (
			item instanceof EquipmentGURPS ||
			item instanceof EquipmentContainerGURPS ||
			((item instanceof SkillGURPS || item instanceof SpellGURPS || item instanceof RitualMagicSpellGURPS) &&
				item.system.tech_level_required)
		) {
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.increase_tech_level,
				icon: "<i class='fas fa-gear'></i><i class='fas fa-up'></i>",
				callback: () => {
					let tl = item.system.tech_level
					const tlNumber = tl.match(/\d+/)?.[0]
					if (!tlNumber) return
					const newTLNumber = parseInt(tlNumber) + 1
					tl = tl.replace(tlNumber, `${newTLNumber} `)
					return item.update({ "system.tech_level": tl })
				},
			})
			if (parseInt(item.system.tech_level) > 0)
				menuItems.push({
					name: LocalizeGURPS.translations.gurps.context.decrease_tech_level,
					icon: "<i class='fas fa-gear'></i><i class='fas fa-down'></i>",
					callback: () => {
						let tl = item.system.tech_level
						const tlNumber = tl.match(/\d+/)?.[0]
						if (!tlNumber) return
						const newTLNumber = parseInt(tlNumber) - 1
						tl = tl.replace(tlNumber, `${newTLNumber} `)
						return item.update({ "system.tech_level": tl })
					},
				})
		}
		if (item instanceof TraitGURPS || item instanceof EquipmentGURPS)
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.convert_to_container,
				icon: "",
				callback: async () => {
					const type = item.type === ItemType.Trait ? ItemType.TraitContainer : ItemType.EquipmentContainer
					const itemData = {
						type: type,
						name: item.name,
						system: item.system,
						flags: item.flags,
						sort: (item.sort ?? 0) + 1,
						_id: item._id,
					}
					await item.delete()
					if (!(item.container instanceof CompendiumCollection))
						await item.container?.createEmbeddedDocuments("Item", [itemData], { keepId: true })
				},
			})
		if (
			(item instanceof TraitContainerGURPS || item instanceof EquipmentContainerGURPS) &&
			item.children.size === 0
		)
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.convert_to_non_container,
				icon: "",
				callback: async () => {
					const type = item.type === ItemType.TraitContainer ? ItemType.Trait : ItemType.Equipment
					const itemData = {
						type: type,
						name: item.name,
						system: item.system,
						flags: item.flags,
						sort: (item.sort ?? 0) + 1,
						_id: item._id,
					}
					await item.delete()
					if (!(item.container instanceof CompendiumCollection))
						await item.container?.createEmbeddedDocuments("Item", [itemData], { keepId: true })
				},
			})
		if (item instanceof BaseWeaponGURPS) {
			menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.toggle_ready,
				icon: "",
				callback: () => {
					;(item as Item).setFlag(
						SYSTEM_NAME,
						ItemFlags.Unready,
						!item.getFlag(SYSTEM_NAME, ItemFlags.Unready),
					)
				},
			})
		}
		return menuItems
	}

	protected _resizeInput(event: JQuery.ChangeEvent): void {
		event.preventDefault()
		const field = event.currentTarget
		$(field).css("min-width", `${field.value.length} ch`)
	}

	protected _onCollapseToggle(event: JQuery.ClickEvent): void {
		event.preventDefault()
		const id = $(event.currentTarget).data("item-id")
		const open = !!$(event.currentTarget).attr("class")?.includes("closed")
		const item = this.actor.items.get(id) as ItemGURPS<TActor>
		item?.update({ _id: id, "system.open": open }, { noPrepare: true })
	}

	protected async _openItemSheet(event: JQuery.DoubleClickEvent): Promise<void> {
		event.preventDefault()
		const id: string = $(event.currentTarget).data("item-id")
		const item = this.actor.items.get(id)
		item?.sheet?.render(true)
	}

	protected async _openPointsRecord(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		new PointRecordSheet(this.document as CharacterGURPS, {
			top: this.position.top! + 40,
			left: ((this.position.left ?? 0) - (Number(DocumentSheet.defaultOptions.width) ?? 0)) / 2,
		}).render(true)
	}

	_toggleAutoThreshold(event: JQuery.ClickEvent): Promise<TActor> {
		event.preventDefault()

		const autoThreshold = this.actor.flags[SYSTEM_NAME][ActorFlags.AutoThreshold]

		autoThreshold.active = !autoThreshold.active

		if (!autoThreshold.active)
			this.actor.poolAttributes(false).forEach(a => {
				autoThreshold.manual[a.id] = a.currentThreshold
			})

		return this.actor.setFlag(SYSTEM_NAME, ActorFlags.AutoThreshold, autoThreshold)
	}

	_toggleAutoDamage(event: JQuery.ClickEvent): Promise<TActor> {
		event.preventDefault()
		const autoDamage = this.actor.flags[SYSTEM_NAME][ActorFlags.AutoDamage]
		autoDamage.active = !autoDamage.active
		autoDamage.thrust = this.actor.thrust
		autoDamage.swing = this.actor.swing
		return this.actor.setFlag(SYSTEM_NAME, ActorFlags.AutoDamage, autoDamage)
	}

	_toggleAutoEncumbrance(event: JQuery.ClickEvent): Promise<TActor> {
		event.preventDefault()
		const autoEncumbrance = this.actor.flags[SYSTEM_NAME][ActorFlags.AutoEncumbrance]
		autoEncumbrance.active = !autoEncumbrance.active
		autoEncumbrance.manual = -1
		const carried = this.actor.weightCarried(false)
		for (const e of this.actor.allEncumbrance) {
			if (carried <= e.maximum_carry) {
				autoEncumbrance.manual = e.level
				break
			}
		}
		if (autoEncumbrance.manual === -1)
			autoEncumbrance.manual = this.actor.allEncumbrance[this.actor.allEncumbrance.length - 1].level
		return this.actor.setFlag(SYSTEM_NAME, ActorFlags.AutoEncumbrance, autoEncumbrance)
	}

	_setEncumbrance(event: JQuery.ClickEvent): Promise<TActor> {
		event.preventDefault()
		const level = Number($(event.currentTarget).data("level"))
		const autoEncumbrance = this.actor.flags[SYSTEM_NAME][ActorFlags.AutoEncumbrance]
		autoEncumbrance.manual = level
		return this.actor.setFlag(SYSTEM_NAME, ActorFlags.AutoEncumbrance, autoEncumbrance)
	}

	protected _openDefaultLookup(event: JQuery.ClickEvent): void {
		event.preventDefault()
		// const defaultSkills = CONFIG.GURPS.skillDefaults
		// const list = fSearch(defaultSkills, "serv", {
		// 	includeMatches: true,
		// 	includeScore: true,
		// 	keys: ["name", "specialization", "tags"],
		// }).map(e => e.item)
		this.skillDefaultsOpen = true
		this.render()
		const searchbar = this._element?.find("input.defaults")
		searchbar?.trigger("focus")
	}

	protected async _onEquippedToggle(event: JQuery.ClickEvent): Promise<Item<TActor> | undefined> {
		event.preventDefault()
		const id = $(event.currentTarget).data("item-id")
		const item = this.actor.items.get(id)
		if (item)
			return item?.update({
				"system.equipped": !(item as EquipmentGURPS<TActor>).equipped,
			})
		return
	}

	protected async _onRollableHover(
		event: JQuery.MouseOverEvent | JQuery.MouseOutEvent,
		hover: boolean,
	): Promise<void> {
		event.preventDefault()
		if (this.actor.editing) {
			event.currentTarget.classList.remove("hover")
			return
		}
		if (hover) event.currentTarget.classList.add("hover")
		else event.currentTarget.classList.remove("hover")
	}

	protected async _onClickRoll(event: JQuery.ClickEvent | JQuery.ContextMenuEvent): Promise<void> {
		event.preventDefault()
		if (this.actor.editing) return
		const type: RollType = $(event.currentTarget).data("type")
		const data: Record<string, unknown> = { type: type, hidden: event.ctrlKey }
		if (type === RollType.Attribute) {
			const id = $(event.currentTarget).data("id")
			if (id === gid.Dodge) data.attribute = this.actor.dodgeAttribute
			else data.attribute = this.actor.attributes.get(id)
		}
		if (
			[
				RollType.Damage,
				RollType.Attack,
				RollType.Parry,
				RollType.Block,
				RollType.Skill,
				RollType.SkillRelative,
				RollType.Spell,
				RollType.SpellRelative,
				RollType.ControlRoll,
			].includes(type)
		) {
			const id = $(event.currentTarget).data("item-id")
			if ([gid.Thrust, gid.Swing].includes(id)) {
				const attack_id = id as gid.Thrust | gid.Swing
				data.item = {
					itemName: LocalizeGURPS.translations.gurps.character[attack_id],
					uuid: attack_id,
					fastResolvedDamage: this.actor[attack_id].string,
				}
			} else data.item = this.actor.items.get(id)
		}
		if (type === RollType.Modifier) {
			data.modifier = evaluateToNumber(event.currentTarget.dataset.modifier, this.actor)
			data.comment = event.currentTarget.dataset.comment
			if (event.type === "contextmenu") data.modifier = -(data.modifier as number)
		}
		if ([RollType.Attack, RollType.Parry].includes(type))
			(data.item as WeaponResolver<ItemType.MeleeWeapon>).checkUnready(type)
		return RollGURPS.handleRoll(game.user, this.actor, data)
	}

	private _getTargetTableFromItemType(event: JQuery.DragOverEvent | DragEvent, type: ItemType): JQuery<HTMLElement> {
		const sheet = $(this.element)
		let currentTable = $(event.target).closest(".item-list")
		if ([ItemType.Equipment, ItemType.EquipmentContainer].includes(type)) {
			if ($(event.target).closest(".item-list#other-equipment").length > 0)
				currentTable = $(event.target).closest(".item-list#other-equipment")
			else currentTable = sheet.find(".item-list#equipment")
		} else {
			const idLookup = (function () {
				switch (type) {
					case ItemType.Trait:
					case ItemType.TraitContainer:
						return "traits"
					case ItemType.Skill:
					case ItemType.Technique:
					case ItemType.SkillContainer:
						return "skills"
					case ItemType.Spell:
					case ItemType.RitualMagicSpell:
					case ItemType.SpellContainer:
						return "spells"
					case ItemType.Note:
					case ItemType.NoteContainer:
						return "notes"
					case ItemType.Effect:
					case ItemType.Condition:
						return "effects"
					default:
						return "invalid"
				}
			})()
			currentTable = sheet.find(`.item - list#${idLookup} `)
		}
		return currentTable
	}

	protected async _onDropNewItem(
		event: DragEvent,
		sourceItem: ItemGURPS,
		options: { top: boolean; inContainer: boolean; other: boolean } = {
			top: false,
			inContainer: false,
			other: false,
		},
	): Promise<ItemGURPS[]> {
		// The table element where the dragged item was dropped
		let targetTableEl = [...$(event.target!).filter(".item-list"), ...$(event.target!).parents(".item-list")][0]
		if (!targetTableEl) targetTableEl = this._getTargetTableFromItemType(event, sourceItem.type as ItemType)[0]
		if (!targetTableEl) return []

		// The item element onto which the dragged item was dropped
		const targetItemEl = $(event.target!).closest(".desc[data-item-id]")
		// This should only happen when switching between carried and other equipment
		if (!targetItemEl)
			return this.actor.createNestedEmbeddedDocuments([sourceItem], { id: null, other: options.other })

		let targetItem = this.actor.items.get(targetItemEl.data("item-id")) as ItemGURPS<TActor> | null
		let targetItemContainer: Actor | ContainerGURPS | CompendiumCollection | null | undefined =
			targetItem?.container
		if (targetItemContainer instanceof CompendiumCollection) return []
		// Dropping item into a container
		if (options.inContainer && targetItem instanceof ContainerGURPS) {
			targetItemContainer = targetItem
			targetItem = (targetItemContainer.children.contents[0] as ItemGURPS<TActor>) ?? null
		}
		if (!targetItem) return []

		const newItems = await this.actor.createNestedEmbeddedDocuments([sourceItem], {
			id: targetItemContainer instanceof ContainerGURPS ? targetItemContainer?.id : null,
			other: options.other,
		})

		const siblingItems = ((targetItemContainer?.items as Collection<ItemGURPS>) ?? ([] as unknown[])).filter(
			(e: ItemGURPS) => e.id !== sourceItem.id && sourceItem.sameSection(e),
		)

		const sortUpdates = SortingHelpers.performIntegerSort(newItems[0], {
			target: targetItem,
			siblings: siblingItems,
			sortBefore: options.top,
		})

		const updateData = sortUpdates.map(u => {
			return { ...u.update, _id: u.target._id } as { _id: string; [key: string]: unknown }
		})
		await this.actor?.updateEmbeddedDocuments("Item", updateData)
		return newItems
	}

	protected override async _onDragStart(event: DragEvent): Promise<void> {
		const list = event.currentTarget
		// If (event.target.classList.contains("contents-link")) return;

		// let itemData: any
		let dragData: { type: string; [key: string]: unknown } = { type: "invalid" }

		// Owned Items
		if ($(list as HTMLElement).data("item-id")) {
			const id = $(list as HTMLElement).data("item-id")
			const item = this.actor.items.get(id)
			if (!item) return undefined
			dragData = {
				type: DropDataType.Item,
				uuid: item.uuid,
			}

			// Create custom drag image
			const dragImage = document.createElement("div")
			dragImage.innerHTML = await renderTemplate(`systems / ${SYSTEM_NAME} /templates/actor / drag - image.hbs`, {
				name: `${item?.name} `,
				type: `${item?.type.replace("_container", "").replaceAll("_", "-")} `,
			})
			dragImage.id = "drag-ghost"
			dragImage.setAttribute("data-item", JSON.stringify(item?.toObject()))
			document.body.querySelectorAll("#drag-ghost").forEach(e => e.remove())
			document.body.appendChild(dragImage)
			const height = (document.body.querySelector("#drag-ghost") as HTMLElement).offsetHeight
			event.dataTransfer?.setDragImage(dragImage, 0, height / 2)
		}

		// Active Effect
		if ((list as HTMLElement).dataset.effectId) {
			const effect = this.actor.effects.get((list as HTMLElement).dataset.effectId!)
			if (effect) dragData = effect.toDragData()
		}

		// Set data transfer
		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData))
	}

	protected override _onSortItem(
		event: DragEvent,
		itemData: ItemSourceGURPS,
		options: { top: boolean; inContainer: boolean; other: boolean } = {
			top: false,
			inContainer: false,
			other: false,
		},
	): Promise<ItemGCS[]> {
		const blankPromise: Promise<ItemGCS[]> = new Promise(() => {
			return []
		})

		// Dragged item
		const sourceItem = this.actor.items.get(itemData._id!) as ItemGCS | undefined
		if (!sourceItem) return blankPromise

		// The table element where the dragged item was dropped
		const targetTableEl = [...$(event.target!).filter(".item-list"), ...$(event.target!).parents(".item-list")][0]
		if (!targetTableEl) return blankPromise

		// The item element onto which the dragged item was dropped
		const targetItemEl = $(event.target!).closest(".desc[data-item-id]")
		// This should only happen when switching between carried and other equipment
		if (!targetItemEl) {
			if (![ItemType.Equipment, ItemType.EquipmentContainer].includes(sourceItem.type as ItemType))
				return blankPromise
			if (sourceItem.getFlag(SYSTEM_NAME, ItemFlags.Other) !== options.other)
				return this.actor.updateEmbeddedDocuments("Item", [
					{ _id: sourceItem.id, [`flags.${SYSTEM_NAME}.${ItemFlags.Other} `]: options.other },
				]) as Promise<ItemGCS[]>
		}

		let targetItem = this.actor.items.get(targetItemEl.data("item-id")) as ItemGCS<TActor>
		let targetItemContainer = targetItem?.container as TActor | ContainerGURPS
		// Dropping item into a container
		if (options.inContainer && targetItem instanceof ContainerGURPS) {
			targetItemContainer = targetItem
			targetItem = (targetItemContainer.children.contents[0] as ItemGCS<TActor>) ?? null
		}

		const siblingItems = (targetItemContainer?.items as Collection<ItemGCS>).filter(
			(e: ItemGCS) => e.id !== sourceItem.id && sourceItem.sameSection(e),
		) as ItemGCS[]

		// target item and source item are not in the same table
		if (targetItem && !sourceItem.sameSection(targetItem as ItemGCS<TActor>)) return blankPromise

		// Sort updates sorts all items within the same container
		const sortUpdates = SortingHelpers.performIntegerSort(sourceItem, {
			target: targetItem,
			siblings: siblingItems,
			sortBefore: options.top,
		})

		const updateData = sortUpdates.map(u => {
			return { ...u.update, _id: u.target._id } as { _id: string; [key: string]: unknown }
		})

		// Set container flag if containers are not the same
		if (sourceItem.container !== targetItemContainer)
			updateData[updateData.findIndex(e => e._id === sourceItem._id)][
				`flags.${SYSTEM_NAME}.${ItemFlags.Container} `
			] = targetItemContainer instanceof ContainerGURPS ? targetItemContainer.id : null

		// Set other flag for equipment
		if ([ItemType.Equipment, ItemType.EquipmentContainer].includes(sourceItem.type as ItemType))
			updateData[updateData.findIndex(e => e._id === sourceItem._id)][
				`flags.${SYSTEM_NAME}.${ItemFlags.Other} `
			] = options.other

		return this.actor.updateEmbeddedDocuments("Item", updateData) as Promise<ItemGCS[]>
	}

	protected _onDragItem(event: DragEvent): void {
		const sheet = $(this.element)
		const itemData = $("#drag-ghost").data("item") as ItemSourceGURPS
		if (!itemData) return
		const currentTable = this._getTargetTableFromItemType(event, itemData.type)

		sheet.find(".item-list").each(function () {
			if ($(this) !== currentTable) {
				$(this).removeClass("dragsection")
				$(this).removeClass("dragindirect")
			}
		})

		let direct = false
		if (![event.target, ...dom.parents(event.target as HTMLElement | null, "")].includes(currentTable[0])) {
			currentTable.addClass("dragindirect")
		} else {
			direct = true
		}

		const top = Math.max(
			(currentTable.position().top ?? 0) + (currentTable.children(".header.reference").outerHeight() ?? 0),
			sheet.find(".window-content").position().top,
		)
		currentTable[0].style.setProperty("--top", `${top} px`)
		currentTable[0].style.setProperty("--left", `${currentTable.position().left + 1 ?? 0} px`)
		const height = (function () {
			const tableBottom = (currentTable.position().top ?? 0) + (currentTable.height() ?? 0)
			const contentBottom =
				(sheet.find(".window-content").position().top ?? 0) + (sheet.find(".window-content").height() ?? 0)
			return Math.min(contentBottom - top, tableBottom - top)
		})()
		if (height !== 0) {
			currentTable[0].style.setProperty("--height", `${height} px`)
			currentTable[0].style.setProperty("--width", `${currentTable.width()} px`)
		}

		let element = $(event.target!).closest(".item.desc")
		if (!element.length) element = currentTable.children(".item.desc").last()
		let heightAcross = (event.pageY! - (element.offset()?.top ?? 0)) / element.height()!
		const widthAcross = (event.pageX! - (element.offset()?.left ?? 0)) / element.width()!
		let inContainer = widthAcross > 0.3 && element.hasClass("container")
		if (!direct) {
			element = currentTable.children(".item.desc").last()
			heightAcross = 1
			inContainer = false
		}
		if (heightAcross > 0.5 && element.hasClass("border-bottom")) return
		if (heightAcross < 0.5 && element.hasClass("border-top")) return
		if (inContainer && element.hasClass("border-in")) return

		$(".border-bottom").removeClass("border-bottom")
		$(".border-top").removeClass("border-top")
		$(".border-in").removeClass("border-in")

		const parent = element.parent(".item-list")
		let selection = []
		if (parent.attr("id") === "equipment") {
			selection = [
				...Array.prototype.slice.call(element.prevUntil(".reference")),
				...Array.prototype.slice.call(element.nextUntil(".equipped")),
			]
		} else if (parent.attr("id") === "other-equipment") {
			selection = [
				...Array.prototype.slice.call(element.prevUntil(".reference")),
				...Array.prototype.slice.call(element.nextUntil(".quantity")),
			]
		} else selection = Array.prototype.slice.call(element.nextUntil(".item.desc"))
		selection.unshift(element)
		if (inContainer) {
			for (const e of selection) $(e).addClass("border-in")
		} else if (heightAcross > 0.5) {
			for (const e of selection) $(e).addClass("border-bottom")
		} else {
			for (const e of selection) $(e).addClass("border-top")
		}
	}

	override getData(options?: ActorSheetOptions): CharacterSheetData<TActor> | Promise<CharacterSheetData<TActor>> {
		this.actor.noPrepare = false
		this.actor.prepareData()
		// const data = super.getData(options)
		const [primaryAttributes, secondaryAttributes, poolAttributes] = this._prepareAttributes(this.actor.attributes)
		const resourceTrackers = Array.from(this.actor.resourceTrackers.values())
		const moveTypes = Array.from(this.actor.moveTypes.values())
		const encumbrance = this._prepareEncumbrance()
		const lifting = this._prepareLifts()
		const moveData = this._prepareMoveData()
		const overencumbered = this.actor.allEncumbrance.at(-1)!.maximum_carry! < this.actor!.weightCarried(false)
		const heightUnits = this.actor.settings.default_length_units
		const weightUnits: WeightUnits = this.actor.settings.default_weight_units
		const height = Length.format(Length.fromString(this.actor.profile?.height || ""), heightUnits)
		const weight = Weight.format(Weight.fromString(this.actor.profile?.weight || "", weightUnits), weightUnits)

		this.actor.BodyType.updateRollRanges()

		return {
			...(super.getData() as ActorSheetData<TActor>),
			...this._prepareItems(),
			actor: this.actor,
			data: this.actor.system,
			settings: sheetSettingsFor(this.actor),
			editing: this.actor.editing,
			primaryAttributes,
			hitLocations: this.actor.HitLocations,
			secondaryAttributes,
			poolAttributes,
			resourceTrackers,
			moveTypes,
			encumbrance,
			lifting,
			moveData,
			height,
			weight,
			config: CONFIG.GURPS,
			currentYear: new Date().getFullYear(),
			autoEncumbrance: this.actor.flags[SYSTEM_NAME][ActorFlags.AutoEncumbrance]?.active,
			autoThreshold: this.actor.flags[SYSTEM_NAME][ActorFlags.AutoThreshold]?.active,
			autoDamage: this.actor.flags[SYSTEM_NAME][ActorFlags.AutoDamage]?.active,
			overencumbered,
			skillDefaultsOpen: this.skillDefaultsOpen,
		}
	}

	private _prepareAttributes(attributes: Map<string, Attribute>): [Attribute[], Attribute[], Attribute[]] {
		const primary_attributes: Attribute[] = []
		const secondary_attributes: Attribute[] = []
		const point_pools: Attribute[] = []
		if (attributes)
			attributes.forEach(a => {
				if ([attribute.Type.Pool, attribute.Type.PoolSeparator].includes(a.attribute_def?.type))
					point_pools.push(a)
				else if (a.attribute_def?.isPrimary) primary_attributes.push(a)
				else secondary_attributes.push(a)
			})
		return [primary_attributes, secondary_attributes, point_pools]
	}

	private _prepareEncumbrance() {
		const encumbrance: (Encumbrance & {
			active?: boolean
			carry?: string
			move?: { current: number; effective: number }
			dodge?: { current: number; effective: number }
		})[] = [...this.actor.allEncumbrance]
		const current = this.actor.encumbranceLevel(true).level

		const move = Math.max(0, this.actor.resolveMove(this.actor.moveType))
		const moveOps = this.actor.countThresholdOpMet(ThresholdOp.HalveMove)
		const dodgeOps = this.actor.countThresholdOpMet(ThresholdOp.HalveDodge)
		for (const e of encumbrance) {
			if (e.level === current) e.active = true
			e.carry = Weight.format(e.maximum_carry, this.actor.weightUnits)
			e.move = {
				current: this.actor.move(e, move),
				effective: this.actor.eMove(e, move, moveOps),
			}
			e.dodge = {
				current: this.actor.dodge(e),
				effective: this.actor.eDodge(e, dodgeOps),
			}
		}
		return encumbrance
	}

	private _prepareLifts(): Record<string, string> {
		return this.actor.lifts
	}

	private _prepareMoveData(): CharacterMove {
		let maneuver: ManeuverID | "none" = "none"
		const currentManeuver = this.actor.conditions.find(e => Object.values(ManeuverID).includes(e.cid as ManeuverID))

		if (currentManeuver?.cid) maneuver = currentManeuver.cid as ManeuverID
		let posture: Posture | "standing" = "standing"
		const currentPosture = this.actor.conditions.find(e => Postures.includes(e.cid as ConditionID))
		if (currentPosture) posture = currentPosture.cid as Posture
		const type = this.actor.moveType
		return {
			maneuver,
			posture,
			type,
		}
	}

	// private _addItemChildren(items: any[], item: any): any {
	// 	const children: any[] = []
	// 	for (const i of items.filter(e =>
	//
	// 		!!e.flags[SYSTEM_NAME] &&
	// 		!!e.flags[SYSTEM_NAME][ItemFlags.Container] &&
	// 		e.flags[SYSTEM_NAME][ItemFlags.Container] === item._id
	// 	)) {
	// 		if ([ItemType.MeleeWeapon, ItemType.RangedWeapon].includes(i.type)) continue
	// 		children.push(this._addItemChildren(items, i))
	// 	}
	// 	if (isContainer(item)) item.children = children
	// 	return item
	// }

	private _prepareItems(): {
		traits: ItemGURPS[]
		skills: ItemGURPS[]
		spells: ItemGURPS[]
		carriedEquipment: ItemGURPS[]
		otherEquipment: ItemGURPS[]
		notes: ItemGURPS[]
		conditions: ItemGURPS[]
		melee: MeleeWeaponGURPS[]
		ranged: RangedWeaponGURPS[]
		reactions: ConditionalModifier[]
		conditionalModifiers: ConditionalModifier[]
		carriedWeight: number
		carriedValue: number
		otherValue: number
	} {
		const items = this.object.items as EmbeddedCollection<ItemGURPS<TActor>>
		const processedItems: ItemGURPS[] = []
		for (const item of items.filter(
			e =>
				!e.flags[SYSTEM_NAME] ||
				!e.flags[SYSTEM_NAME][ItemFlags.Container] ||
				e.flags[SYSTEM_NAME][ItemFlags.Container] === null,
		)) {
			processedItems.push(item)
		}

		const [traits, skills, spells, carriedEquipment, otherEquipment, notes, conditions] = processedItems.reduce(
			(arr: ItemGURPS[][], item: ItemGURPS) => {
				if (item.type === ItemType.Trait || item.type === ItemType.TraitContainer) arr[0].push(item)
				else if (
					item.type === ItemType.Skill ||
					item.type === ItemType.Technique ||
					item.type === ItemType.SkillContainer
				)
					arr[1].push(item)
				else if (
					item.type === ItemType.Spell ||
					item.type === ItemType.RitualMagicSpell ||
					item.type === ItemType.SpellContainer
				)
					arr[2].push(item)
				else if (item.type === ItemType.Equipment || item.type === ItemType.EquipmentContainer) {
					if (item.flags[SYSTEM_NAME]![ItemFlags.Other]) arr[4].push(item)
					else arr[3].push(item)
				} else if (item.type === ItemType.Note || item.type === ItemType.NoteContainer) arr[5].push(item)
				else if (item.type === ItemType.Effect) arr[6].push(item)
				return arr
			},
			[[], [], [], [], [], [], []],
		)

		// const melee = items.filter(e => e.type === ItemType.MeleeWeapon && e.system.calc.equipped)
		// const ranged = items.filter(e => e.type === ItemType.RangedWeapon && e.system.calc.equipped)
		const melee = items.filter(e => e instanceof MeleeWeaponGURPS && e.equipped) as MeleeWeaponGURPS<TActor>[]
		const ranged = items.filter(e => e instanceof RangedWeaponGURPS && e.equipped) as RangedWeaponGURPS<TActor>[]
		const reactions: ConditionalModifier[] = this.actor.reactions
		const conditionalModifiers: ConditionalModifier[] = this.actor.conditionalModifiers

		const carriedValue = this.actor.wealthCarried()
		const carriedWeight = this.actor.weightCarried(true)
		const otherValue = this.actor.wealthNotCarried()

		return {
			traits,
			skills,
			spells,
			carriedEquipment,
			otherEquipment,
			notes,
			conditions,
			melee,
			ranged,
			reactions,
			conditionalModifiers,
			carriedValue,
			carriedWeight,
			otherValue,
		}
	}

	// Events
	async _onEditToggle(event: Event): Promise<void> {
		htmlQuery(event.target, "i")?.classList.toggle("fa-unlock fa-lock")
		await this.actor.update({ "system.editing": !this.actor.editing })
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const buttons: ApplicationHeaderButton[] = this.actor.canUserModify(game.user!, "update")
			? [
					{
						label: "",
						class: "edit-toggle",
						icon: `fas fa-${this.actor.editing ? "unlock" : "lock"}`,
						onclick: (event: Event) => this._onEditToggle(event),
					},
					{
						label: "",
						class: "gmenu",
						icon: "gcs-all-seeing-eye",
						onclick: (event: Event) => this._openGMenu(event),
					},
				]
			: []
		const all_buttons = [...buttons, ...super._getHeaderButtons()]
		return all_buttons
	}

	protected async _openGMenu(event: Event): Promise<void> {
		this.config ??= new CharacterSheetConfig(this.object, {
			top: this.position.top! + 40,
			left: ((this.position.left ?? 0) - (Number(DocumentSheet.defaultOptions.width) ?? 0)) / 2,
		})
		this.config.render(true)
	}

	override async close(options?: { force?: boolean }): Promise<void> {
		await this.config?.close(options)
		return super.close(options)
	}
}

interface CharacterSheetData<TActor extends CharacterGURPS> extends ActorSheetData<TActor> {
	actor: TActor
	data: TActor["system"]
	traits: ItemGURPS[]
	skills: ItemGURPS[]
	spells: ItemGURPS[]
	carriedEquipment: ItemGURPS[]
	otherEquipment: ItemGURPS[]
	notes: ItemGURPS[]
	conditions: ItemGURPS[]
	melee: ItemGURPS[]
	ranged: ItemGURPS[]
	reactions: ConditionalModifier[]
	conditionalModifiers: ConditionalModifier[]
	editing: boolean
	carriedWeight: number
	carriedValue: number
	otherValue: number
	config: ConfigGURPS["GURPS"]
	hitLocations: HitLocation[]
	settings: SheetSettings
	primaryAttributes: Attribute[]
	secondaryAttributes: Attribute[]
	poolAttributes: Attribute[]
	resourceTrackers: ResourceTracker[]
	height: string
	weight: string
	moveTypes: MoveType[]
	encumbrance: Encumbrance[]
	lifting: Record<string, string>
	moveData: CharacterMove
	currentYear: number
	overencumbered: boolean
	autoEncumbrance: boolean
	autoThreshold: boolean
	autoDamage: boolean
	skillDefaultsOpen: boolean
}

export { CharacterSheetGURPS }
