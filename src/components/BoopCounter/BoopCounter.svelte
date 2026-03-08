<script>
    import boyNoseImage from '$lib/assets/boy/IMG_1627-removebg-preview.png'

    let boopCount = 0;
    function boopBoy() {
        boopCount += 1;
    }
</script>

<div class="image-container">
    <img src={boyNoseImage} alt="nose boy">
    <button class="nose-hotspot" on:click={boopBoy}></button>
</div>
    
<p>you smacked my nose {boopCount} {boopCount === 1 ? 'time' : 'times'}!</p>

<style>
    img {
        width: 500px;
        height: auto;
        border-radius: 12px;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    img:hover {
        transform: scale(1.05);
    }

    p {
        font-size: 1.1rem;
    }

    .image-container {
        position: relative;
        display: inline-block;
    }
    
    .nose-hotspot {
        position: absolute;
        top: 53%;      /* adjust to nose position */
        left: 60%;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: transparent;
        border: none;
        cursor: pointer;
        transform: translate(-50%, -50%);
    }
</style>