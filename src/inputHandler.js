export class InputHandler {
    constructor(eventManager) {
        this.keysPressed = {};

        document.addEventListener('keydown', (event) => {
            this.keysPressed[event.key] = true;
            // '1', '2' 같은 즉시 반응해야 하는 키는 여기서 이벤트 발행 가능
            if (['1', '2', '3', '4'].includes(event.key)) {
                eventManager.publish('key_pressed', { key: event.key });
            }
        });

        document.addEventListener('keyup', (event) => {
            delete this.keysPressed[event.key];
        });
    }
}
