<script lang="ts">
  import type { StoredFeedbackSubmission } from '$lib/server/feedbackStore';

  let { data } = $props<{ data: { submissions: StoredFeedbackSubmission[] } }>();

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
</script>

<svelte:head>
  <title>Feedback Inbox</title>
</svelte:head>

<main class="inbox-page">
  <a class="back-link" href="/">Back to home</a>

  <section class="inbox-panel">
    <div class="header-row">
      <div>
        <h1>Feedback Inbox</h1>
        <p>Review feedback submissions sent from the form.</p>
      </div>
      <span class="count-pill">{data.submissions.length} total</span>
    </div>

    {#if data.submissions.length === 0}
      <p class="empty-state">No feedback has been submitted yet.</p>
    {:else}
      <div class="submissions">
        {#each data.submissions as submission}
          <article class="submission-card">
            <div class="submission-meta">
              <strong>{submission.feedbackType}</strong>
              <span>{formatDate(submission.createdAt)}</span>
            </div>

            <p class="submission-text">{submission.textFeedback}</p>

            <dl class="details">
              <div>
                <dt>Location</dt>
                <dd>{submission.selectedLocation || 'None'}</dd>
              </div>
              <div>
                <dt>Age stage</dt>
                <dd>{submission.selectedAge || 'None'}</dd>
              </div>
              <div>
                <dt>Target image</dt>
                <dd>{submission.targetImageId || 'None'}</dd>
              </div>
            </dl>

            {#if submission.uploadedImages.length > 0}
              <div class="attachments">
                <h2>Attached files</h2>
                <ul>
                  {#each submission.uploadedImages as image}
                    <li>
                      <a href={`/api/feedback/file/${submission.id}/${image.name}`} target="_blank" rel="noopener noreferrer">
                        {image.name}
                      </a>
                      ({Math.round(image.size / 1024)} KB)
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </article>
        {/each}
      </div>
    {/if}
  </section>
</main>

<style>
  .inbox-page {
    min-height: 100vh;
    padding: 2rem;
    color: #f9d289fe;
  }

  .back-link {
    display: inline-block;
    margin-bottom: 1rem;
    color: #ffd7a3;
    text-decoration: none;
  }

  .inbox-panel {
    max-width: 960px;
    margin: 0 auto;
    padding: 1.5rem;
    border: 1px solid rgba(255, 154, 47, 0.25);
    border-radius: 16px;
    background: rgba(58, 58, 58, 0.75);
    backdrop-filter: blur(10px);
  }

  .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }

  p {
    margin: 0.35rem 0 0;
  }

  .count-pill {
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    background: rgba(255, 154, 47, 0.12);
    border: 1px solid rgba(255, 154, 47, 0.3);
    font-weight: 600;
  }

  .empty-state {
    padding: 1rem 0;
    opacity: 0.85;
  }

  .submissions {
    display: grid;
    gap: 1rem;
  }

  .submission-card {
    padding: 1rem;
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .submission-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: space-between;
    color: #ffd7a3;
    margin-bottom: 0.85rem;
  }

  .submission-text {
    font-size: 1.05rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.85rem;
    margin: 0;
  }

  .details div {
    padding: 0.75rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
  }

  dt {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.7;
    margin-bottom: 0.25rem;
  }

  dd {
    margin: 0;
    color: #ffd7a3;
  }

  .attachments {
    margin-top: 1rem;
  }

  .attachments h2 {
    font-size: 1rem;
    margin: 0 0 0.5rem;
  }

  .attachments ul {
    margin: 0;
    padding-left: 1.1rem;
  }
</style>