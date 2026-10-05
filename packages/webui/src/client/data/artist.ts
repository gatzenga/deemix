import { getPropertyWithFallback } from "@/utils/utils";
import { fetchData } from "@/utils/api-utils";

export function formatArtistData(artistData: {
	name?: string;
	picture_xl?: string;
	releases?: { [key: string]: any[] };
}) {
	return {
		artistName: Object.prototype.hasOwnProperty.call(artistData, "name")
			? artistData.name
			: undefined,
		artistPictureXL: Object.prototype.hasOwnProperty.call(
			artistData,
			"picture_xl"
		)
			? artistData.picture_xl
			: undefined,
		artistReleases: Object.prototype.hasOwnProperty.call(artistData, "releases")
			? formatArtistReleases(artistData.releases)
			: undefined,
	};
}

interface ArtistRelease {
	releaseID: string;
	releaseCover: string;
	releaseTitle: string;
	releaseDate: string;
	releaseYear: string;
	releaseTracksNumber: number;
	releaseLink: string;
	releaseType: string;
	isReleaseExplicit: boolean;
}

// Deezer gives several dates per album. The original release date is the one
// that matches the real release, the physical and digital dates are often the
// date of a re-release.
function getReleaseDate(release: Record<string, any>) {
	const candidates = [
		release.original_release_date,
		release.release_date,
		release.digital_release_date,
	];

	return (
		candidates.find(
			(date) => typeof date === "string" && /^[1-9]\d{3}-/.test(date)
		) ?? ""
	);
}

// Release tabs shown on the artist page, in this order
const ARTIST_RELEASE_TABS = ["album", "more", "single", "ep"];

function formatArtistReleases(
	artistReleases: { [key: string]: any[] } | undefined
) {
	const formattedReleases: Record<string, ArtistRelease[]> = {};

	for (const releaseType of ARTIST_RELEASE_TABS) {
		const releases = artistReleases?.[releaseType];
		if (!releases) continue;
		formattedReleases[releaseType] = [];

		for (const release of releases) {
			formattedReleases[releaseType].push({
				releaseID: getPropertyWithFallback(release, "id"),
				releaseCover: getPropertyWithFallback(release, "cover_small"),
				releaseTitle: getPropertyWithFallback(release, "title"),
				releaseDate: getReleaseDate(release),
				releaseYear: getReleaseDate(release).slice(0, 4),
				releaseTracksNumber: getPropertyWithFallback(release, "nb_tracks"),
				releaseLink: getPropertyWithFallback(release, "link"),
				releaseType: getPropertyWithFallback(release, "record_type"),
				isReleaseExplicit: getPropertyWithFallback(release, "explicit_lyrics"),
			});
		}
	}

	return formattedReleases;
}

export function getArtistData(artistID?: string) {
	return fetchData("getTracklist", {
		type: "artist",
		id: artistID,
	});
}
