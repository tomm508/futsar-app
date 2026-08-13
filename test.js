const activeBg = "https://files.catbox.moe/oig2ik.mp4";
const isVideo = activeBg.match(/\.(mp4|webm|ogg)$/i) || activeBg.includes('youtube.com') || activeBg === '/logo-futsar.mp4';
console.log(isVideo);
