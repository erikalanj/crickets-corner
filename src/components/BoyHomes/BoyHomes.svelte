<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { locations, type Location } from '$lib/data/location';
    import type { Map, Marker } from 'leaflet';

    let mapContainer: HTMLDivElement;
    let map: Map | undefined;
    let markers: Marker[] = [];
    let selectedLocation = $state<Location | null>(null);
    let modalPhotoIndex = $state<number | null>(null);

    const currentPhotos = $derived(selectedLocation?.photos ?? []);
    const modalPhoto = $derived(modalPhotoIndex !== null ? currentPhotos[modalPhotoIndex] : null);

    onMount(() => {
        // Use IIFE for async to satisfy TypeScript
        (async () => {
            // Dynamic import to avoid SSR issues
            const L = await import('leaflet');
            
            // Initialize map centered on Vermont
            map = L.map(mapContainer, {
                center: [43.04, -72.25],
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
        modalPhotoIndex = null;
    }

    function openPhotoModal(index: number) {
        modalPhotoIndex = index;
    }

    function closePhotoModal() {
        modalPhotoIndex = null;
    }

    function prevPhoto(event?: MouseEvent) {
        event?.stopPropagation();
        if (modalPhotoIndex !== null && currentPhotos.length > 0) {
            modalPhotoIndex = (modalPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
        }
    }

    function nextPhoto(event?: MouseEvent) {
        event?.stopPropagation();
        if (modalPhotoIndex !== null && currentPhotos.length > 0) {
            modalPhotoIndex = (modalPhotoIndex + 1) % currentPhotos.length;
        }
    }

    function handleModalKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closePhotoModal();
        } else if (event.key === 'ArrowLeft') {
            prevPhoto();
        } else if (event.key === 'ArrowRight') {
            nextPhoto();
        }
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
                    {#each selectedLocation.photos as photo, index}
                        <button class="photo-btn" onclick={() => openPhotoModal(index)}>
                            <img src={photo} alt={selectedLocation.name} />
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</section>

{#if modalPhoto}
    <div 
        class="modal-overlay" 
        onclick={closePhotoModal} 
        onkeydown={handleModalKeydown}
        role="dialog" 
        aria-modal="true"
        tabindex="-1"
    >
        <button class="modal-close" onclick={closePhotoModal}>&times;</button>
        {#if currentPhotos.length > 1}
            <button class="modal-nav modal-prev" onclick={prevPhoto} aria-label="Previous photo">
                &#8249;
            </button>
        {/if}
        <img src={modalPhoto} alt="Full size" class="modal-image" />
        {#if currentPhotos.length > 1}
            <button class="modal-nav modal-next" onclick={nextPhoto} aria-label="Next photo">
                &#8250;
            </button>
        {/if}
        {#if currentPhotos.length > 1}
            <div class="modal-counter">
                {(modalPhotoIndex ?? 0) + 1} / {currentPhotos.length}
            </div>
        {/if}
    </div>
{/if}

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
        border: 7px solid transparent;
        transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .map-container:hover {
        transform: scale(1.05);
        border-color: #f9d289fe;
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
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.5rem;
    }

    .photo-btn {
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 8px;
        overflow: hidden;
        transition: transform 0.2s ease;
        aspect-ratio: 1;
    }

    .photo-btn:hover {
        transform: scale(1.05);
    }

    .photos img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
        display: block;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        cursor: pointer;
    }

    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: white;
        font-size: 2.5rem;
        cursor: pointer;
        opacity: 0.8;
        z-index: 1001;
    }

    .modal-close:hover {
        opacity: 1;
    }

    .modal-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: white;
        font-size: 3rem;
        width: 60px;
        height: 80px;
        cursor: pointer;
        opacity: 0.7;
        z-index: 1001;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s, background 0.2s;
    }

    .modal-nav:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.25);
    }

    .modal-prev {
        left: 1rem;
    }

    .modal-next {
        right: 1rem;
    }

    .modal-counter {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 0.9rem;
        opacity: 0.8;
        background: rgba(0, 0, 0, 0.5);
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
    }

    .modal-image {
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        cursor: default;
    }
</style>