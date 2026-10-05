import { ID3Writer } from "browser-id3-writer";
import Metaflac from "metaflac-js2";
import fs from "fs";
import Track from "./types/Track.js";
import type { Tags } from "@/types/Settings.js";

function tagID3(path: string, track: Track, save: Tags) {
	const songBuffer = fs.readFileSync(path);
	const writer = new ID3Writer(songBuffer.buffer);

	if (save.title) writer.setFrame("TIT2", track.title);

	if (save.artist && track.artists.length) {
		if (save.multiArtistSeparator === "default") {
			writer.setFrame("TPE1", track.artists);
		} else {
			if (save.multiArtistSeparator === "nothing") {
				writer.setFrame("TPE1", [track.mainArtist.name]);
			} else {
				writer.setFrame("TPE1", [track.artistsString]);
			}
		}
	}

	if (save.album) writer.setFrame("TALB", track.album.title);

	if (save.albumArtist && track.album.artists.length) {
		if (save.singleAlbumArtist && track.album.mainArtist.save) {
			writer.setFrame("TPE2", track.album.mainArtist.name);
		} else {
			writer.setFrame("TPE2", track.album.artists.join(", "));
		}
	}

	if (save.trackNumber) writer.setFrame("TRCK", String(track.trackNumber));

	if (save.year) writer.setFrame("TYER", Number(track.date.year));

	if (save.bpm && track.bpm) writer.setFrame("TBPM", track.bpm);
	if (track.album.recordType === "compile") {
		writer.setFrame("TCMP", "1");
	}

	// if (save.rating) {
	// 	let rank = (track.rank / 10000) * 2.55;
	// 	rank = rank > 255 ? 255 : Math.round(rank);
	// 	writer.setFrame("POPM", {
	// 		rating: rank,
	// 	});
	// }

	if (save.cover && track.album.embeddedCoverPath) {
		const coverArrayBuffer = fs.readFileSync(track.album.embeddedCoverPath);
		if (coverArrayBuffer.length !== 0) {
			writer.setFrame("APIC", {
				type: 3,
				data: coverArrayBuffer.buffer,
				description: "cover",
				useUnicodeEncoding: false,
			});
		}
	}

	let taggedSongBuffer = Buffer.from(writer.addTag());
	if (taggedSongBuffer.slice(-128, -125).toString() === "TAG") {
		taggedSongBuffer = taggedSongBuffer.slice(0, -128);
	}
	if (save.saveID3v1) {
		taggedSongBuffer = tagID3v1(taggedSongBuffer, track, save);
	}

	fs.writeFileSync(path, taggedSongBuffer);
}

function tagFLAC(path, track, save) {
	const flac = new Metaflac(path);
	flac.removeAllTags();

	if (save.title) flac.setTag(`TITLE=${track.title}`);

	if (save.artist && track.artists.length) {
		if (save.multiArtistSeparator === "default") {
			track.artists.forEach((artist) => {
				flac.setTag(`ARTIST=${artist}`);
			});
		} else {
			if (save.multiArtistSeparator === "nothing") {
				flac.setTag(`ARTIST=${track.mainArtist.name}`);
			} else {
				flac.setTag(`ARTIST=${track.artistsString}`);
			}
		}
	}

	if (save.album) flac.setTag(`ALBUM=${track.album.title}`);

	if (save.albumArtist && track.album.artists.length) {
		if (save.singleAlbumArtist && track.album.mainArtist.save) {
			flac.setTag(`ALBUMARTIST=${track.album.mainArtist.name}`);
		} else {
			track.album.artists.forEach((artist) => {
				flac.setTag(`ALBUMARTIST=${artist}`);
			});
		}
	}

	if (save.trackNumber) flac.setTag(`TRACKNUMBER=${track.trackNumber}`);

	if (save.year) flac.setTag(`DATE=${track.date.year}`);

	if (save.bpm && track.bpm) flac.setTag(`BPM=${track.bpm}`);

	if (track.album.recordType === "compile") {
		flac.setTag("COMPILATION=1");
	}

	if (save.rating) {
		const rank = Math.round(track.rank / 10000);
		flac.setTag(`RATING=${rank}`);
	}

	if (save.cover && track.album.embeddedCoverPath) {
		const picture = fs.readFileSync(track.album.embeddedCoverPath);
		if (picture.length !== 0) flac.importPicture(picture);
	}

	flac.save();
}

// Filters only Extended Ascii characters
function extAsciiFilter(string) {
	let output = "";
	string.split("").forEach((x) => {
		if (x.charCodeAt(0) > 255) {
			output += "?";
		} else {
			output += x;
		}
	});
	return output;
}

function tagID3v1(taggedSongBuffer, track, save) {
	const tagBuffer = Buffer.alloc(128);

	tagBuffer.write("TAG", 0); // Header
	if (save.title) {
		const trimmedTitle = extAsciiFilter(track.title.substring(0, 30));
		tagBuffer.write(trimmedTitle, 3);
	}
	if (save.artist) {
		let selectedArtist;
		if (track.artistsString) selectedArtist = track.artistsString;
		else selectedArtist = track.mainArtist.name;

		const trimmedArtist = extAsciiFilter(selectedArtist.substring(0, 30));
		tagBuffer.write(trimmedArtist, 33);
	}
	if (save.album) {
		const trimmedAlbum = extAsciiFilter(track.album.title.substring(0, 30));
		tagBuffer.write(trimmedAlbum, 63);
	}
	if (save.year) {
		const trimmedYear = track.date.year.substring(0, 4);
		tagBuffer.write(trimmedYear, 93);
	}
	if (save.trackNumber) {
		if (track.trackNumber <= 65535) {
			if (track.trackNumber > 255) {
				tagBuffer.writeUInt8(track.trackNumber >> 8, 125);
				tagBuffer.writeUInt8(track.trackNumber & 255, 126);
			} else {
				tagBuffer.writeUInt8(parseInt(track.trackNumber), 126);
			}
		}
	}
	tagBuffer.writeUInt8(255, 127); // No genre

	// Save tags
	const buffer = new ArrayBuffer(taggedSongBuffer.byteLength + 128);
	const bufferWriter = new Uint8Array(buffer);
	bufferWriter.set(new Uint8Array(taggedSongBuffer), 0);
	bufferWriter.set(new Uint8Array(tagBuffer), taggedSongBuffer.byteLength);
	return Buffer.from(buffer);
}

export { tagID3, tagFLAC, tagID3v1 };
