// Removes unwanted terms (and everything that belongs to them, like a year,
// the featured artist or the surrounding brackets) from track and album
// titles.
//
// Every rule can be matched in up to three forms:
//  - in brackets of any kind:       "Song (feat. X)", "Song [feat. X]"
//  - after a dash or colon:         "Song - feat. X", "Song - 2011 Remaster"
//  - as bare words after the title: "Song feat. X", "Song Remastered 2014"
//
// To strip something else, add a rule to RULES.

interface Rule {
	// Regex source of the unwanted term, matched case insensitive
	term: string;
	// Bracket form: if true the term must be the first word in the bracket
	// ("(with X)" but not "(Live with Orchestra)")
	bracketStart?: boolean;
	// Dash / colon form
	separated?: boolean;
	// Bare form: "term" removes the term and a trailing year or version word,
	// "rest" removes everything up to the next dash or bracket,
	// "end" removes the term (and following filler words) at the end of the name
	bare?: "term" | "rest" | "end";
	// Leave brackets and segments alone that contain this regex source
	exclude?: string;
	// Only applied to album names, not to track titles
	albumOnly?: boolean;
}

const L = String.raw`\p{L}`;
const N = String.raw`\p{N}`;

const EDITION_NOUN = String.raw`(?:edition|version|release|reissue|pressing)`;
const EDITION_TERM = String.raw`(?:(?:super\s+)?de\s?luxe(?:\s+${EDITION_NOUN})?|expanded(?:\s+${EDITION_NOUN})?|(?:special|standard|collector'?s?|limited|extended|enhanced|ultimate|platinum|gold|premium|international|complete|definitive|legacy|us|uk|japan(?:ese)?)\s+${EDITION_NOUN})(?![${L}${N}])`;

// Bonus markers: "Bonus Track", "Bonus-Track", "Bonustrack", "iTunes Bonus Track",
// "Japanese Bonus Track", "Hidden Track", "Bonus Disc", "Titre Bonus", ...
const BONUS_PREFIX = String.raw`(?:(?:digital(?:[-\s]only)?|itunes|apple\s+music|amazon|spotify|deezer|japan(?:ese)?|us|uk|european|eu|international|hidden|secret|exclusive|deluxe|special|extra|additional|new|studio|cd|vinyl|lp|dvd|download|pre-?order|limited|streaming|online|web|store|retail|target|walmart|best\s+buy)[-\s]+)*`;
const BONUS_CORE = String.raw`bonus(?:[-\s]?(?:tracks?|titles?|titel|songs?|cuts?|material|content|disc|disk|cd|dvd|version|edition|feature|recordings?|release|single|remix|mix|only))*|(?:titre|piste|morceau|pista|canci[oó]n|brano|traccia)\s+(?:bonus|extra)|(?:hidden|secret|extra|additional)[-\s]+(?:track|song|cut)s?`;
const BONUS_TERM = String.raw`${BONUS_PREFIX}(?:${BONUS_CORE})(?![${L}${N}])`;

const RULES: Rule[] = [
	// remaster, remastered, re-mastered, remasterizado, remasterisé, ...,
	// digitally mastered, HD mastered, 24-bit mastered
	{
		term: String.raw`re[-\s]?master${L}*|(?:digital(?:ly)?|hd|24[-\s]?bit)\s+master(?:ed)?`,
		separated: true,
		bare: "term",
	},

	// Featured artists: feat., feat, ft., ft, featuring, f/
	{
		term: String.raw`featuring|feat\.?|ft\.?|f/`,
		separated: true,
		bare: "rest",
	},

	// Featured artists written with a preposition, only at the start of a
	// bracket: (with X), [w/ X], (avec X), (con X), (mit X), (duet with X)
	{
		term: String.raw`(?:(?:duet|duo|dúo)\s+)?(?:with|avec|con|mit)(?![${L}${N}])|w/`,
		bracketStart: true,
	},

	// Bonus track markers on tracks and albums, in brackets, after a dash or at
	// the end: "Song (Bonus Track)", "Song - Bonus Track", "Song Bonus Track"
	{
		term: BONUS_TERM,
		separated: true,
		bare: "end",
	},

	// Special editions: (Deluxe Edition), [Expanded Edition], (Special Edition),
	// (Standard Edition), - Deluxe Version, ...
	// Anniversary editions are different releases and stay untouched.
	{
		term: EDITION_TERM,
		separated: true,
		exclude: String.raw`anniversar|aniversar|jubil`,
	},

	// The same edition at the end of an album name: "Album Deluxe Edition"
	{
		term: EDITION_TERM,
		bare: "end",
		exclude: String.raw`anniversar|aniversar|jubil`,
		albumOnly: true,
	},

	// Album version: (Album Version), [LP Version], - Album Edit, (Original Album Version)
	{
		term: String.raw`(?:original\s+)?(?:album|lp)\s+(?:version|mix|edit)`,
		separated: true,
		bare: "term",
	},
];

