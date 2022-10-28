import { ActorFlagsGURPS, ActorSystemData, ActorType, BaseActorSourceGURPS } from "@actor/base/data"

export const MoveModeTypes = {
	Ground: "gurps.character.move_modes.ground",
	Air: "gurps.character.move_modes.air",
	Water: "gurps.character.move_modes.water",
	Space: "gurps.character.move_modes.space",
}

export enum Posture {
	Standing = "standing",
	Prone = "prone",
	Kneeling = "kneeling",
	Crouching = "crouching",
	Sitting = "sitting",
	Crawling = "crawling",
}

export interface MoveMode {
	mode: typeof MoveModeTypes | string
	basic: number
	enhanced?: number
	default: boolean
}

export interface StaticCharacterSource extends BaseActorSourceGURPS<ActorType.CharacterGCA, StaticCharacterSystemData> {
	flags: DeepPartial<StaticCharacterFlags>
}
export interface StaticCharacterDataGURPS
	extends Omit<StaticCharacterSource, "effects" | "flags" | "items" | "token">,
		StaticCharacterSystemData {
	readonly type: StaticCharacterSource["type"]
	data: StaticCharacterSystemData
	flags: StaticCharacterFlags

	readonly _source: StaticCharacterSource
}

type StaticCharacterFlags = ActorFlagsGURPS & {
	gurps: {
		// Empty
	}
}

export interface StaticCharacterSystemData extends ActorSystemData {
	editing: boolean
	additionalresources: {
		bodyplan: string
		ignoreinputbodyplan: boolean
		importname: string
		importpath: string
		tracker: {
			[key: string]: StaticResourceTracker
		}
	}
	hitlocations: any
	lastImport: string
	attributes: {
		[key in StaticAttributeName]: StaticAttribute
	}
	HP: StaticPoolValue
	FP: StaticPoolValue
	QP: StaticPoolValue
	dodge: {
		value: number
		enc_level: number
	}
	basicmove: {
		value: string
		points: number
	}
	basicspeed: {
		value: string
		points: number
	}
	parry: number
	currentmove: number
	thrust: string
	swing: string
	frightcheck: number
	hearing: number
	tastesmell: number
	vision: number
	touch: number
	// TODO: change
	conditions: any
	traits: any
	encumbrance: any
	move: any
	reactions: any
	conditionalmods: any
	ads: any
	skills: any
	spells: any
	equipment: {
		carried?: any
		other?: any
	}
	eqtsummary: number
	melee: any
	ranged: any
	currentdodge: any
	languages: any
	liftingmoving: {
		basiclift: string
		carryonback: string
		onehandedlift: string
		runningshove: string
		shiftslightly: string
		shove: string
		twohandedlift: string
	}
	notes: any
	equippedparryisfencing?: boolean
	block?: number
}

export enum StaticAttributeName {
	ST = "ST",
	DX = "DX",
	IQ = "IQ",
	HT = "HT",
	WILL = "WILL",
	PER = "PER",
	QN = "QN",
}

export interface StaticPoolValue {
	value: number
	min: number
	max: number
	points: number
}

export enum StaticSecondaryAttributeName {
	frightCheck = "frightcheck",
	vision = "vision",
	hearing = "hearing",
	tasteSmell = "tastesmell",
	touch = "touch",
}

export interface StaticAttribute {
	import: number
	value: number
	points: number
	dtype: "Number"
}

export interface StaticResourceTracker {
	alias: string
	initialValue: number
	isDamageTracker: boolean
	isDamageType: boolean
	max: number
	min: number
	name: string
	pdf: string
	points: number
	value: number
	thresholds: StaticResourceThreshold[]
}

export interface StaticResourceThreshold {
	color: string
	comparison: StaticThresholdComparison
	operator: StaticThresholdOperator
	value: number
	condition: string
}

export enum StaticThresholdComparison {
	LessThan = "<",
	GreaterThan = ">",
	LessThanOrEqual = "≥",
	GreaterThanOrEqual = "≤",
}

enum StaticThresholdOperator {
	Add = "+",
	Subtract = "−",
	Multiply = "×",
	Divide = "÷",
}

export class StaticEncumbrance {
	key: string

	level: number

	dodge: number

	weight: string

	move: number

	current: boolean

	constructor() {
		this.key = ""
		this.level = 0
		this.dodge = 9
		this.weight = ""
		this.move = 0
		this.current = false
	}
}