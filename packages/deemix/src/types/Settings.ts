export interface Tags {
	title?: boolean;
	artist?: boolean;
	album?: boolean;
	cover?: boolean;
	trackNumber?: boolean;
	albumArtist?: boolean;
	year?: boolean;
	bpm?: boolean;
	saveID3v1?: boolean;
	multiArtistSeparator?: string;
	singleAlbumArtist?: boolean;
	rating?: boolean;
}

export interface Settings {
	tags: Tags;
	executeCommand: string;
	downloadLocation: string;

	padSingleDigit?: boolean;
	fallbackISRC?: boolean;
	clearQueueOnExit?: boolean;
	feelingLucky?: boolean;
	padTracks?: boolean;
	paddingSize?: number;
	illegalCharacterReplacer?: string;
	queueConcurrency?: number;
	maxBitrate?: number;
	fallbackBitrate?: boolean;
	fallbackSearch?: boolean;
	logErrors?: boolean;
	logSearched?: boolean;
	saveDownloadQueue?: boolean;
	overwriteFile?: string;
	createM3U8File?: boolean;
	playlistFilenameTemplate?: string;
	syncedLyrics?: boolean;
	dateFormat?: string;
	albumVariousArtists?: boolean;
	removeDuplicateArtists?: boolean;
	tagsLanguage?: string;
	featuredToTitle?: string;
	titleCasing?: string;
	artistCasing?: string;
}
