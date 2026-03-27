// FireNotification.ts

// This TypeScript file is responsible for displaying fire notifications
// and managing the UI display for fire alerts.

export default class FireNotification {
    private notificationContainer: HTMLElement;

    constructor() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'fire-notification';
        document.body.appendChild(this.notificationContainer);
    }

    public showNotification(message: string): void {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        this.notificationContainer.appendChild(notification);

        // Automatically remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Usage Example:
const fireNotification = new FireNotification();
fireNotification.showNotification('Fire alert! Evacuate immediately!');