<script lang="ts">
    import { boyTimeline } from '$lib/data/boyTimeline';
    import { locations } from '$lib/data/location';
    import type { FeedbackTargetImage, FeedbackType } from '$lib/data/feedback';

    let textFeedback = '';
    let feedbackType: FeedbackType = 'general';
    let targetImageId = '';

    const timelineTargets: FeedbackTargetImage[] = boyTimeline.map((stage, index) => ({
        id: `timeline-${index}`,
        label: `Timeline: ${stage.name}`,
        src: stage.photo,
        currentStage: stage.name
    }));

    const locationTargets: FeedbackTargetImage[] = locations.flatMap((location) =>
        location.photos.map((photo, index) => ({
            id: `location-${location.id}-${index}`,
            label: `Location: ${location.name} (Photo ${index + 1})`,
            src: photo,
            currentLocation: location.name
        }))
    );

    const targetImages: FeedbackTargetImage[] = [...timelineTargets, ...locationTargets];
</script>

<section class="feedback-box">
    <h2>Send Feedback</h2>
    <p class="subtitle">Notice an incorrect image or have a photo to share? Let me know!</p>
    
    <form>
        <div class="field">
            <label for="feedbackType">Feedback Type</label>
            <div class="select-wrap">
                <select id="feedbackType" bind:value={feedbackType}>
                    <option value="general">General</option>
                    <option value="location-correction">Location correction</option>
                    <option value="timeline-correction">Timeline correction</option>
                </select>
                <span class="select-arrow" aria-hidden="true">▾</span>
            </div>
        </div>

        <div class="field">
            <label for="targetImage">Image on site (optional)</label>
            <div class="select-wrap">
                <select id="targetImage" bind:value={targetImageId}>
                    <option value="">Select an existing image</option>
                    {#each targetImages as image}
                        <option value={image.id}>{image.label}</option>
                    {/each}
                </select>
                <span class="select-arrow" aria-hidden="true">▾</span>
            </div>
        </div>

        <div class="field">
            <label for="textFeedback">Your feedback</label>
            <textarea
                id="textFeedback" 
                bind:value={textFeedback} 
                rows="4"
                placeholder="Tell me what should be corrected!!"
            ></textarea>
        </div>
    </form>
</section>

<style>
    .feedback-box {
        --panel-gray: #4a4a4a;
        --panel-gray-dark: #3f3f3f;
        --panel-gray-darker: #343434;
        --orange: #ff9a2f;
        --orange-soft: #ffc47a;

        max-width: 600px;
        margin: 3rem auto;
        padding: 2rem;
        background: rgba(58, 58, 58, 0.75);
        border: 1px solid rgba(255, 154, 47, 0.25);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }

    h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
    }

    .subtitle {
        margin: 0 0 1.5rem 0;
        opacity: 0.8;
        font-size: 0.95rem;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        text-align: left;
    }

    .select-wrap {
        position: relative;
    }

    .select-arrow {
        position: absolute;
        right: 0.85rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--orange);
        pointer-events: none;
        transition: transform 220ms ease, color 220ms ease;
    }

    .select-wrap:focus-within .select-arrow {
        transform: translateY(-50%) rotate(180deg);
        color: var(--orange-soft);
    }

    label {
        font-weight: 600;
        font-size: 0.95rem;
    }

    select,
    textarea {
        width: 100%;
        padding: 0.7rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 154, 47, 0.35);
        background: linear-gradient(180deg, var(--panel-gray), var(--panel-gray-dark));
        color: var(--orange);
        font: inherit;
        transition: border-color 220ms ease, box-shadow 220ms ease, transform 180ms ease;
    }

    select {
        appearance: none;
        padding-right: 2.2rem;
        cursor: pointer;
    }

    select:hover,
    textarea:hover {
        border-color: rgba(255, 154, 47, 0.65);
    }

    select:focus,
    textarea:focus {
        outline: none;
        border-color: var(--orange);
        box-shadow: 0 0 0 3px rgba(255, 154, 47, 0.18);
        transform: translateY(-1px);
    }

    option {
        background: var(--panel-gray-darker);
        color: var(--orange);
    }

    option:checked {
        background: #5a5a5a;
        color: #ffd7a3;
    }

    textarea::placeholder {
        color: rgba(255, 220, 180, 0.72);
    }
</style>
