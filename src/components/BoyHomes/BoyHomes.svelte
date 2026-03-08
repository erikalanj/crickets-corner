<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { locations, type Location } from '$lib/data/location';
    import type { Map, Marker } from 'leaflet';

    let mapContainer: HTMLDivElement;
    let map: Map | undefined;
    let markers: Marker[] = [];
    let selectedLocation = $state<Location | null>(null);

    onMount(() => {
        // Use IIFE for async to satisfy TypeScript
        (async () => {
            // Dynamic import to avoid SSR issues
            const L = await import('leaflet');
            
            // Initialize map centered on Vermont
            map = L.map(mapContainer, {
                center: [44.26, -72.58],
                zoom: 7
            });

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add markers for each location
            locations.forEach((location) => {
                const marker = L.marker(location.coords).addTo(map!);
                marker.bindPopup(`<strong>${location.name}</strong>`);
                marker.on('click', () => {
                    selectedLocation = location;
                });
                markers.push(marker);
            });
        })();
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });

    function closeDetail() {
        selectedLocation = null;
    }
</script>

<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<section class="boy-homes">
    <h2>My Homes</h2>
    <div class="map-container" bind:this={mapContainer}></div>
    
    {#if selectedLocation}
        <div class="location-detail">
            <button class="close-btn" onclick={closeDetail}>&times;</button>
            <h3>{selectedLocation.name}</h3>
            <p>{selectedLocation.description}</p>
            {#if selectedLocation.photos && selectedLocation.photos.length > 0}
                <div class="photos">
                    {#each selectedLocation.photos as photo}
                        <img src={photo} alt={selectedLocation.name} />
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</section>

<style>
    .boy-homes {
        width: 100%;
        max-width: 800px;
        margin: 2rem auto;
    }

    h2 {
        text-align: center;
        margin-bottom: 1rem;
    }

    .map-container {
        width: 100%;
        height: 400px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .location-detail {
        position: relative;
        margin-top: 1.5rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
    }

    .close-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: inherit;
        opacity: 0.7;
    }

    .close-btn:hover {
        opacity: 1;
    }

    .location-detail h3 {
        margin: 0 0 0.5rem 0;
    }

    .location-detail p {
        margin: 0 0 1rem 0;
        opacity: 0.9;
    }

    .photos {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .photos img {
        width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
    }
</style>