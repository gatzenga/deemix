<script setup lang="ts">
import BaseAccordion from "@/components/globals/BaseAccordion.vue";
import { getSettingsData } from "@/data/settings";
import { pinia } from "@/stores";
import { useLoginStore } from "@/stores/login";
import { fetchData, postToServer } from "@/utils/api-utils";
import { socket } from "@/utils/socket";
import { toast } from "@/utils/toasts";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const loginStore = useLoginStore(pinia);

const { t } = useI18n();

const loginInput = ref<HTMLInputElement | null>(null);
const username = ref<HTMLElement | null>(null);
const userpicture = ref<HTMLImageElement | null>(null);

const initialSettings = {
	tags: {},
	executeCommand: "",
	downloadLocation: "",
};

const settings = ref<any>(initialSettings);
const lastSettings = ref<any>(initialSettings);
const defaultSettings = ref({});
const storedAccountNum = localStorage.getItem("accountNum");
const accountNum = ref(
	isNaN(parseInt(storedAccountNum)) ? parseInt(storedAccountNum) : 0
);
const accounts = ref([]);

const arl = computed(() => loginStore.arl);
const user = computed(() => loginStore.user);
const isLoggedIn = computed(() => loginStore.isLoggedIn);
const clientMode = computed(() => loginStore.clientMode);
const pictureHref = computed(() => {
	// Default image: https://e-cdns-images.dzcdn.net/images/user/125x125-000000-80-0-0.jpg
	return `https://e-cdns-images.dzcdn.net/images/user/${user.value.picture}/125x125-000000-80-0-0.jpg`;
});
const userLicense = computed(() => {
	if (user.value.can_stream_lossless) return "Hi-Fi";
	else if (user.value.can_stream_hq) return "Premium";
	else return "Free";
});

onMounted(async () => {
	const { settingsData, defaultSettingsData } = await getSettingsData();

	defaultSettings.value = defaultSettingsData;
	initSettings(settingsData);

	socket.on("updateSettings", updateSettings);
	// socket.on('accountChanged', accountChanged)
	socket.on("familyAccounts", initAccounts);

	if (clientMode.value) {
		window.api.receive("downloadFolderSelected", downloadFolderSelected);
		window.api.receive("applogin_arl", loggedInViaDeezer);
	}
});

onUnmounted(() => {
	socket.off("updateSettings");
	// socket.off('accountChanged')
	socket.off("familyAccounts");
});

function copyARLtoClipboard() {
	const copyText = loginInput.value;

	copyText.setAttribute("type", "text");
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
	copyText.setAttribute("type", "password");

	toast(t("settings.toasts.ARLcopied"), "assignment");
}

function saveSettings() {
	lastSettings.value = settings.value;

	socket.emit("saveSettings", { settings: settings.value });
}
function selectDownloadFolder() {
	window.api.send("selectDownloadFolder", settings.value.downloadLocation);
}
function downloadFolderSelected(folder) {
	settings.value.downloadLocation = folder;
}
function loadSettings(data) {
	lastSettings.value = JSON.parse(JSON.stringify(data));
	settings.value = JSON.parse(JSON.stringify(data));
}

function loggedInViaDeezer(arl: string) {
	loginStore.setARL(arl);
}

async function login(arl: string, force = false) {
	toast(t("toasts.loggingIn"), "loading", false, "login-toast");
	const data = await postToServer("loginArl", {
		arl,
		force,
		child: accountNum.value,
	});
	const { status, user, childs, currentChild } = data;
	accounts.value = childs;
	accountNum.value = currentChild;
	switch (status) {
		case 1:
		case 3:
			// Login ok
			toast(t("toasts.loggedIn"), "done", true, "login-toast");
			loginStore.login(data);
			break;
		case 2:
			// Already logged in
			toast(t("toasts.alreadyLogged"), "done", true, "login-toast");
			loginStore.setUser(user);
			break;
		case 0:
			// Login failed
			toast(
				t(
					data.error === "invalidArl"
						? "toasts.invalidArl"
						: "toasts.loginFailed"
				),
				"close",
				true,
				"login-toast"
			);
			loginStore.removeARL();
			break;
		case -1:
			toast(t("toasts.deezerNotAvailable"), "close", true, "login-toast");
	}
}
function loginButton() {
	const newArl = loginInput.value.value.trim();
	if (newArl && newArl !== arl.value) {
		login(newArl, true);
	}
}

