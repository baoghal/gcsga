import { SETTINGS, SYSTEM_NAME } from "@module/data/misc.ts"
import { StaticResourceTracker, StaticThresholdComparison, StaticThresholdOperator } from "./data.ts"
import { StaticCharacterGURPS } from "./document.ts"
import { FilePickerGURPS, LocalizeGURPS, prepareFormData } from "@util"
import { StaticCharacterImporter } from "./import.ts"
import { ActorType, CharacterGURPS } from "@actor"
import { CharacterImporter } from "@actor/character/import.ts"
import { CharacterConverter } from "./convert.ts"
import { DnD } from "@util/drag_drop.ts"
import { DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"
import { GURPSCONFIG } from "@scripts/config/index.ts"

type StaticCharacterSheetConfigOptions = FormApplicationOptions & {}

export interface StaticCharacterSheetConfig<
	TActor extends StaticCharacterGURPS,
	TOptions extends StaticCharacterSheetConfigOptions,
> extends FormApplication<TActor, TOptions> {
	object: TActor
}
interface StaticCharacterSheetConfigData<TActor extends StaticCharacterGURPS> extends FormApplicationData<TActor> {
	actor: TActor["_source"]
	system: TActor["system"]
	filename: string
	config: typeof GURPSCONFIG
	resourceTrackers: StaticResourceTracker[]
}

export class StaticCharacterSheetConfig<
	TActor extends StaticCharacterGURPS,
	TOptions extends StaticCharacterSheetConfigOptions,
> extends FormApplication<TActor, TOptions> {
	filename: string

	file?: { text: string; name: string; path: string }

	resourceTrackers: StaticResourceTracker[]

	constructor(object: TActor, options?: TOptions) {
		super(object, options)
		this.object = object
		this.filename = ""
		this.resourceTrackers = this.object.trackers
	}

	static override get defaultOptions(): FormApplicationOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: ["form", "character-config", "gurps"],
			template: `systems/${SYSTEM_NAME}/templates/actor/static/config/config.hbs`,
			width: 560,
			height: 560,
			resizable: true,
			submitOnChange: true,
			submitOnClose: true,
			closeOnSubmit: false,
			tabs: [
				{
					navSelector: "nav",
					contentSelector: "section.content",
					initital: "sheet-settings",
				},
			],
			dragDrop: [{ dragSelector: ".item-list .item .controls .drag", dropSelector: null }],
			scrollY: [".item-list", ".tab"],
		})
	}

	override get title(): string {
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.character.settings.header, {
			name: this.object.name,
		})
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find(".item").on("dragover", event => this._onDragItem(event))
		html.find(".add").on("click", event => this._onAddItem(event))
		html.find(".delete").on("click", event => this._onDeleteItem(event))
		html.find(".quick-import").on("click", event => this._reimport(event))
		if (game.settings.get(SYSTEM_NAME, SETTINGS.SERVER_SIDE_FILE_DIALOG)) {
			html.find("input[type='file']").on("click", event => {
				event.preventDefault()
				const filepicker = new FilePickerGURPS({
					callback: (path: string) => {
						const request = new XMLHttpRequest()
						request.open("GET", path)
						new Promise(resolve => {
							request.onload = () => {
								if (request.status === 200) {
									const text = request.response
									this.file = {
										text: text,
										name: path,
										path: request.responseURL,
									}
									this.filename = String(path).split(/\\|\//).pop() || ""
									this.render()
								}
								resolve(this)
							}
						})
						request.send(null)
					},
				})
				filepicker.extension = [".gcs", ".xml", ".gca5"]
				filepicker.render(true)
			})
		} else {
			html.find("input[type='file']").on("change", event => {
				const filename = String($(event.currentTarget).val()).split(/\\|\//).pop() || ""
				const files = $(event.currentTarget).prop("files")
				this.filename = filename
				if (files) {
					fu.readTextFromFile(files[0]).then(
						text =>
							(this.file = {
								text: text,
								name: files[0].name,
								path: files[0].path,
							}),
					)
				}
				this.render()
			})
		}
		html.find(".import-confirm").on("click", event => this._import(event))
		html.find(".easy-update").on("click", event => this._easyUpdate(event))
	}

	protected async _import(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		if (this.file) {
			const file = this.file
			this.file = undefined
			this.filename = ""
			StaticCharacterImporter.import(this.object, file)
		}
	}

	protected async _reimport(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		const import_path = this.object.system.additionalresources.importpath
		const import_name = import_path.match(/.*[/\\]Data[/\\](.*)/)
		const file_path = import_name?.[1].replace(/\\/g, "/") || this.object.system.additionalresources.importpath
		const request = new XMLHttpRequest()
		request.open("GET", file_path)

		new Promise(resolve => {
			request.onload = () => {
				if (request.status === 200) {
					const text = request.response
					StaticCharacterImporter.import(this.object, {
						text: text,
						name: file_path,
						path: import_path,
					})
				}
				resolve(this)
			}
		})
		request.send(null)
	}

	protected async _easyUpdate(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		const import_path = this.object.system.additionalresources.importpath
		const import_name = import_path.match(/.*[/\\]Data[/\\](.*)/)
		const file_path = import_name?.[1].replace(/\\/g, "/") || this.object.system.additionalresources.importpath
		const request = new XMLHttpRequest()
		request.open("GET", file_path)

		const new_actor = await CharacterGURPS.create(
			{
				name: this.object.name!,
				type: ActorType.Character,
				img: this.object.img,
			},
			{ promptImport: false } as DocumentModificationContext<CharacterGURPS["parent"]>,
		)
		if (!new_actor) return
		await new_actor.update({ ownership: this.object.ownership })
		new Promise(resolve => {
			request.onload = () => {
				if (request.status === 200) {
					const text = request.response
					CharacterImporter.import(new_actor, {
						text: text,
						name: file_path,
						path: import_path,
					})
				}
				resolve(this)
			}
		})
		request.send(null)
		await this.object.delete()
		await new_actor.sheet?.render(true)
		ui.notifications?.info(
			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.character.settings.import.success, {
				actor: this.object.name!,
			}),
		)
	}

	protected async _forceConvert(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		CharacterConverter.update(this.object)
	}

	async _onAddItem(event: JQuery.ClickEvent): Promise<this> {
		event.preventDefault()
		event.stopPropagation()
		const type: "resource_trackers" | "tracker_thresholds" = $(event.currentTarget).data("type")
		const resource_trackers = Object.values(this.resourceTrackers)
		let updated_trackers: Record<string, StaticResourceTracker> = {}
		switch (type) {
			case "resource_trackers":
				resource_trackers.push({
					alias: "",
					name: "",
					max: 0,
					isMaxEnforced: false,
					min: 0,
					isMinEnforced: false,
					isDamageTracker: false,
					isDamageType: false,
					pdf: "",
					initialValue: 0,
					value: 0,
					points: 0,

					thresholds: [],
				})
				updated_trackers = resource_trackers.reduce(
					(a, v, k) => ({
						...a,
						// [String(k).padStart(5, "0")]: v,
						[k]: v,
					}),
					{},
				)
				await this.object.update({ "system.additionalresources.-=tracker": null }, { render: false })
				await this.object.update({ "system.additionalresources.tracker": updated_trackers })
				return this.render()
			case "tracker_thresholds":
				resource_trackers[parseInt($(event.currentTarget).data("index"))].thresholds ??= []
				resource_trackers[parseInt($(event.currentTarget).data("index"))].thresholds!.push({
					color: "#ffffff",
					comparison: StaticThresholdComparison.GreaterThan,
					operator: StaticThresholdOperator.Multiply,
					value: 0,
					condition: "Normal",
				})
				updated_trackers = resource_trackers.reduce(
					(a, v, k) => ({
						...a,
						// [String(k).padStart(5, "0")]: v,
						[k]: v,
					}),
					{},
				)
				await this.object.update({ "system.additionalresources.-=tracker": null }, { render: false })
				await this.object.update({ "system.additionalresources.tracker": updated_trackers })
				return this.render()
		}
	}

	private async _onDeleteItem(event: JQuery.ClickEvent) {
		event.preventDefault()
		event.stopPropagation()
		let updated_trackers
		const type: "resource_trackers" | "tracker_thresholds" = $(event.currentTarget).data("type")
		const index = Number($(event.currentTarget).data("index")) || 0
		const parent_index = Number($(event.currentTarget).data("pindex")) || 0
		switch (type) {
			case "resource_trackers":
				this.resourceTrackers.splice(index, 1)
				updated_trackers = this.resourceTrackers.reduce(
					(a, v, k) => ({
						...a,
						// [String(k).padStart(5, "0")]: v,
						[k]: v,
					}),
					{},
				)
				await this.object.update({ "system.additionalresources.-=tracker": null }, { render: false })
				await this.object.update({ "system.additionalresources.tracker": updated_trackers })
				return this.render()
			case "tracker_thresholds":
				this.resourceTrackers[parent_index].thresholds?.splice(index, 1)
				updated_trackers = this.resourceTrackers.reduce(
					(a, v, k) => ({
						...a,
						// [String(k).padStart(5, "0")]: v,
						[k]: v,
					}),
					{},
				)
				await this.object.update({ "system.additionalresources.-=tracker": null }, { render: false })
				await this.object.update({ "system.additionalresources.tracker": this.resourceTrackers })
				return this.render()
		}
	}

	override async _onDragStart(event: DragEvent): Promise<void> {
		const item = $(event.currentTarget!)
		const type = item.data("type")
		const index = Number(item.data("index"))
		const parent_index = Number(item.data("pindex")) || 0
		event.dataTransfer?.setData(
			"text/plain",
			JSON.stringify({
				type: type,
				index: index,
				parent_index: parent_index,
			}),
		)
		// event.dragType = type
	}

	protected _onDragItem(event: JQuery.DragOverEvent): void {
		const element = $(event.currentTarget!)
		const heightAcross = (event.pageY! - element.offset()!.top) / element.height()!
		element.siblings(".item").removeClass("border-top").removeClass("border-bottom")
		if (heightAcross > 0.5) {
			element.removeClass("border-top")
			element.addClass("border-bottom")
		} else {
			element.removeClass("border-bottom")
			element.addClass("border-top")
		}
	}

	protected override async _onDrop(event: DragEvent): Promise<unknown> {
		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
		if (dragData.type !== DropDataType.ResourceTrackers && dragData.type !== DropDataType.TrackerThresholds) return

		const index = Number(dragData.index)
		let element = $(event.target!)
		if (!element.hasClass("item")) element = element.parent(".item")

		const target_index = element.data("index")
		const above = element.hasClass("border-top")
		if (index === target_index) return this.render()
		if (above && index === target_index - 1) return this.render()
		if (!above && index === target_index + 1) return this.render()

		const container = this.resourceTrackers

		let item
		if (dragData.type === DropDataType.TrackerThresholds) {
			item = container[dragData.parent_index].thresholds.splice(dragData.index, 1)[0]
			container[dragData.parent_index].thresholds.splice(target_index, 0, item)
		} else {
			item = container.splice(dragData.index, 1)[0]
			container.splice(target_index, 0, item)
		}

		const updated_trackers = container.reduce(
			(a, v, k) => ({
				...a,
				// [String(k).padStart(5, "0")]: v,
				[k]: v,
			}),
			{},
		)
		await this.object.update({ "system.additionalresources.tracker": updated_trackers })
		return this.render()
	}

	override getData(options?: Partial<FormApplicationOptions> | undefined): StaticCharacterSheetConfigData<TActor> {
		const actor = this.object
		this.resourceTrackers = this.object.trackers
		const resourceTrackers = actor.trackers
		let deprecation: string = this.object.getFlag(SYSTEM_NAME, "deprecation_acknowledged")
			? "acknowledged"
			: "manual"
		// Don't show deprecation warning if character is not imported
		if (deprecation === "manual") {
			if (this.object.system.additionalresources.importpath.includes(".gcs")) deprecation = "easy"
			if (this.object.system.additionalresources.importpath.includes(".gca5")) deprecation = "easy"
		}

		return {
			options: options,
			actor: actor.toObject(),
			system: actor.system,
			resourceTrackers: resourceTrackers,

			filename: this.filename,
			config: CONFIG.GURPS,
		}
	}

	protected async _updateObject(_event: Event, formData: Record<string, unknown>): Promise<unknown> {
		formData = prepareFormData(formData, this.object)
		await this.object.update({ "system.additionalresources.-=tracker": null }, { render: false })
		await this.object.update(formData)
		return this.render()
	}
}