const OPEN = String.raw`[(\[{（［｛【〔]`;
const CLOSE = String.raw`[)\]}）］｝】〕]`;
const INSIDE = String.raw`[^()\[\]{}（）［］｛｝【】〔〕]`;
const DASH = "[-–—]";
// Text up to the next " - " that contains no brackets
const SEGMENT = String.raw`(?:(?!\s${DASH}\s)${INSIDE})`;
const YEAR = String.raw`(?:19|20)\d{2}`;
const WORD_START = String.raw`(?<![${L}${N}])`;

function buildRegexes(rule: Rule) {
	const t = String.raw`${WORD_START}(?:${rule.term})`;
	const regexes: RegExp[] = [];

	const notExcluded = rule.exclude
		? String.raw`(?!${INSIDE}*?(?:${rule.exclude}))`
		: "";

	// Brackets, repeated by the caller for nested or multiple occurrences
	regexes.push(
		new RegExp(
			rule.bracketStart
				? String.raw`\s*${OPEN}${notExcluded}\s*(?:${rule.term})${INSIDE}*?${CLOSE}`
				: String.raw`\s*${OPEN}${notExcluded}${INSIDE}*?${t}${INSIDE}*?${CLOSE}`,
			"giu"
		)
	);

	if (rule.separated) {
		regexes.push(
			new RegExp(
				String.raw`(?:\s+[-–—|]\s+|\s*:\s+)${notExcluded}${SEGMENT}*?${t}${SEGMENT}*`,
				"giu"
			)
		);
	}

	if (rule.bare === "term") {
		regexes.push(
			new RegExp(
				String.raw`\s*(?:${WORD_START}${YEAR}\s+)?${t}(?:\s+(?:version|edition|mix|mono|stereo|${YEAR}))*`,
				"giu"
			)
		);
	} else if (rule.bare === "end") {
		regexes.push(
			new RegExp(
				String.raw`\s*(?:(?:with|and|w/|[&+])\s+)?${t}(?:(?:\s+|\s*[,&+/]\s*)(?:with|and|w/|${t}))*\s*$`,
				"giu"
			)
		);
	} else if (rule.bare === "rest") {
		// The term has to be a separate word followed by a space or colon
		regexes.push(
			new RegExp(
				String.raw`\s+${t}(?=[\s:])(?:(?!\s${DASH}\s)${INSIDE})*`,
				"giu"
			)
		);
	}

	return regexes;
}

const COMPILED = RULES.map((rule) => ({
	albumOnly: rule.albumOnly ?? false,
	regexes: buildRegexes(rule),
}));

// Cleans a track title
export function cleanName(name: string) {
	return clean(name, false);
}

// Cleans an album title, which also loses its edition (Deluxe, Expanded, ...)
export function cleanAlbumName(name: string) {
	return clean(name, true);
}

function clean(name: string, isAlbum: boolean) {
	if (!name) return name;

	let result = name;

	for (const {
		albumOnly,
		regexes: [bracketed, ...others],
	} of COMPILED) {
		if (albumOnly && !isAlbum) continue;

		// Repeat for nested or multiple occurrences
		let previous: string;
		do {
			previous = result;
			result = result.replace(bracketed, "");
		} while (result !== previous);

		for (const regex of others) {
			result = result.replace(regex, "");
		}
	}

	// Leave names without any unwanted term completely untouched
	if (result === name) return name;

	result = result
		// Leftover empty brackets
		.replace(new RegExp(String.raw`\s*${OPEN}\s*${CLOSE}`, "gu"), "")
		.replace(/\s{2,}/g, " ")
		// A bracket that lost its space to a removed part
		.replace(new RegExp(String.raw`(\S)(${OPEN})`, "gu"), "$1 $2")
		// Dangling separators at the start or the end
		.replace(/^[\s\-–—:|,/]+|[\s\-–—:|,/]+$/g, "");

	// Never return an empty name
	return result === "" ? name : result;
}
