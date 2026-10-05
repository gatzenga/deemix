import { defineStore } from "pinia";

interface AppInfoState {
	webuiVersion?: string;
	deemixVersion?: string;
	guiVersion?: string;
	previewVolume: number;
	isMobileSidebarOpen: boolean;
	isMobileDownloadsOpen: boolean;
}

export const useAppInfoStore = defineStore("appInfo", {
	state: (): AppInfoState => ({
		previewVolume: 80,
		isMobileSidebarOpen: false,
		isMobileDownloadsOpen: false,
	}),
	actions: {
		setAppInfo(payload: AppInfoState) {
			this.webuiVersion = payload.webuiVersion;
			this.deemixVersion = payload.deemixVersion;
			this.guiVersion = payload.guiVersion;
		},
		toggleMobileSidebar() {
			this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
		},
		closeMobileSidebar() {
			this.isMobileSidebarOpen = false;
		},
		toggleMobileDownloads() {
			this.isMobileDownloadsOpen = !this.isMobileDownloadsOpen;
		},
		closeMobileDownloads() {
			this.isMobileDownloadsOpen = false;
		},
	},
});
