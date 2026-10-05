<script setup lang="ts">
import BaseTab from "@/components/globals/BaseTab.vue";
import BaseTabs from "@/components/globals/BaseTabs.vue";
import { formatArtistData, getArtistData } from "@/data/artist";
import { checkNewRelease } from "@/utils/dates";
import { sendAddToQueue } from "@/utils/downloads";
import { orderBy } from "lodash-es";
import { computed, reactive, ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const router = useRouter();
const { t } = useI18n();

const head = ref([
	{
		title: t("globals.listTabs.title", 1),
		sortKey: "releaseTitle",
	},
	{
		title: t("globals.listTabs.year"),
		sortKey: "releaseDate",
	},
	{
		title: t("globals.listTabs.track", 2),
		sortKey: "releaseTracksNumber",
	},
	// { title: '', width: '32px' }
	{ title: "", width: null },
]);

interface State {
	currentTab: string;
	sortKey: string | ((o: any) => number);
	sortOrder: "asc" | "desc";
	artistReleases: Record<string, any[]>;
	artistName: string;
	artistPicture: string;
	currentRelease: any;
}

const state: State = reactive<State>({
	currentTab: "",
	sortKey: "releaseDate",
	sortOrder: "desc",
	artistReleases: {},
	artistName: "",
	artistPicture: "",
	currentRelease: computed(() => state.artistReleases[state.currentTab]),
});

const headerStyle = computed(() => ({
	backgroundImage: `linear-gradient(to bottom, transparent 0%, var(--main-background) 100%), url(${state.artistPicture})`,
}));

const artistID = computed(() => router.currentRoute.value.params.id);
const hasDataLoaded = ref(false);

function sortBy(key?: string) {
	if (key === state.sortKey) {
		state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
	} else {
		state.sortKey = key;
		state.sortOrder = "asc";
	}
}

getArtistData(unref(artistID.value.toString()))
	.then((artistData) => {
		hasDataLoaded.value = true;

		const { artistName, artistPictureXL, artistReleases } =
			formatArtistData(artistData);

		Object.assign(state, {
			artistName,
			artistPicture: artistPictureXL,
			artistReleases,
			currentTab: artistReleases ? Object.keys(artistReleases)[0] : 0,
		});
	})
	.catch((err) => console.error(err));

const sortedData = computed(() => {
	if (!unref(hasDataLoaded)) {
		return [];
	}

	let sortKey = state.sortKey;

	if (sortKey === "releaseTracksNumber") {
		sortKey = (o) => Number(o.releaseTracksNumber);
	}

	return orderBy(state.currentRelease, sortKey, state.sortOrder);
});
</script>

<template>
	<div class="fixed-footer image-header relative">
		<header class="flex items-center" :style="headerStyle">
			<h1 class="m-0">{{ state.artistName }}</h1>
		</header>

		<BaseTabs>
			<BaseTab
				v-for="(item, name) in state.artistReleases"
				:key="name"
				:class="{ active: state.currentTab === name }"
				@click="state.currentTab = name"
			>
				{{ t(`globals.listTabs.${name}`, 2) }}
			</BaseTab>
		</BaseTabs>

		<table class="table">
			<thead>
				<tr>
					<th
						v-for="data in head"
						:key="data.title"
						:style="{ width: data.width ? data.width : 'auto' }"
						class="uppercase-first-letter"
						:class="{
							'sort-asc':
								data.sortKey === state.sortKey && state.sortOrder == 'asc',
							'sort-desc':
								data.sortKey === state.sortKey && state.sortOrder == 'desc',
							sortable: data.sortKey,
							'cursor-pointer': data.sortKey,
						}"
						@click="
							typeof data.sortKey === 'string' ? sortBy(data.sortKey) : null
						"
					>
						<!-- Need to change this behaviour for translations -->
						{{ data.title }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="release in sortedData" :key="release.releaseID">
					<router-link
						v-slot="{ navigate }"
						custom
						:data-cm-link="release.releaseLink"
						:to="{ name: 'Album', params: { id: release.releaseID } }"
					>
						<td
							role="link"
							class="flex cursor-pointer items-center"
							@click="navigate"
							@keypress.enter="() => navigate()"
						>
							<img
								class="coverart mr-4 rounded"
								:src="release.releaseCover"
								style="width: 56px; height: 56px"
							/>
							<i
								v-if="release.isReleaseExplicit"
								class="material-icons title-icon title-icon--explicit"
								>explicit</i
							>
							<div>
								<span class="hover:text-primary flex">
									{{ release.releaseTitle }}
									<i
										v-if="checkNewRelease(release.releaseDate)"
										class="material-icons title-icon title-icon--right title-icon--new"
									>
										fiber_new
									</i>
								</span>
							</div>
						</td>
					</router-link>
					<td class="w-32 text-center xl:w-40">{{ release.releaseYear }}</td>
					<td class="w-20 text-center xl:w-32">
						{{ release.releaseTracksNumber }}
					</td>
					<td
						:data-cm-link="release.releaseLink"
						class="w-8 cursor-pointer"
						@click.stop="sendAddToQueue(release.releaseLink)"
					>
						<i
							class="material-icons hover:text-primary"
							:title="t('globals.download_hint').toString()"
							>file_download</i
						>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
