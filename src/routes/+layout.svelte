<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import pawprints from '$lib/assets/pawprints-removebg-preview.png';
	import '../app.css';

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

{@render children()}
