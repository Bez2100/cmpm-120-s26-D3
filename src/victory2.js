class victory2 extends Phaser.Scene {
    constructor() {
        super("victory2");
    }

    preload() {
        this.load.image("coin", "assets/coin.png");
    }

    create(data) {
        const score = data && typeof data.score === "number" ? data.score : 0;
        const totalCoins = data && typeof data.totalCoins === "number" ? data.totalCoins : 3;
        const coinsCollected = data && typeof data.coinsCollected === "number"
            ? data.coinsCollected
            : Math.max(0, Math.min(totalCoins, Math.floor(score / 200)));

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x1f6f8b).setOrigin(0, 0);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 150, "Level Complete!", {
            font: "48px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 70, `Coins Collected: ${coinsCollected}/${totalCoins}`, {
            font: "30px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5);

        const coinY = this.scale.height / 2;
        const spacing = 110;
        const startX = this.scale.width / 2 - ((Math.max(coinsCollected, 1) - 1) * spacing / 2);

        if (coinsCollected > 0) {
            for (let i = 0; i < coinsCollected; i += 1) {
                const coin = this.add.image(startX + (i * spacing), coinY, "coin");
                coin.setOrigin(0.5);
                coin.setScale(0.25);
            }
        } else {
            this.add.text(this.scale.width / 2, coinY, "No coins collected", {
                font: "24px Arial",
                fill: "#ffffff"
            }).setOrigin(0.5);
        }

        this.add.text(this.scale.width / 2, this.scale.height / 2 + 90, `Final Score: ${score}`, {
            font: "30px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5);

        const restartButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 150, "Next Level", {
            font: "36px Arial",
            fill: "#ffffff",
            backgroundColor: "#222222",
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive({ useHandCursor: true });
        restartButton.on("pointerdown", () => {
            this.scene.start("Level3");
        });
    }
}
