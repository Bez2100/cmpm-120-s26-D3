class GameOver extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }

    create(data) {
        const level = (data && data.level) ? data.level : 1;
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x222222, 0.85).setOrigin(0, 0);
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 60, "Game Over!", {
            font: "48px Arial",
            fill: "#ff4444"
        }).setOrigin(0.5);
        this.add.text(this.scale.width / 2, this.scale.height / 2, "Your captain starved", {
            font: "28px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5);
        const restartButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 80, "Restart", {
            font: "36px Arial",
            fill: "#ffffff",
            backgroundColor: "#222222",
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive({ useHandCursor: true });
        restartButton.on("pointerdown", () => {
            this.scene.start("level1");
        });
    }
}
