import { defineStore } from "pinia";

interface AppInfoState {
	webuiVersion?: string;
	deemixVersion?: string;
	guiVersion?: string;
	previewVolume: number;
	isMobileDownloadsOpen: boolean;
}

export const useAppInfoStore = defineStore("appInfo", {
	state: (): AppInfoState => ({
		previewVolume: 80,
		isMobileDownloadsOpen: false,
	}),
	actions: {
		setAppInfo(payload: AppInfoState) {
			this.webuiVersion = payload.webuiVersion;
			this.deemixVersion = payload.deemixVersion;
			this.guiVersion = payload.guiVersion;
		},
		toggleMobileDownloads() {
			this.isMobileDownloadsOpen = !this.isMobileDownloadsOpen;
		},
		closeMobileDownloads() {
			this.isMobileDownloadsOpen = false;
		},
	},
});
