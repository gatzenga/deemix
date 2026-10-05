import { createI18n } from "vue-i18n";

import { locales } from "@/lang";

const DEFAULT_LANG = "en";

document.querySelector("html").setAttribute("lang", DEFAULT_LANG);

const i18n = createI18n({
	legacy: false,
	locale: DEFAULT_LANG,
	fallbackLocale: "en",
	messages: locales,
});

export default i18n;
