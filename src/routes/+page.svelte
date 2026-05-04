<script>
  import BoopCounter from '../components/BoopCounter/BoopCounter.svelte';
  import BoyHomes from '../components/BoyHomes/BoyHomes.svelte';
  import FeedbackBox from '../components/FeedbackBox/FeedbackBox.svelte';
</script>

<main>
    <h1 class="fade-in">Cricket's Corner!</h1>
    <h3 class="fade-in-delayed">Remembering a Little Boy</h3>
    <BoopCounter />

    <BoyHomes />

    <FeedbackBox />

    <a class="review-link" href="/feedback-inbox">Review feedback inbox</a>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
        padding: 1.25rem;
    }

    h1 {
        background: -webkit-linear-gradient(#f9d289fe, #eee);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: clamp(2.2rem, 10vw, 5rem);
        letter-spacing: 0.05em;
        line-height: 1.08;
    }

    h3 {
        font-size: clamp(1.15rem, 5vw, 2.3rem);
        font-weight: 400;
        opacity: 0.85;
    }

    .review-link {
        margin-top: 0.5rem;
        color: #ffd7a3;
        text-decoration: none;
        font-weight: 600;
    }

    .review-link:hover {
        text-decoration: underline;
    }

    @media (max-width: 700px) {
        main {
            gap: 0.8rem;
            padding: 1rem 0.75rem;
        }
    }
</style>