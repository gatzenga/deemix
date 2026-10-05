import { DEFAULT_SETTINGS } from "../settings.js";
import { fixName, generatePath, pad } from "./pathtemplates.js";

test("fix name", async () => {
	const fixed = fixName("track/:*");
	expect(fixed).toBe("track___");
});

test("pad name", () => {
	const settings = {
		paddingSize: 0,
		padTracks: true,
		padSingleDigit: true,
	};

	expect(pad(1, 12, settings)).toEqual("01");
	expect(pad(12, 12, settings)).toEqual("12");

	settings.paddingSize = 4;
	expect(pad(1, 2, settings)).toEqual("0001");
	expect(pad(12, 12, settings)).toEqual("0012");

	settings.padSingleDigit = false;
	settings.paddingSize = 1;
	expect(pad(1, 12, settings)).toEqual("1");
	expect(pad(12, 12, settings)).toEqual("12");

	settings.padTracks = false;

	expect(pad(1, 12, settings)).toEqual("1");
	expect(pad(12, 12, settings)).toEqual("12");
});

function makeTrack(discNumber: number, trackNumber: number, position: number) {
	const artist = { id: 1, name: "Artist" };
	return {
		title: "Title",
		mainArtist: artist,
		artists: ["Artist"],
		trackNumber,
		discNumber,
		position,
		date: { year: "2024" },
		dateString: "2024-01-01",
		bpm: 0,
		ISRC: "",
		explicit: false,
		id: 1,
		playlist: null,
		album: {
			id: "1",
			title: "Album",
			mainArtist: artist,
			rootArtist: null,
			artists: ["Artist"],
			trackTotal: 30,
			discTotal: 3,
			genre: [],
			label: "",
			barcode: "",
			explicit: false,
			recordType: "album",
			date: { year: "2024" },
			dateString: "2024-01-01",
			bitrate: "9",
		},
	} as any;
}

const settings: any = { ...DEFAULT_SETTINGS, downloadLocation: "." };

test("album tracks are numbered continuously across discs", () => {
	const first = generatePath(makeTrack(1, 1, 1), "album", settings);
	expect(first.filename).toBe("01. Title");

	// Track 1 of disc 3 is track 21 of the album
	const third = generatePath(makeTrack(3, 1, 21), "album", settings);
	expect(third.filename).toBe("21. Title");
});

test("albums get an artist and album folder without disc folders", () => {
	const { filepath } = generatePath(makeTrack(2, 3, 13), "album", settings);
	expect(filepath).toBe("./Artist/Album");
});

test("single tracks use the artist and title", () => {
	const { filename, filepath } = generatePath(
		makeTrack(1, 1, null),
		"track",
		settings
	);
	expect(filename).toBe("Artist - Title");
	expect(filepath).toBe("./Artist");
});
