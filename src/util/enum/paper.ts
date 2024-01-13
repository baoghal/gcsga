import { LocalizeGURPS } from "@util/localize"

export namespace paper {
	export enum Size {
		Letter = "letter",
		Legal = "legal",
		Tabloid = "tabloid",
		A0 = "a0",
		A1 = "a1",
		A2 = "a2",
		A3 = "a3",
		A4 = "a4",
		A5 = "a5",
		A6 = "a6",
	}

	export namespace Size {
		export function toString(S: Size): string {
			return LocalizeGURPS.translations.gurps.enum.paper.size[S]
		}
	}

	export type Orientation = string
	export type Length = string
}
