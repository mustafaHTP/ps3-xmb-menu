async function playClick() {
    const audio = new Audio('assets/sound/click.wav');
    await audio.play();
}

export { playClick };