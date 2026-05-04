<script lang="ts">
    import { boyTimeline } from '$lib/data/boyTimeline';
    import { locations } from '$lib/data/location';
    import type { FeedbackAttachment, FeedbackSubmission, FeedbackTargetImage, FeedbackType } from '$lib/data/feedback';

    let textFeedback = '';
    let feedbackType: FeedbackType = 'general';
    let targetImageId = '';
    let uploadedImages: File[] = [];
    let imageInput: HTMLInputElement | null = null;
    let selectedLocation = '';
    let selectedAge = '';
    let isSubmitting = false;
    let submitMessage = '';

    $: isGeneral = feedbackType === 'general';
    $: isLocationCorrection = feedbackType === 'location-correction';
    $: isTimelineCorrection = feedbackType === 'timeline-correction';

    $: if (isGeneral) {
        selectedLocation = '';
        selectedAge = '';
        targetImageId = '';
    }

    $: if (isLocationCorrection) {
        selectedAge = '';
    }

    $: if (isTimelineCorrection) {
        selectedLocation = '';
    }

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

    function handleImageSelection(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        uploadedImages = input.files ? Array.from(input.files) : [];
    }

    async function handleSubmit() {
        if (isSubmitting || !textFeedback.trim()) {
            return;
        }

        isSubmitting = true;
        submitMessage = '';

        try {
            const form = new FormData();
            form.set('textFeedback', textFeedback.trim());
            form.set('selectedLocation', isLocationCorrection ? selectedLocation : '');
            form.set('selectedAge', isTimelineCorrection ? selectedAge : '');
            form.set('targetImageId', !isGeneral && targetImageId ? targetImageId : '');
            form.set('feedbackType', feedbackType);

            for (const file of uploadedImages) {
                form.append('uploadedImages', file, file.name);
            }

            const response = await fetch('/api/feedback', {
                method: 'POST',
                body: form
            });

            const result = (await response.json().catch(() => null)) as { message?: string; submission?: { id?: string } } | null;

            if (!response.ok) {
                throw new Error(result?.message ?? 'Unable to send feedback right now.');
            }

            submitMessage = 'Thanks. Your feedback was sent to the inbox.';
            textFeedback = '';
            targetImageId = '';
            selectedLocation = '';
            selectedAge = '';
            uploadedImages = [];
            feedbackType = 'general';

            if (imageInput) imageInput.value = '';
        } catch (err) {
            submitMessage = err instanceof Error ? err.message : String(err);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<section class="feedback-box">
    <h2>Send Feedback</h2>
    <p class="subtitle">Notice an incorrect image or have a photo to share? Let me know!</p>
    
    <form on:submit|preventDefault={handleSubmit}>
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

        {#if !isGeneral}
            <div class="field">
                <label for="targetImage">Image on site</label>
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
        {/if}

        <div class="field">
            <label for="textFeedback">{isGeneral ? 'Your feedback' : 'Describe the correction'}</label>
            <textarea
                id="textFeedback" 
                bind:value={textFeedback} 
                rows="4"
                placeholder="Tell me what should be corrected, or what photo should be added!!"
            ></textarea>
        </div>

        <div class="field">
            <label for="imageUpload">Upload images (optional)</label>
            <input
                id="imageUpload"
                bind:this={imageInput}
                type="file"
                accept="image/*"
                multiple
                on:change={handleImageSelection}
            />

            {#if uploadedImages.length > 0}
                <p class="file-count">{uploadedImages.length} image(s) selected</p>
                <ul class="file-list">
                    {#each uploadedImages as image}
                        <li>{image.name}</li>
                    {/each}
                </ul>
            {/if}
        </div>

        {#if isLocationCorrection}
            <div class="field">
                <label for="selectedLocation">Correct location</label>
                <div class="select-wrap">
                    <select id="selectedLocation" bind:value={selectedLocation}>
                        <option value="">Select location</option>
                        {#each locations as location}
                            <option value={location.name}>{location.name}</option>
                        {/each}
                    </select>
                    <span class="select-arrow" aria-hidden="true">▾</span>
                </div>
            </div>
        {/if}

        {#if isTimelineCorrection}
            <div class="field">
                <label for="selectedAge">Correct age stage</label>
                <div class="select-wrap">
                    <select id="selectedAge" bind:value={selectedAge}>
                        <option value="">Select age stage</option>
                        {#each boyTimeline as stage}
                            <option value={stage.name}>{stage.name}</option>
                        {/each}
                    </select>
                    <span class="select-arrow" aria-hidden="true">▾</span>
                </div>
            </div>
        {/if}

        <button type="submit" class="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Submit Feedback'}
        </button>

        {#if submitMessage}
            <p class="submit-message" role="status" aria-live="polite">{submitMessage}</p>
        {/if}

    </form>
</section>

<style>
    .feedback-box {
        --panel-gray: #4a4a4a;
        --panel-gray-dark: #3f3f3f;
        --panel-gray-darker: #343434;
        --orange: #ff9a2f;
        --orange-soft: #ffc47a;

        width: 100%;
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
    input,
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

    input[type='file'] {
        cursor: pointer;
    }

    input[type='file']::file-selector-button {
        margin-right: 0.75rem;
        padding: 0.45rem 0.75rem;
        border: 1px solid rgba(255, 154, 47, 0.5);
        border-radius: 6px;
        background: #5a5a5a;
        color: #ffd7a3;
        cursor: pointer;
    }

    .file-count {
        margin: 0;
        font-size: 0.9rem;
        color: var(--orange-soft);
    }

    .file-list {
        margin: 0;
        padding-left: 1.1rem;
        color: #ffd7a3;
    }

    .submit-btn {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 154, 47, 0.5);
        background: #555555;
        color: #ffd7a3;
        font-weight: 600;
        cursor: pointer;
        transition: background 180ms ease, transform 180ms ease, border-color 180ms ease;
    }

    .submit-btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
        transform: none;
    }

    .submit-btn:hover {
    background: #666666;
    border-color: rgba(255, 154, 47, 0.8);
    transform: translateY(-1px);
    }

    .submit-btn:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255, 154, 47, 0.2);
    }

    .submit-message {
        margin: 0;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 154, 47, 0.35);
        background: rgba(255, 154, 47, 0.12);
        color: var(--orange-soft);
        font-weight: 600;
    }

    @media (max-width: 700px) {
        .feedback-box {
            margin: 1.75rem auto;
            padding: 1rem;
        }

        form {
            gap: 1rem;
        }
    }
</style>
