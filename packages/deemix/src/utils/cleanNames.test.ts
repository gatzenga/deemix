import {
	cleanAlbumName,
	cleanName,
	getStrippableTitles,
	isRepriseTitle,
	stripMixSuffix,
} from "./cleanNames.js";

test("removes remaster in brackets", () => {
	expect(cleanName("Song (2014 Remaster)")).toBe("Song");
	expect(cleanName("Song (Remastered)")).toBe("Song");
	expect(cleanName("Song [Remastered 2009]")).toBe("Song");
	expect(cleanName("Song {Remaster}")).toBe("Song");
	expect(cleanName("Song (Digitally Remastered 2011)")).toBe("Song");
	expect(cleanName("Song (Remastered Version)")).toBe("Song");
	expect(cleanName("Song (re-mastered)")).toBe("Song");
	expect(cleanName("Song (REMASTERIZADO 2012)")).toBe("Song");
	expect(cleanName("Song (Remasterisé)")).toBe("Song");
	expect(cleanName("Song 【2014 Remaster】")).toBe("Song");
});

test("removes remaster after a dash or colon", () => {
	expect(cleanName("Song - 2011 Remaster")).toBe("Song");
	expect(cleanName("Song - Remastered")).toBe("Song");
	expect(cleanName("Song – Remastered 2009")).toBe("Song");
	expect(cleanName("Song - Remastered Version")).toBe("Song");
	expect(cleanName("Song - Live - 2011 Remaster")).toBe("Song - Live");
	expect(cleanName("Album: Remastered Edition")).toBe("Album");
});

test("removes bare remaster words", () => {
	expect(cleanName("Song Remastered")).toBe("Song");
	expect(cleanName("Song Remastered 2014")).toBe("Song");
	expect(cleanName("Song 2014 Remaster")).toBe("Song");
	expect(cleanName("Song REMASTER")).toBe("Song");
});

test("keeps the rest of the name", () => {
	expect(cleanName("Song (Live) [2015 Remaster]")).toBe("Song (Live)");
	expect(cleanName("Song (Remastered 2011) [Mono]")).toBe("Song [Mono]");
	expect(cleanName("Song (Live) - Remastered")).toBe("Song (Live)");
	expect(cleanName("Song (Live) (2014 Remaster)")).toBe("Song (Live)");
});

test("removes featured artists in every form", () => {
	for (const form of [
		"Song (feat. A & B)",
		"Song (feat A)",
		"Song (Feat. A)",
		"Song (ft. A)",
		"Song (Ft A)",
		"Song (featuring A)",
		"Song [feat. A]",
		"Song [ft. A]",
		"Song {feat. A}",
		"Song {featuring A, B}",
		"Song (f/ A)",
		"Song (with A)",
		"Song (With A & B)",
		"Song [w/ A]",
		"Song (avec A)",
		"Song (duet with A)",
		"Song - feat. A",
		"Song - ft. A & B",
		"Song feat. A",
		"Song feat. A & B",
		"Song ft. A",
		"Song ft A",
		"Song featuring A",
	]) {
		expect(cleanName(form), form).toBe("Song");
	}
});

test("features keep the rest of the name", () => {
	expect(cleanName("Song (feat. A) (Live)")).toBe("Song (Live)");
	expect(cleanName("Song (Live) (feat. A)")).toBe("Song (Live)");
	expect(cleanName("Song feat. A (Live)")).toBe("Song (Live)");
	expect(cleanName("Song (feat. A) (2014 Remaster)")).toBe("Song");
	expect(cleanName("Song (Live with Orchestra)")).toBe(
		"Song (Live with Orchestra)"
	);
	expect(cleanName("Dancing With Myself")).toBe("Dancing With Myself");
	expect(cleanName("Soft Feather")).toBe("Soft Feather");
	expect(cleanName("Left Foot")).toBe("Left Foot");
});

test("removes album version in every form", () => {
	for (const form of [
		"Song (Album Version)",
		"Song [Album Version]",
		"Song {Album Version}",
		"Song (LP Version)",
		"Song (Original Album Version)",
		"Song (Album Edit)",
		"Song - Album Version",
		"Song Album Version",
	]) {
		expect(cleanName(form), form).toBe("Song");
	}
});

