import { fetchData } from "@/utils/api-utils";

let settingsData = {};
let defaultSettingsData = {};

export async function getSettingsData() {
	const data = await fetchData("getSettings");
	const { settings, defaultSettings } = data;

	settingsData = settings;
	defaultSettingsData = defaultSettings;

	return { settingsData, defaultSettingsData };
}
