<script setup>
	import { watch, onMounted, onUnmounted } from 'vue';
	import { useCounter } from '@/composables/useCount';
	const { count, increment, decrement } = useCounter();

	defineProps({
		msg: {
			type: String,
			required: true,
		},
	});

	watch(count, () => console.log("changed"));
    onMounted(() => console.log("MOUNTED"));
    onUnmounted(() => console.log("UNMOUNTED"));
</script>

<template>
	<div class="greetings">
		<h1 class="green">{{ msg }}</h1>
		<h3>
			You’ve successfully created a project with
			<a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> +
			<a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
		</h3>
		<button @click="increment(2)">increment</button>
		<button @click="decrement()">decrement</button>
		<div :key="count">count = {{ count }}</div>
	</div>
</template>

<style lang="css" src="./style.css" scoped></style>