test("leaves other names untouched", () => {
	expect(cleanName("Master of Puppets")).toBe("Master of Puppets");
	expect(cleanName("Premaster Tape")).toBe("Premaster Tape");
	expect(cleanName("Song - Live")).toBe("Song - Live");
	expect(cleanName("Remastered")).toBe("Remastered");
	expect(cleanName("")).toBe("");
});

test("removes editions from album names in every form", () => {
	for (const form of [
		"Album (Deluxe Edition)",
		"Album (Deluxe)",
		"Album [Deluxe Version]",
		"Album {Expanded Edition}",
		"Album (Expanded)",
		"Album (Special Edition)",
		"Album (Standard Edition)",
		"Album (Super Deluxe Edition)",
		"Album (De Luxe Edition)",
		"Album (Deluxe Edition With Bonus Tracks)",
		"Album (Bonus Track Version)",
		"Album (Collector's Edition)",
		"Album (Limited Edition)",
		"Album (Extended Edition)",
		"Album (Japanese Edition)",
		"Album (Remastered Deluxe Edition)",
		"Album (Deluxe) [Remastered]",
		"Album (Deluxe) (Bonus Track Version)",
		"Album - Deluxe Edition",
		"Album: Special Edition",
		"Album Deluxe",
		"Album Deluxe Edition",
		"Album Expanded Edition",
		"Album Deluxe Edition with Bonus Tracks",
		"Album (Deluxe Edition) (Bonus Tracks)",
		"Album + Bonus Tracks",
		"Album (Deluxe Edition) [Japanese Bonus Track Version]",
	]) {
		expect(cleanAlbumName(form), form).toBe("Album");
	}
});

test("keeps other albums untouched", () => {
	for (const name of [
		"Album (40th Anniversary Edition)",
		"Album (40th Anniversary Deluxe Edition)",
		"Album (Live)",
		"Live 1978-1992",
		"The Complete Studio Albums",
		"Special Delivery",
		"Standard Time",
		"Deluxe",
	]) {
		expect(cleanAlbumName(name), name).toBe(name);
	}
	expect(cleanAlbumName("Album (Live) (Deluxe Edition)")).toBe("Album (Live)");
});

test("removes bonus markers in every form", () => {
	for (const form of [
		"Song (Bonus Track)",
		"Song (Bonus)",
		"Song [Bonus Track]",
		"Song {Bonus Track}",
		"Song (Bonus-Track)",
		"Song (Bonustrack)",
		"Song (Bonus Tracks)",
		"Song (Bonus Title)",
		"Song (Bonus Song)",
		"Song (Bonus Cut)",
		"Song (Bonus Version)",
		"Song (iTunes Bonus Track)",
		"Song (Digital Bonus Track)",
		"Song (Japanese Bonus Track)",
		"Song (Japan Bonus Track)",
		"Song (US Bonus Track)",
		"Song (Amazon Bonus Track)",
		"Song (Deluxe Bonus Track)",
		"Song (Exclusive Bonus Track)",
		"Song (Hidden Track)",
		"Song (Hidden Bonus Track)",
		"Song (Extra Track)",
		"Song (Additional Track)",
		"Song (Bonus Disc)",
		"Song (Titre Bonus)",
		"Song (Pista Extra)",
		"Song (Bonus Track) [Deluxe Edition]",
		"Song - Bonus Track",
		"Song: Bonus Track",
		"Song Bonus Track",
		"Song Bonus",
		"Song with Bonus Track",
		"Song + Bonus Track",
	]) {
		expect(cleanName(form), form).toBe("Song");
	}
});

test("editions in brackets are removed from track titles as well", () => {
	expect(cleanName("Song (Deluxe Edition)")).toBe("Song");
	expect(cleanName("Song (Expanded Edition)")).toBe("Song");
	expect(cleanName("Song [Special Edition]")).toBe("Song");
});

