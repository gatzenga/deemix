import { fetchData } from "@/utils/api-utils";
import { emitter } from "@/utils/emitter";
import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";

// Pages
import Errors from "@/views/ErrorsView.vue";
import Tracklist from "@/views/TracklistView.vue";

const Search = () => import("@/views/SearchView.vue");
const Settings = () => import("@/views/SettingsPage.vue");
const Artist = () => import("@/views/ArtistView.vue");
const LinkAnalyzer = () => import("@/views/LinkAnalyzer.vue");

const routes: RouteRecordRaw[] = [
	{
		path: "/tracklist/:type/:id",
		name: "Tracklist",
		component: Tracklist,
	},
	{
		path: "/artist/:id",
		name: "Artist",
		component: Artist,
		meta: {
			notKeepAlive: true,
		},
	},
	{
		path: "/album/:id",
		name: "Album",
		component: Tracklist,
	},
	{
		path: "/playlist/:id",
		name: "Playlist",
		component: Tracklist,
	},
	{
		path: "/errors",
		name: "Errors",
		component: Errors,
	},
	{
		path: "/link-analyzer",
		name: "Link Analyzer",
		component: LinkAnalyzer,
	},
	{
		path: "/settings",
		name: "Settings",
		component: Settings,
	},
	{
		path: "/search",
		name: "Search",
		component: Search,
		meta: {
			notKeepAlive: true,
		},
	},
	// Start page and 404 client side
	{
		path: "/:pathMatch(.*)*",
		redirect: { name: "Search" },
	},
];

const router = createRouter({
	history: createWebHistory(location.base),
	routes,
	scrollBehavior() {
		return { left: 0, right: 0 };
	},
});

router.beforeEach((to, _, next) => {
	if (to.name) {
		document.title = to.name.toString() + " · Deemix";
	} else {
		document.title = "Deemix";
	}

	switch (to.name) {
		case "Tracklist": {
			// const getTracklistParams = {
			// 	type: to.params.type,
			// 	id: to.params.id
			// }
			console.warn("This should never happen.");
			break;
		}
		case "Album": {
			const getTracklistParams = {
				type: "album",
				id: to.params.id,
			};
			fetchData("getTracklist", getTracklistParams).then((albumData) => {
				emitter.emit("showAlbum", albumData);
			});
			break;
		}
		case "Playlist": {
			const getTracklistParams = {
				type: "playlist",
				id: to.params.id,
			};
			fetchData("getTracklist", getTracklistParams).then((playlistData) => {
				emitter.emit("showPlaylist", playlistData);
			});
			break;
		}

		default:
			break;
	}

	next();
});

export default router;
