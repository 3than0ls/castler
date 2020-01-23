self.addEventListener('message', () => {
    setInterval(() => {
        self.postMessage('tick');
    }, 1000/60);
});