async function changeAccount() {
	const [user, newAccountNum] = await fetchData(
		"changeAccount",
		{ child: accountNum.value },
		"POST"
	);

	accountChanged(user, newAccountNum);
}
function accountChanged(user, newAccountNum) {
	username.value.innerText = user.name;
	userpicture.value.src = `https://e-cdns-images.dzcdn.net/images/user/${user.picture}/125x125-000000-80-0-0.jpg`;
	accountNum.value = newAccountNum;
	localStorage.setItem("accountNum", newAccountNum);
}

function initAccounts(initAccounts: any[]) {
	accounts.value = initAccounts;
}

async function logout() {
	const result = await postToServer("logout");

	if (result.logged_out) {
		toast(t("toasts.loggedOut"), "done", true, "login-toast");
		loginStore.logout();
	}
}

function initSettings(settings) {
	loadSettings(settings);

	toast(t("settings.toasts.init"), "settings");
}

function updateSettings(data) {
	loadSettings(data.settings);

	toast(t("settings.toasts.update"), "settings");
}

function resetToDefault() {
	const wantsToReset = confirm(t("settings.resetMessage"));

	if (!wantsToReset) return;

	settings.value = JSON.parse(JSON.stringify(defaultSettings.value));
	toast(t("settings.toasts.reset"), "settings");
}
</script>

<template>
	<div class="fixed-footer">
		<h1 class="mb-8 text-5xl">{{ t("settings.title") }}</h1>

		<div class="settings-group">
			<h3 class="settings-group__header">
				<i class="material-icons">person</i>{{ t("settings.login.title") }}
			</h3>

			<div v-if="isLoggedIn" id="logged_in_info" ref="loggedInInfo">
				<img
					id="settings_picture"
					ref="userpicture"
					:src="pictureHref"
					alt="Profile Picture"
					class="h-32 w-32 rounded-full"
				/>
				<div class="user_info">
					<i18n-t keypath="settings.login.loggedIn" tag="p">
						<template #username>
							<strong id="settings_username" ref="username">{{
								user.name || "not logged"
							}}</strong>
						</template>
					</i18n-t>
					<p>{{ userLicense }} | {{ user.country }}</p>

					<button class="btn btn-primary mt-3" @click="logout">
						{{ t("settings.login.logout") }}
					</button>
				</div>
				<select
					v-if="accounts.length > 1"
					id="family_account"
					v-model="accountNum"
					@change="changeAccount"
				>
					<option
						v-for="(account, i) in accounts"
						:key="account"
						:value="i.toString()"
					>
						{{ account.name }}
					</option>
				</select>
			</div>

			<div class="my-5 space-y-5">
				<span>{{ t("settings.login.arl.title") }}</span>
				<div class="flex items-center">
					<input
						id="login_input_arl"
						ref="loginInput"
						:value="arl"
						autocomplete="off"
						placeholder="ARL"
						type="password"
					/>
					<button
						class="btn btn-primary btn-only-icon ml-2"
						@click="copyARLtoClipboard"
					>
						<i class="material-icons">assignment</i>
					</button>
				</div>

				<button
					class="btn btn-primary"
					style="width: 100%"
					@click="loginButton"
				>
					{{ t("settings.login.arl.update") }}
				</button>
			</div>
		</div>

		<BaseAccordion class="settings-group">
			<template #title>
				<h3 class="settings-group__header">
					<i class="material-icons">folder</i
					>{{ t("settings.downloadPath.title") }}
				</h3>
			</template>

			<div class="flex items-center">
				<input
					v-model="settings.downloadLocation"
					autocomplete="off"
					type="text"
				/>
				<button
					v-if="clientMode"
					class="btn btn-primary btn-only-icon ml-2"
					@click="selectDownloadFolder"
				>
					<i class="material-icons">folder</i>
				</button>
			</div>
		</BaseAccordion>

		<BaseAccordion class="settings-group">
			<template #title>
				<h3 class="settings-group__header">
					<i class="material-icons">title</i
					>{{ t("settings.trackTitles.title") }}
				</h3>
			</template>

			<div class="settings-container space-x-5">
				<div
					class="settings-container__third settings-container__third--only-checkbox"
				>
					<label class="with-checkbox">
						<input v-model="settings.padTracks" type="checkbox" />
						<span class="checkbox-text">{{
							t("settings.trackTitles.padTracks")
						}}</span>
					</label>
				</div>
				<div class="settings-container__third">
					<div class="input-group">
						<p class="input-group-text">
							{{ t("settings.trackTitles.paddingSize") }}
						</p>
						<input v-model="settings.paddingSize" max="10" type="number" />
					</div>
				</div>
				<div class="settings-container__third">
					<div class="input-group">
						<p class="input-group-text">
							{{ t("settings.trackTitles.illegalCharacterReplacer") }}
						</p>
						<input v-model="settings.illegalCharacterReplacer" type="text" />
					</div>
				</div>
			</div>
		</BaseAccordion>

		<BaseAccordion class="settings-group">
			<template #title>
				<h3 class="settings-group__header">
					<i class="material-icons" style="width: 1em; height: 1em">bookmarks</i
					>{{ t("settings.tags.head") }}
				</h3>
			</template>

			<div class="settings-container space-x-5">
				<div class="settings-container__half">
					<label class="with-checkbox">
						<input v-model="settings.tags.title" type="checkbox" />
						<span class="checkbox-text">{{ t("settings.tags.title") }}</span>
					</label>
					<label class="with-checkbox">
						<input v-model="settings.tags.artist" type="checkbox" />
						<span class="checkbox-text">{{ t("settings.tags.artist") }}</span>
					</label>
					<label class="with-checkbox">
						<input v-model="settings.tags.album" type="checkbox" />
						<span class="checkbox-text">{{ t("settings.tags.album") }}</span>
					</label>
					<label class="with-checkbox">
						<input v-model="settings.tags.cover" type="checkbox" />
						<span class="checkbox-text">{{ t("settings.tags.cover") }}</span>
					</label>
					<label class="with-checkbox">
						<input v-model="settings.tags.trackNumber" type="checkbox" />
						<span class="checkbox-text">{{
							t("settings.tags.trackNumber")
						}}</span>
					</label>
				</div>

				<div class="settings-container__half">
					<label class="with-checkbox">
						<input v-model="settings.tags.albumArtist" type="checkbox" />
						<span class="checkbox-text">{{
							t("settings.tags.albumArtist")
						}}</span>
					</label>
					<label class="with-checkbox">
						<input v-model="settings.tags.year" type="checkbox" />
						<span class="checkbox-text">{{ t("settings.tags.year") }}</span>
					</label>
					<label class="with-checkbox">
						<input v-model="settings.tags.bpm" type="checkbox" />
						<span class="checkbox-text">{{ t("settings.tags.bpm") }}</span>
					</label>
				</div>
			</div>
		</BaseAccordion>

		<footer class="bg-background-main">
			<button class="btn btn-primary mr-2" @click="resetToDefault">
				{{ t("settings.reset") }}
			</button>
			<button class="btn btn-primary" @click="saveSettings">
				{{ t("settings.save") }}
			</button>
		</footer>
	</div>
