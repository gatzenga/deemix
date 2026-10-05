<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// On the settings page the button leads back to the search
const isSettings = computed(() => route.name === "Settings");
const target = computed(() => ({
	name: isSettings.value ? "Search" : "Settings",
}));
</script>

<template>
	<router-link
		:to="target"
		class="bg-primary text-grayscale-870 fixed bottom-4 left-4 z-40 grid h-12 w-12 place-items-center rounded-full no-underline shadow-lg transition-transform hover:scale-110"
		:aria-label="isSettings ? 'search' : 'settings'"
		:title="isSettings ? 'Back to search' : 'Settings'"
	>
		<i class="material-icons text-3xl">settings</i>
	</router-link>
</template>
