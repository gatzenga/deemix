import { TrackFormats } from "deezer-sdk";
import { getMusicFolder, getConfigFolder } from "./utils/localpaths.js";
import fs from "fs";
import { type Settings, type Tags } from "./types/Settings.js";

// Should the lib overwrite files?
export const OverwriteOption = {
	OVERWRITE: "y", // Yes, overwrite the file
	DONT_OVERWRITE: "n", // No, don't overwrite the file
	DONT_CHECK_EXT: "e", // No, and don't check for extensions
	KEEP_BOTH: "b", // No, and keep both files
	ONLY_TAGS: "t", // Overwrite only the tags
	ONLY_LOWER_BITRATES: "l", // Overwrite only lower bitrates
};

// What should I do with featured artists?
export const FeaturesOption = {
	NO_CHANGE: "0", // Do nothing
	REMOVE_TITLE: "1", // Remove from track title
	REMOVE_TITLE_ALBUM: "3", // Remove from track title and album title
	MOVE_TITLE: "2", // Move to track title
};

// Fixed artwork settings: the artist image is always saved, artwork is
// requested at the largest size Deezer officially serves
export const ARTWORK = {
	embeddedSize: 1200,
	embeddedPNG: false,
	localSize: 1200,
	localFormat: "jpg",
	jpegImageQuality: 90,
	saveCover: false,
	saveArtist: true,
	coverTemplate: "cover",
	artistTemplate: "artist",
};

// Fixed download behaviour: always applied, whatever the config file says
const FIXED_SETTINGS = {
	queueConcurrency: 3,
	maxBitrate: TrackFormats.MP3_320,
	overwriteFile: OverwriteOption.DONT_OVERWRITE,
	fallbackBitrate: false,
	fallbackSearch: false,
	fallbackISRC: false,
	feelingLucky: false,
	logErrors: false,
	logSearched: false,
	syncedLyrics: false,
	createM3U8File: false,
	clearQueueOnExit: false,
	albumVariousArtists: true,
	removeDuplicateArtists: true,
	dateFormat: "D-M-Y",
	featuredToTitle: FeaturesOption.REMOVE_TITLE_ALBUM,
	titleCasing: "nothing",
	artistCasing: "nothing",
	executeCommand: "",
} satisfies Partial<Settings>;

// Fixed tag behaviour: one artist per track (the main artist) and a single
// main album artist, "Various Artists" is kept for compilations
const FIXED_TAGS = {
	multiArtistSeparator: "nothing",
	singleAlbumArtist: true,
	saveID3v1: true,
} satisfies Partial<Tags>;

export const DEFAULT_SETTINGS: Settings = {
	downloadLocation: getMusicFolder(),
	padTracks: true,
	padSingleDigit: true,
	paddingSize: 0,
	illegalCharacterReplacer: "_",
	...FIXED_SETTINGS,
	playlistFilenameTemplate: "playlist",
	tags: {
		title: true,
		artist: true,
		album: true,
		cover: true,
		trackNumber: true,
		albumArtist: true,
		year: true,
		bpm: true,
		rating: false,
		...FIXED_TAGS,
	},
};

export function saveSettings(settings: Settings, configFolder) {
	configFolder = configFolder || getConfigFolder();
	fs.mkdirSync(configFolder, { recursive: true });

	fs.writeFileSync(
		configFolder + "config.json",
		JSON.stringify(settings, null, 2)
	);
}

export function loadSettings(configFolder: string) {
	configFolder = configFolder || getConfigFolder();
	fs.mkdirSync(configFolder, { recursive: true });

	if (!fs.existsSync(configFolder + "config.json"))
		saveSettings(DEFAULT_SETTINGS, configFolder);

	let settings: Settings;
	try {
		settings = JSON.parse(
			fs.readFileSync(configFolder + "config.json").toString()
		);
	} catch (e) {
		if (e.name === "SyntaxError") saveSettings(DEFAULT_SETTINGS, configFolder);
		settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
	}
	if (check(settings) > 0) saveSettings(settings, configFolder);
	return settings;
}

function check(settings: Settings) {
	let changes = 0;
	Object.keys(FIXED_SETTINGS).forEach((_iSet) => {
		if (settings[_iSet] !== FIXED_SETTINGS[_iSet]) {
			settings[_iSet] = FIXED_SETTINGS[_iSet];
			changes++;
		}
	});
	Object.keys(DEFAULT_SETTINGS).forEach((_iSet) => {
		if (
			settings[_iSet] === undefined ||
			typeof settings[_iSet] !== typeof DEFAULT_SETTINGS[_iSet]
		) {
			settings[_iSet] = DEFAULT_SETTINGS[_iSet];
			changes++;
		}
	});
	Object.keys(DEFAULT_SETTINGS.tags).forEach((_iSet) => {
		if (
			settings.tags[_iSet] === undefined ||
			typeof settings.tags[_iSet] !== typeof DEFAULT_SETTINGS.tags[_iSet]
		) {
			settings.tags[_iSet] = DEFAULT_SETTINGS.tags[_iSet];
			changes++;
		}
	});
	Object.keys(FIXED_TAGS).forEach((_iSet) => {
		if (settings.tags[_iSet] !== FIXED_TAGS[_iSet]) {
			settings.tags[_iSet] = FIXED_TAGS[_iSet];
			changes++;
		}
	});
	if (settings.downloadLocation === "") {
		settings.downloadLocation = DEFAULT_SETTINGS.downloadLocation;
		changes++;
	}
	["playlistFilenameTemplate", "paddingSize"].forEach((template) => {
		if (settings[template] === "") {
			settings[template] = DEFAULT_SETTINGS[template];
			changes++;
		}
	});
	return changes;
}
