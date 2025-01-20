async function playClick() {
    var audio = new Audio('/assets/sound/click.wav');
    await audio.play();
}

export { playClick };