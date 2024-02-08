import { prepareSelectOptions } from "@data/select.ts"
import { LocalizeGURPS } from "@util"

export const I18nInit = {
	listen: (): void => {
		Hooks.once("i18nInit", () => {
			LocalizeGURPS.ready = true
			prepareSelectOptions()
		})
	},
}