</template>

<style scoped>
#logged_in_info {
	display: grid;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	grid-template-columns: 128px auto;
	grid-template-rows: auto auto;
}

#logged_in_info .user_info {
	padding-left: 24px;
}

#family_account {
	margin-top: 24px;
	grid-column: 1 / span 2;
}

.settings-group {
	border-top-width: 1px;
	border-color: hsl(0, 0%, 50%);
}

.settings-group__header {
	display: inline-flex;
	align-items: center;
	padding-top: 2rem;
	padding-bottom: 2rem;
	font-size: 1.5rem;
}
.settings-group__header i.material-icons {
	margin-right: 1rem;
}

.settings-container {
	display: flex;
}
.settings-container__half {
	width: 50%;
}
.settings-container__third {
	width: 33%;
}
.settings-container__third--only-checkbox {
	display: flex;
	align-items: flex-start;
	flex-direction: column;
	justify-content: center;
}
.settings-container__half > *,
.settings-container__third > * {
	margin-bottom: 1rem;
}

.with-checkbox {
	display: flex;
	align-items: center;
}
.with-checkbox [type="checkbox"] {
	cursor: pointer;
}
.with-checkbox .checkbox-text {
	margin-left: 10px;
	cursor: pointer;
	user-select: none;
}

.input-group .input-group-text {
	margin-bottom: 0.5rem;
}

.login-button {
	display: block;
	margin-left: auto;
	padding-left: 24px;
	padding-right: 24px;
	margin-top: 0px;
}
</style>
