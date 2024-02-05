import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { UserFlags } from "@module/user/data.ts"
import { ErrorGURPS, fontAwesomeIcon, htmlQuery } from "@util"
import MiniSearch from "minisearch"
import { CompendiumMigrationStatus } from "../compendium-migration-status.ts"
import { SYSTEM_NAME } from "@data"

class CompendiumDirectoryGURPS extends CompendiumDirectory {
	static readonly STOP_WORDS = new Set(["of", "th", "the"])

	static readonly searchEngine = new MiniSearch<CompendiumIndexData>({
		fields: ["name"],
		idField: "uuid",
		processTerm: t =>
			t.length > 1 && !this.STOP_WORDS.has(t) ? t.toLocaleLowerCase(game.i18n.lang).replace(/['"]/g, "") : null,
		searchOptions: { combineWith: "AND", prefix: true },
		storeFields: ["uuid", "img", "name", "type", "documentType", "packLabel"],
	})

	/** Include ability to search and drag document search results */
	static override get defaultOptions(): ApplicationOptions {
		const options = super.defaultOptions
		options.dragDrop.push({ dragSelector: "ol.document-matches > li.match" })

		return {
			...options,
			filters: [{ inputSelector: "input[type=search]", contentSelector: "ol.directory-list" }],
			template: `systems/${SYSTEM_NAME}/templates/sidebar/compendium-directory.hbs`,
		}
	}

	/** Create a drag preview that looks like the one generated from an open compendium */
	get #dragPreview(): HTMLElement {
		const preview = document.createElement("div")
		preview.id = "pack-search-drag-preview"

		const thumbnail = document.createElement("img")
		const title = document.createElement("h4")
		preview.append(thumbnail, title)

		return preview
	}

	override async getData(options?: Partial<ApplicationOptions>): Promise<CompendiumDirectoryDataGURPS> {
		return {
			...(await super.getData(options)),
			searchContents: game.user.flags[SYSTEM_NAME][UserFlags.SearchPackContents],
		}
	}

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

	override activateListeners($html: JQuery): void {
		super.activateListeners($html)

		// Hook in the compendium browser
		$html[0].querySelector("footer > button")?.addEventListener("click", () => {
			game.gurps.compendiumBrowser.render(true)
		})
	}

	protected override _getEntryContextOptions(): EntryContextOption[] {
		const options = super._getEntryContextOptions()

		options.push({
			name: "COMPENDIUM.MigrationStatus",
			icon: fontAwesomeIcon("info").outerHTML,
			condition: $li => {
				const compendium = game.packs.get($li.data("pack"), { strict: true })
				const actorOrItem =
					compendium.documentClass === CONFIG.Actor.documentClass ||
					compendium.documentClass === CONFIG.Item.documentClass
				const isSystemCompendium = compendium.metadata.packageType === "system"
				return game.user.isGM && actorOrItem && !isSystemCompendium
			},
			callback: async $li => {
				const compendium = game.packs.get($li.data("pack"), { strict: true }) as CompendiumCollection<
					ActorGURPS<null> | ItemGURPS<null>
				>
				new CompendiumMigrationStatus(compendium).render(true)
			},
		})

		return options
	}

	/** Add a context menu for content search results */
	protected override _contextMenu($html: JQuery): void {
		super._contextMenu($html)

		ContextMenu.create(this, $html, "ol.document-matches > li", [
			{
				name: "COMPENDIUM.ImportEntry",
				icon: fontAwesomeIcon("download").outerHTML,
				condition: $li => {
					const { uuid } = $li.get(0)?.dataset ?? {}
					if (!uuid) throw ErrorGURPS("Unexpected missing uuid")
					const collection = game.packs.get(fromUuidSync(uuid)?.pack ?? "", { strict: true })
					const documentClass = collection.documentClass as unknown as typeof foundry.abstract.Document

					return documentClass.canUserCreate(game.user)
				},
				callback: $li => {
					const { uuid } = $li.get(0)?.dataset ?? {}
					if (!uuid) throw ErrorGURPS("Unexpected missing uuid")
					const packCollection = game.packs.get(fromUuidSync(uuid)?.pack ?? "", { strict: true })
					const worldCollection = game.collections.get(packCollection.documentName, { strict: true })
					const indexData = fromUuidSync(uuid) ?? { _id: "" }
					if (!("_id" in indexData && typeof indexData._id === "string")) {
						throw ErrorGURPS("Unexpected missing document _id")
					}

					return worldCollection.importFromCompendium(
						packCollection,
						indexData._id,
						{},
						{ renderSheet: true },
					)
				},
			},
		])
	}

	/** System compendium search */
	protected override _onSearchFilter(event: KeyboardEvent, query: string, rgx: RegExp, listElem: HTMLElement): void {
		super._onSearchFilter(event, query, rgx, listElem)
		const html = this.element[0]

		// Match documents within each compendium by name
		const docMatches = query.length > 0 ? this.constructor.searchEngine.search(query) : []
		const { activeFilters } = this
		const filteredMatches =
			this.activeFilters.length > 0 ? docMatches.filter(m => activeFilters.includes(m.documentType)) : docMatches

		// Create a list of document matches
		const matchTemplate = htmlQuery<HTMLTemplateElement>(html, ".compendium-search-match")
		if (!matchTemplate) throw ErrorGURPS("Match template not found")

		const listElements = filteredMatches.map((match): HTMLLIElement => {
			const li = matchTemplate.content.firstElementChild?.cloneNode(true) as HTMLLIElement
			li.dataset.uuid = match.uuid
			li.dataset.score = match.score.toString()

			// Show a thumbnail if available
			const thumbnail = li.querySelector<HTMLImageElement>("img")
			if (thumbnail) {
				if (match.documentType === "JournalEntry") thumbnail.src = "icons/svg/book.svg"
				// if (typeof match.img === "string") {
				// 	thumbnail.src = game.gurps.system.moduleArt.map.get(match.uuid)?.img ?? match.img
				// } else if (match.documentType === "JournalEntry") {
				// 	thumbnail.src = "icons/svg/book.svg"
				// }
			}

			// Open compendium on result click
			li.addEventListener("click", async event => {
				event.stopPropagation()
				const doc = await fromUuid(match.uuid)
				await doc?.sheet?.render(true, { editable: doc.sheet.isEditable })
			})

			const anchor = li.querySelector("a")
			const details = li.querySelector("span")
			const systemType = ["Actor", "Item"].includes(match.documentType)
				? game.i18n.localize(`TYPES.${match.documentType}.${match.type}`)
				: null
			if (anchor && details) {
				anchor.innerText = match.name
				details.innerText = systemType ? `${systemType} (${match.packLabel})` : `(${match.packLabel})`
			}

			return li
		})
		const matchesList = htmlQuery(html, "ol.document-matches")
		if (!matchesList) return
		matchesList.replaceChildren(...listElements)
		for (const dragDrop of this._dragDrop) {
			dragDrop.bind(matchesList)
		}
	}

	/** Anyone can drag from search results */
	protected override _canDragStart(): boolean {
		return true
	}

	/** Replicate the functionality of dragging a compendium document from an open `Compendium` */
	protected override _onDragStart(event: DragEvent): void {
		const dragElement = event.currentTarget
		if (!(dragElement instanceof HTMLElement && event.dataTransfer)) {
			return super._onDragStart(event)
		}
		const { uuid } = dragElement.dataset
		if (!uuid) return super._onDragStart(event)

		const indexEntry = fromUuidSync(uuid)
		if (!indexEntry) throw ErrorGURPS("Unexpected error retrieving index data")

		// Clean up old drag preview
		document.querySelector("#pack-search-drag-preview")?.remove()

		// Create a new drag preview
		const dragPreview = this.#dragPreview.cloneNode(true) as HTMLElement
		const [img, title] = Array.from(dragPreview.childNodes) as [HTMLImageElement, HTMLHeadingElement]
		title.innerText = indexEntry.name ?? ""
		img.src = "img" in indexEntry && indexEntry.img ? indexEntry.img : "icons/svg/book.svg"

		document.body.appendChild(dragPreview)
		const documentType = ((): string | null => {
			if (indexEntry instanceof foundry.abstract.Document) return indexEntry.documentName
			const pack = game.packs.get(indexEntry.pack ?? "")
			return pack?.documentName ?? null
		})()
		if (!documentType) return

		event.dataTransfer.setDragImage(dragPreview, 75, 25)
		event.dataTransfer.setData("text/plain", JSON.stringify({ type: documentType, uuid }))
	}

	/** Called by a "ready" hook */
	compileSearchIndex(): void {
		console.debug("GURPS | compiling search index")
		const packs = game.packs.filter(p => p.index.size > 0 && p.testUserPermission(game.user, "OBSERVER"))
		this.constructor.searchEngine.removeAll()

		for (const pack of packs) {
			const contents = pack.index.map(i => ({
				...i,
				documentType: pack.metadata.type,
				packLabel: pack.metadata.label,
			}))
			this.constructor.searchEngine.addAll(contents)
		}
		console.debug("GURPS | Finished compiling search index")
	}
}

interface CompendiumDirectoryGURPS extends CompendiumDirectory {
	constructor: typeof CompendiumDirectoryGURPS
}

interface CompendiumDirectoryDataGURPS extends CompendiumDirectoryData {
	searchContents: boolean
}

export { CompendiumDirectoryGURPS }
