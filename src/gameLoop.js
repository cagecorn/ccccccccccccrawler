export class GameLoop {
    constructor(update, render) {
        this.update = update;
        this.render = render;
        this.lastTime = 0;
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        this.loop(0);
    }

    stop() {
        this.isRunning = false;
    }

    loop = (currentTime) => {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.loop);
    }
}
