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
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
        padding: 2rem;
    }

    h1 {
        background: -webkit-linear-gradient(#f9d289fe, #eee);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 5rem;
        letter-spacing: 0.05em;
    }

    h3 {
        font-size: 2.3rem;
        font-weight: 400;
        opacity: 0.85;
    }
</style>