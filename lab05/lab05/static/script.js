const div = document.getElementById('text')

let isGreen = false

setInterval(() => {
    div.style.color = isGreen ? 'green' : 'lime'
    isGreen = !isGreen
}, 500)

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock();