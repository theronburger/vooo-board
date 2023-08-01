function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

function addBubbles({container, maxParticles, rowCount}) {
    const containerHeight = container.offsetHeight;
    const containerWidth = container.offsetWidth;
    const distanceBetweenRows = containerHeight / rowCount;
    const rows = Array(rowCount).fill(false);


    while(rows.filter(row => row).length <= maxParticles - 1) {
        const index = Math.floor(Math.random() * rowCount);
        if(rows[index]) continue; // If the row is already filled, skip this iteration

        const particle = document.createElement('div');
        particle.className = "bubble";
        particle.style.top = `${index * distanceBetweenRows}px`; 

        const height = getRandomFloat(distanceBetweenRows/2, distanceBetweenRows * 2);
        const width = getRandomFloat(distanceBetweenRows, containerWidth);

        particle.style.height = `${height}px`;
        particle.style.width = `${width}px`;
        particle.style.borderRadius = `${Math.min(height, width) / 2}px`;

        const animationName = `animation${index}`;
        const start = - getRandomFloat(0, containerWidth / 2);
        const end = getRandomFloat(0, containerWidth / 2);
        const keyframes = `@keyframes ${animationName} {
            0% { transform: translateX(${start}px); }
            50% { transform: translateX(${end}px); }
            100% { transform: translateX(${start}px); }
        }`;
        const stylesheet = document.createElement(`style`);
        stylesheet.appendChild(document.createTextNode(keyframes));
        document.head.appendChild(stylesheet);
        particle.style.animation = `${animationName} ${getRandomFloat(10,20)}s ease-in-out infinite`;

        container.appendChild(particle);

        rows[index] = true;
    }
}

Array.from(document.getElementsByClassName('bubbles')).forEach(container => {
    addBubbles({
        container,
        maxParticles: container.dataset.maxParticles,
        rowCount: container.dataset.rowCount
    })
})
