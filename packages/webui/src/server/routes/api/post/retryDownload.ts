import { Deezer } from "deezer-sdk";
import { sessionDZ } from "../../../deemixApp.js";
import { logger } from "../../../helpers/logger.js";
import { type ApiHandler } from "../../../types.js";

const path: ApiHandler["path"] = "/retryDownload";

const handler: ApiHandler["handler"] = async (req, res) => {
	if (!sessionDZ[req.session.id]) sessionDZ[req.session.id] = new Deezer();
	const deemix = req.app.get("deemix");
	const dz = sessionDZ[req.session.id];

	const uuid = req.body.uuid;
	const data = uuid.split("_");
	if (data[0] === "playlist" && data[1].endsWith("_top_track")) {
		data[0] = "artist";
		data[1] = data[1].replace("_top_track", "/top_track");
	}
	const url = `https://www.deezer.com/${data[0]}/${data[1]}`;
	const bitrate = Number(data[2]);
	let obj: any;

	try {
		obj = await deemix.addToQueue(dz, [url], bitrate, true);
	} catch (e: any) {
		res.send({ result: false, errid: e.name, data: { url, bitrate } });
		switch (e.name) {
			case "NotLoggedIn":
				deemix.listener.send("queueError" + e.name);
				break;
			case "CantStream":
				deemix.listener.send("queueError" + e.name, e.bitrate);
				break;
			default:
				logger.error(e);
				break;
		}
		return;
	}

	res.send({ result: true, data: { url, bitrate, obj } });
};

const apiHandler: ApiHandler = { path, handler };

export default apiHandler;
