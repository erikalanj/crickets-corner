<script lang="ts">
    import { boyTimeline } from '$lib/data/boyTimeline';

    let timelineTrack = $state<HTMLDivElement | undefined>(undefined);
    let timelineProgress = $state(0);
    let isTimelineScrubbing = $state(false);

    const lifeStagePhotos = boyTimeline;
    const lifeStageNames = boyTimeline.map((stage) => stage.name);
    const stageAnchors = [0, 0.5, 1];

    const activeStageName = $derived(
        timelineProgress < 0.25
            ? lifeStageNames[0]
            : timelineProgress < 0.75
                ? lifeStageNames[1]
                : lifeStageNames[2]
    );

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
        <p class="timeline-empty">Add photos to your timeline data to load Boy's timeline.</p>
    {/if}
</section>

<style>
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
        margin: 0.4rem 0 2.5rem;
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
        top: calc(100% + 0.8rem);
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

    @media (max-width: 700px) {
        .boy-years {
            padding: 1rem;
        }

        .timeline-track {
            height: 24px;
            margin-bottom: 2rem;
        }

        .timeline-thumb {
            width: 20px;
            height: 20px;
        }

        .timeline-stop {
            width: 8px;
            height: 8px;
        }

        .timeline-label {
            font-size: 0.7rem;
        }
    }
</style>
