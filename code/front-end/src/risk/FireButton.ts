class FireButton {
  private button: HTMLButtonElement;
  private fireNotification: any;

  constructor(fireNotification: any) {
    this.fireNotification = fireNotification;

    const buttonElement = document.getElementById('startFire');
    if (!buttonElement || !(buttonElement instanceof HTMLButtonElement)) {
      throw new Error('Button with id "startFire" not found');
    }

    this.button = buttonElement;
    this.button.addEventListener('click', () => this.triggerFire());
  }

  private triggerFire(): void {
    const fireId = Math.floor(Math.random() * 10000);
    console.log(`Fire #${fireId} has been triggered!`);
    this.fireNotification.showNotification(`Fire #${fireId} detected! Sending fire department...`);
  }

  public hideButton(): void {
    this.button.style.display = 'none';
  }

  public showButton(): void {
    this.button.style.display = 'block';
  }
}

export default FireButton;