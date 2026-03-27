// FireButton.ts - Frontend button to trigger fire alerts

class FireButton {
    private button: HTMLButtonElement;
    private fireNotification: any;

    constructor(fireNotification: any) {
        this.fireNotification = fireNotification;
        this.button = this.createButton();
    }

    private createButton(): HTMLButtonElement {
        const button = document.createElement('button');
        button.textContent = 'Trigger Fire';
        button.className = 'fire-trigger-button';
        button.style.padding = '10px 20px';
        button.style.fontSize = '16px';
        button.style.backgroundColor = '#FF6B6B';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.margin = '10px';

        button.addEventListener('click', () => this.triggerFire());
        document.body.appendChild(button);
        
        return button;
    }

    private triggerFire(): void {
        const fireId = Math.floor(Math.random() * 10000);
        console.log(`Fire #${fireId} has been triggered!`);
        this.fireNotification.showNotification(`Fire #${fireId} detected! Sending fire department...`);
    }

    public getButton(): HTMLButtonElement {
        return this.button;
    }

    public hideButton(): void {
        this.button.style.display = 'none';
    }

    public showButton(): void {
        this.button.style.display = 'block';
    }
}

export default FireButton;