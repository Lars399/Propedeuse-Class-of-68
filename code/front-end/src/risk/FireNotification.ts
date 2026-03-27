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

        this.notificationContainer.style.position = 'fixed';
        this.notificationContainer.style.top = '20px';
        this.notificationContainer.style.right = '20px';
        this.notificationContainer.style.width = '250px';
        this.notificationContainer.style.zIndex = '9999';
        notification.style.backgroundColor = '#ff4d4d';
        notification.style.color = 'white';
        notification.style.padding = '10px 15px';
        notification.style.marginBottom = '10px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    }

    
}

// Usage Example:
const fireNotification = new FireNotification();
fireNotification.showNotification('Test alert!');

