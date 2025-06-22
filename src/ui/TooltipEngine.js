export class TooltipEngine {
    constructor() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.id = 'tooltip-engine';
        this.tooltipElement.className = 'tooltip ui-frame hidden';
        document.body.appendChild(this.tooltipElement);

        this.lastX = 0;
        this.lastY = 0;
        this._mousemoveHandler = (e) => {
            this.updatePosition(e.pageX, e.pageY);
        };
        document.addEventListener('mousemove', this._mousemoveHandler);
        console.log('[TooltipEngine] Initialized');
    }

    show(htmlContent) {
        this.tooltipElement.innerHTML = htmlContent;
        this.updatePosition(this.lastX, this.lastY);
        this.tooltipElement.classList.remove('hidden');
    }

    hide() {
        this.tooltipElement.classList.add('hidden');
    }

    updatePosition(x, y) {
        this.lastX = x;
        this.lastY = y;
        const screenPadding = 10;
        const rect = this.tooltipElement.getBoundingClientRect();
        let newX = x + 15;
        let newY = y + 15;
        if (newX + rect.width > window.innerWidth - screenPadding) {
            newX = x - rect.width - 15;
        }
        if (newY + rect.height > window.innerHeight - screenPadding) {
            newY = y - rect.height - 15;
        }
        this.tooltipElement.style.left = `${newX}px`;
        this.tooltipElement.style.top = `${newY}px`;
    }

    destroy() {
        document.removeEventListener('mousemove', this._mousemoveHandler);
        this.tooltipElement.remove();
    }
}
