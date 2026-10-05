import { WebSocketServer } from "ws";
import { logger } from "@/helpers/logger.js";
import { DeemixApp } from "@/deemixApp.js";
import type { Settings } from "deemix";

const eventName = "saveSettings";

export interface SaveSettingsData {
	settings: Settings;
}

const cb = (
	data: SaveSettingsData,
	_: any,
	__: WebSocketServer,
	deemix: DeemixApp
) => {
	const { settings } = data;
	deemix.saveSettings(settings);
	logger.info("Settings saved");
	deemix.listener.send("updateSettings", { settings });
};

export default { eventName, cb };
