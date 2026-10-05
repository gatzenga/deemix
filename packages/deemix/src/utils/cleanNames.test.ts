import { cleanAlbumName, cleanName } from "./cleanNames.js";

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
