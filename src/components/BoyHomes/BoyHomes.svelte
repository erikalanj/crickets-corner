<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { locations, type Location } from '$lib/data/location';
    import type { Map, Marker } from 'leaflet';

    let mapContainer: HTMLDivElement;
    let map: Map | undefined;
    let markers: Marker[] = [];
    let selectedLocation = $state<Location | null>(null);
    let modalPhotoIndex = $state<number | null>(null);
    let timelineTrack = $state<HTMLDivElement | undefined>(undefined);
    let timelineProgress = $state(0);
    let isTimelineScrubbing = $state(false);

    const lifeStageNames = ['Baby', 'Teen', 'Old Man'];
    const stageAnchors = [0, 0.5, 1];

    const currentPhotos = $derived(selectedLocation?.photos ?? []);
    const modalPhoto = $derived(modalPhotoIndex !== null ? currentPhotos[modalPhotoIndex] : null);
    const allTimelinePhotos = locations.flatMap((location) => location.photos);
    const lifeStagePhotos = $derived.by(() => {
        const photos = allTimelinePhotos;
        if (photos.length === 0) {
            return [] as { name: string; photo: string }[];
        }

        const firstPhoto = photos[0];
        const middlePhoto = photos[Math.floor((photos.length - 1) / 2)] ?? firstPhoto;
        const lastPhoto = photos[photos.length - 1] ?? middlePhoto;

        return [
            { name: lifeStageNames[0], photo: firstPhoto },
            { name: lifeStageNames[1], photo: middlePhoto },
            { name: lifeStageNames[2], photo: lastPhoto }
        ];
    });
    const activeStageName = $derived(
        timelineProgress < 0.25
            ? lifeStageNames[0]
            : timelineProgress < 0.75
                ? lifeStageNames[1]
                : lifeStageNames[2]
    );

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

    function clampTimeline(value: number) {
        return Math.min(1, Math.max(0, value));
    }

    function getTrackProgress(clientX: number) {
        if (!timelineTrack) {
            return timelineProgress;
        }
        const rect = timelineTrack.getBoundingClientRect();
        return clampTimeline((clientX - rect.left) / rect.width);
    }

    function getStageOpacity(stageIndex: number) {
        const distance = Math.abs(timelineProgress - stageAnchors[stageIndex]);
        return clampTimeline(1 - distance / 0.5);
    }

    function scrubTimeline(event: PointerEvent | MouseEvent) {
        timelineProgress = getTrackProgress(event.clientX);
    }

    function handleTimelinePointerDown(event: PointerEvent) {
        isTimelineScrubbing = true;
        scrubTimeline(event);
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    function handleTimelinePointerMove(event: PointerEvent) {
        if (!isTimelineScrubbing) {
            return;
        }
        scrubTimeline(event);
    }

    function handleTimelinePointerUp(event: PointerEvent) {
        isTimelineScrubbing = false;
        (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    }

    function handleTimelineHover(event: MouseEvent) {
        if (isTimelineScrubbing) {
            return;
        }
        scrubTimeline(event);
    }

    function handleTimelineKeydown(event: KeyboardEvent) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            timelineProgress = clampTimeline(timelineProgress - 0.05);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            timelineProgress = clampTimeline(timelineProgress + 0.05);
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

<section class="boy-years">
    <h2>Boy Through the Years</h2>
    {#if lifeStagePhotos.length > 0}
        <div class="life-timeline">
            <div class="era-preview">
                {#each lifeStagePhotos as stage, index}
                    <img
                        src={stage.photo}
                        alt={`${stage.name} photo of Boy`}
                        class="era-image"
                        style={`opacity: ${getStageOpacity(index)};`}
                    />
                {/each}
                <div class="era-chip">{activeStageName}</div>
            </div>

            <div
                class="timeline-track"
                bind:this={timelineTrack}
                onpointerdown={handleTimelinePointerDown}
                onpointermove={handleTimelinePointerMove}
                onpointerup={handleTimelinePointerUp}
                onpointercancel={handleTimelinePointerUp}
                onmousemove={handleTimelineHover}
                onkeydown={handleTimelineKeydown}
                role="slider"
                aria-label="Boy life timeline"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(timelineProgress * 100)}
                tabindex="0"
            >
                <div class="timeline-fill" style={`width: ${timelineProgress * 100}%;`}></div>
                <div class="timeline-thumb" style={`left: ${timelineProgress * 100}%;`}></div>

                {#each lifeStagePhotos as stage, index}
                    <span class="timeline-stop" style={`left: ${(index / (lifeStagePhotos.length - 1)) * 100}%;`}></span>
                    <span class="timeline-label" style={`left: ${(index / (lifeStagePhotos.length - 1)) * 100}%;`}>
                        {stage.name}
                    </span>
                {/each}
            </div>
            <p class="timeline-hint">Hover or drag across the line to blend each era.</p>
        </div>
    {:else}
        <p class="timeline-empty">Add photos to your locations to load Boy's timeline.</p>
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

    .boy-years {
        width: 100%;
        max-width: 800px;
        margin: 0 auto 2rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        backdrop-filter: blur(8px);
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

    .life-timeline {
        margin-bottom: 1.25rem;
    }

    .era-preview {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 12px;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(249, 210, 137, 0.25);
        margin-bottom: 0.75rem;
    }

    .era-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.28s ease;
    }

    .era-chip {
        position: absolute;
        right: 0.75rem;
        bottom: 0.75rem;
        background: rgba(0, 0, 0, 0.55);
        border: 1px solid rgba(249, 210, 137, 0.4);
        border-radius: 999px;
        padding: 0.3rem 0.7rem;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .timeline-track {
        position: relative;
        height: 28px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.18);
        cursor: ew-resize;
        outline: none;
        margin: 0.4rem 0 1.8rem;
        transition: box-shadow 0.2s ease, background-color 0.2s ease;
    }

    .timeline-track:focus-visible {
        box-shadow: 0 0 0 3px rgba(249, 210, 137, 0.35);
    }

    .timeline-track:hover {
        background: rgba(255, 255, 255, 0.26);
        box-shadow: 0 0 0 3px rgba(249, 210, 137, 0.22);
    }

    .timeline-fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        border-radius: inherit;
        background: linear-gradient(90deg, #f7b267 0%, #f4845f 50%, #6c757d 100%);
        pointer-events: none;
        transition: width 0.08s linear;
    }

    .timeline-thumb {
        position: absolute;
        top: 50%;
        width: 24px;
        height: 24px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: #f9d289;
        border: 2px solid #222;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
        pointer-events: none;
        transition: transform 0.16s ease, box-shadow 0.16s ease;
    }

    .timeline-track:hover .timeline-thumb {
        transform: translate(-50%, -50%) scale(1.08);
        box-shadow: 0 5px 12px rgba(0, 0, 0, 0.45);
    }

    .timeline-stop {
        position: absolute;
        top: 50%;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.85);
        transform: translate(-50%, -50%);
        pointer-events: none;
    }

    .timeline-label {
        position: absolute;
        top: 1.05rem;
        transform: translateX(-50%);
        font-size: 0.78rem;
        opacity: 0.85;
        white-space: nowrap;
        pointer-events: none;
    }

    .timeline-hint {
        font-size: 0.78rem;
        opacity: 0.72;
        margin: 0;
    }

    .timeline-empty {
        opacity: 0.78;
        margin: 0;
        text-align: center;
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