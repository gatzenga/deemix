import { defineStore } from "pinia";

interface LoginState {
	arl: string;
	status: number | null;
	user: {
		id: string | null;
		name: string;
		picture: string;
		country?: string;
		can_stream_lossless?: boolean;
		can_stream_hq?: boolean;
	};
	clientMode: boolean;
}

export const useLoginStore = defineStore("login", {
	state: (): LoginState => ({
		arl: localStorage.getItem("arl") || "",
		status: null,
		user: {
			id: null,
			name: "",
			picture: "",
		},
		clientMode: false,
	}),
	getters: {
		isLoggedIn: (state) => !!state.arl,
	},
	actions: {
		login({ status, user, arl }: Pick<LoginState, "status" | "user" | "arl">) {
			this.user = user;
			this.status = status;

			this.setARL(arl);
		},
		logout() {
			localStorage.removeItem("arl");

			this.$reset();
		},
		setARL(arl: string, saveOnLocalStorage: boolean = true) {
			this.arl = arl;

			if (saveOnLocalStorage) {
				localStorage.setItem("arl", arl);
			}
		},
		removeARL() {
			this.arl = "";
			localStorage.removeItem("arl");
		},
		setUser(user: LoginState["user"]) {
			this.user = user;
		},
		setClientMode(clientMode: LoginState["clientMode"]) {
			this.clientMode = clientMode;
		},
	},
});