test("keeps words that describe the kind of track", () => {
	for (const name of [
		"Intro",
		"Song (Intro)",
		"Song (Outro)",
		"Song (Skit)",
		"Song (Interlude)",
		"Song (Live)",
		"Song (Acoustic)",
		"Song (Demo)",
		"Bonus Round Blues",
		"Song (Live at Wembley)",
	]) {
		expect(cleanName(name), name).toBe(name);
	}
	expect(cleanName("Song (Live) (Bonus Track)")).toBe("Song (Live)");
	expect(cleanName("Song (Intro) (Bonus Track)")).toBe("Song (Intro)");
});

test("removes explicit markers in every form", () => {
	for (const form of [
		"Song (Explicit)",
		"Song (explicit)",
		"Song [Explicit]",
		"Song {EXPLICIT}",
		"Song (Explicit Version)",
		"Song [explicit version]",
		"Song (Explicit Content)",
		"Song (Explicit Lyrics)",
		"Song - Explicit",
		"Song - Explicit Version",
		"Song Explicit",
		"Song Explicit Version",
	]) {
		expect(cleanName(form), form).toBe("Song");
	}
	expect(cleanName("Song (Live) [Explicit]")).toBe("Song (Live)");
});

test("removes medley like any other addition", () => {
	for (const form of [
		"Song (Medley)",
		"Song [Medley]",
		"Song - Medley",
		"Song Medley",
		"Song (Live Medley)",
	]) {
		expect(cleanName(form), form).not.toMatch(/medley/i);
	}
	expect(cleanName("Song (Medley)")).toBe("Song");
	expect(cleanName("Disney Medley (Live)")).toBe("Disney (Live)");
	// The main title itself is never cut
	expect(cleanName("Song A / Song B (Medley)")).toBe("Song A / Song B");
});

test("strips mix suffixes with artist names and versions", () => {
	for (const form of [
		"Song (Club Mix)",
		"Song [Club Mix]",
		"Song (Remix)",
		"Song (David Guetta Mix)",
		"Song (Remixed by David Guetta)",
		"Song (David Guetta Remix)",
		"Song (Tiësto's Extended Remix)",
		"Song (Radio Edit)",
		"Song (Street Version)",
		"Song (Single Version)",
		"Song (Original Mix)",
		"Song (Dub Mix)",
		"Song - Radio Edit",
		"Song - David Guetta Remix",
		"Song - Extended Version",
	]) {
		expect(stripMixSuffix(form), form).toBe("Song");
	}
});

test("keeps suffixes that describe the kind of track", () => {
	for (const name of [
		"Song (Live Version)",
		"Song (Live)",
		"Song (Acoustic Version)",
		"Song (Instrumental Version)",
		"Song (Piano Version)",
		"Song (Demo Version)",
		"Mix It Up",
		"Version 2",
		"Song",
	]) {
		expect(stripMixSuffix(name), name).toBe(name);
	}
});

test("mix suffixes only go when the title stays unique in the album", () => {
	expect(getStrippableTitles(["Song (Club Mix)", "Other"])).toEqual([
		true,
		false,
	]);
	// The original is in the album as well
	expect(getStrippableTitles(["Song", "Song (Club Mix)"])).toEqual([
		false,
		false,
	]);
	// Two versions would end up with the same name
	expect(getStrippableTitles(["Song (Club Mix)", "Song (Radio Edit)"])).toEqual(
		[false, false]
	);
	// Explicit is removed first, so the plain title already exists
	expect(getStrippableTitles(["Song (Club Mix)", "Song (Explicit)"])).toEqual([
		false,
		false,
	]);
	expect(
		getStrippableTitles(["A (Street Version)", "B (Club Mix)", "C"])
	).toEqual([true, true, false]);
});

test("recognizes reprise tracks", () => {
	expect(isRepriseTitle("Love Theme (Reprise)")).toBe(true);
	expect(isRepriseTitle("Reprise")).toBe(true);
	expect(isRepriseTitle("Song [reprise]")).toBe(true);
	expect(isRepriseTitle("Song (Reprice)")).toBe(true);
	expect(isRepriseTitle("Comprise")).toBe(false);
	expect(isRepriseTitle("Song")).toBe(false);
});
