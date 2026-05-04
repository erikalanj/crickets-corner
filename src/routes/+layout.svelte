<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import pawprints from '$lib/assets/pawprints-removebg-preview.png';
	import '../app.css';
	import Footer from '../components/Footer/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Decorative paw print trails -->
<div class="paw-decoration left">
	<img src={pawprints} alt="" />
</div>
<div class="paw-decoration right">
	<img src={pawprints} alt="" />
</div>

<div class="page-shell">
	<div class="page-content">
		{@render children()}
	</div>
	<Footer />
</div>

<style>
	.page-shell {
		width: min(1100px, 100%);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem 1rem 2rem;
	}

	.page-content {
		width: 100%;
	}
</style>
