self.addEventListener('message', () => {
    /*
    setInterval(function() {
        self.postMessage('tick');
    }, 16.66); //(60 ticks per second)*/
    setInterval(() => {
        self.postMessage('tick');
    }, 16.66);
});