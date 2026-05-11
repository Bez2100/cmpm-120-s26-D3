class Level1 extends Phaser.Scene {
    constructor() {
        super("level1");
        this.score = 0;
        this.coinsCollected = 0;
        this.anchorImage = null;
        this.meatObject = null;
        this.ropeGraphics = null;
        this.coinsGroup = null;
        this.ropeIsBroken = false;
        this.luffyObject = null;
        this.hasWon = false;
        this.hangingBaseX = 0;
        this.hangingBaseY = 0;
        this.swingAmplitude = 14;
        this.swingSpeed = 0.003;
        this.swingPhase = 0;
    }
    preload() {
        this.load.image("level1", "assets/beach.png");
        this.load.image("luffy", "assets/luffy.png");
        this.load.image("coin", "assets/coin.png");
        this.load.image("meat", "assets/meat.png");
        this.load.image("connect", "assets/connect.png");
    }

    create() {
        this.add
            .image(0, 0, "level1")
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);
        const gamename = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, "Meat Mania", {
            font: "50px Arial",
            fill: "#090909"
        });
        gamename.setOrigin(0.5);
        const title = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, "Level 1", {
            font: "40px Arial",
            fill: "#090909"
        });
        title.setOrigin(0.5);

        const playButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 30, "PLAY", {
            font: "36px Arial",
            fill: "#ffffff",
            backgroundColor: "#222222",
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        });
        playButton.setOrigin(0.5);
        playButton.setInteractive({ useHandCursor: true });

        playButton.on("pointerdown", () => {
            playButton.disableInteractive();
            this.add.text(this.scale.width - 3 * this.s, this.scale.height - 3 * this.s, "📺")
            .setStyle({ fontSize: `${2 * this.s}px` })
            .setInteractive({useHandCursor: true})
            .on('pointerover', () => this.showMessage('Fullscreen?'))
            .on('pointerdown', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else {
                    this.scale.startFullscreen();
                }
            });


            this.tweens.add({
                targets: [title, playButton, gamename],
                alpha: 0,
                y: "-=40",
                duration: 600,
                ease: "Power2",
                onComplete: () => {
                    title.destroy();
                    playButton.destroy();
                    gamename.destroy();

                    const luffy = this.physics.add.staticImage(this.scale.width / 2, this.scale.height - 20, "luffy");
                    luffy.setOrigin(0.5, 1);
                    luffy.setScale(0.20);
                    luffy.refreshBody();
                    const luffyBodyWidth = luffy.displayWidth * 0.42;
                    const luffyBodyHeight = luffy.displayHeight * 0.68;
                    luffy.body.setSize(luffyBodyWidth, luffyBodyHeight);
                    luffy.body.setOffset(
                        (luffy.displayWidth - luffyBodyWidth) / 2,
                        luffy.displayHeight - luffyBodyHeight
                    );
                    luffy.setAlpha(0);
                    this.luffyObject = luffy;

                    this.coinsGroup = this.physics.add.staticGroup();

                    const coin1 = this.coinsGroup.create(this.scale.width / 2, this.scale.height - 250, "coin");
                    coin1.setOrigin(0.5);
                    coin1.setScale(0.15);
                    coin1.refreshBody();
                    coin1.setAlpha(0);

                    const coin2 = this.coinsGroup.create(this.scale.width / 2, this.scale.height - 300, "coin");
                    coin2.setOrigin(0.5);
                    coin2.setScale(0.15);
                    coin2.refreshBody();
                    coin2.setAlpha(0);

                    const coin3 = this.coinsGroup.create(this.scale.width / 2, this.scale.height - 350, "coin");
                    coin3.setOrigin(0.5);
                    coin3.setScale(0.15);
                    coin3.refreshBody();
                    coin3.setAlpha(0);

                    const meat = this.add.image(this.scale.width / 2, this.scale.height - 415, "meat");
                    meat.setOrigin(0.5);
                    meat.setScale(0.15);
                    meat.setAlpha(0);

                    // Anchor point at connect.png (top-center of the coin stack)
                    const anchorX = this.scale.width / 2;
                    const anchorY = this.scale.height - 490;
                    const ropeLength = 80;

                    const connectImg = this.add.image(anchorX, anchorY, "connect");
                    connectImg.setOrigin(0.7, 0.5);
                    connectImg.setScale(0.35);
                    connectImg.setAlpha(0);
                    this.anchorImage = connectImg;

                    // Position meat at fixed rope length below anchor
                    meat.setPosition(anchorX, anchorY + ropeLength);
                    meat.setOrigin(0.7, 0.5);
                    this.hangingBaseX = anchorX;
                    this.hangingBaseY = anchorY + ropeLength;
                    this.swingPhase = Phaser.Math.FloatBetween(0, Math.PI * 2);

                    const ropeGraphics = this.add.graphics();
                    ropeGraphics.setAlpha(0);
                    this.ropeGraphics = ropeGraphics;
                    this.meatObject = meat;

                    this.tweens.add({
                        targets: [luffy, coin1, coin2, coin3, meat, connectImg, ropeGraphics],
                        alpha: 1,
                        duration: 400,
                        ease: "Power2"
                    });

                    // Listen for rope click — check if pointer is near the vertical rope line
                    this.ropeClickListener = (pointer) => {
                        if (this.ropeIsBroken) return;
                        const nearRope = this.isPointerNearSegment(
                            pointer.x,
                            pointer.y,
                            this.anchorImage.x,
                            this.anchorImage.y,
                            this.meatObject.x,
                            this.meatObject.y,
                            16
                        );
                        if (nearRope) {
                            this.ropeIsBroken = true;
                            this.ropeGraphics.clear();
                            // Add gravity to meat
                            this.physics.add.existing(this.meatObject);
                            this.meatObject.body.setGravityY(600);
                            this.meatObject.body.setCollideWorldBounds(true);
                            this.meatObject.body.setBounce(0.3);
                            const swingVelocityX = Math.cos((this.time.now * this.swingSpeed) + this.swingPhase) * this.swingAmplitude * this.swingSpeed * 1000;
                            this.meatObject.body.setVelocityX(swingVelocityX);
                            const meatW = this.meatObject.displayWidth * 0.5;
                            const meatH = this.meatObject.displayHeight * 0.5;
                            this.meatObject.body.setSize(meatW, meatH);
                            this.meatObject.body.setOffset(
                                (this.meatObject.width - meatW) / 2,
                                (this.meatObject.height - meatH) / 2
                            );
                            // Score on coin overlap
                            this.physics.add.overlap(
                                this.meatObject,
                                this.coinsGroup,
                                (meat, coin) => {
                                    this.score += 200;
                                    this.coinsCollected += 1;
                                    this.scoreText.setText(`Score: ${this.score}`);
                                    coin.destroy();
                                },
                                null,
                                this
                            );
                            // Meat disappears on Luffy collision
                            this.physics.add.overlap(
                                this.meatObject,
                                this.luffyObject,
                                (meat) => {
                                    if (this.hasWon) {
                                        return;
                                    }
                                    this.hasWon = true;
                                    meat.destroy();
                                    this.meatObject = null;
                                    this.scene.start("victory1", {
                                        score: this.score,
                                        coinsCollected: this.coinsCollected,
                                        totalCoins: 3
                                    });
                                },
                                null,
                                this
                            );
                            this.input.off("pointerdown", this.ropeClickListener);
                        }
                    };
                    this.input.on("pointerdown", this.ropeClickListener);
                }
            });
        });

        this.add.text(20, 20, "Level 1", {
            font: "25px Arial",
            fill: "#ffffff"
        });

        this.scoreText = this.add.text(this.scale.width - 20, 20, `Score: ${this.score}`, {
            font: "25px Arial",
            fill: "#ffffff"
        });
        this.scoreText.setOrigin(1, 0);
    }

    isPointerNearSegment(px, py, x1, y1, x2, y2, threshold) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = (dx * dx) + (dy * dy);

        if (lenSq === 0) {
            return Phaser.Math.Distance.Between(px, py, x1, y1) <= threshold;
        }

        const t = Phaser.Math.Clamp((((px - x1) * dx) + ((py - y1) * dy)) / lenSq, 0, 1);
        const projX = x1 + (t * dx);
        const projY = y1 + (t * dy);

        return Phaser.Math.Distance.Between(px, py, projX, projY) <= threshold;
    }

    update() {
        if (!this.ropeIsBroken && this.anchorImage && this.meatObject && this.ropeGraphics) {
            const t = (this.time.now * this.swingSpeed) + this.swingPhase;
            const swingX = Math.sin(t) * this.swingAmplitude;
            const swingY = Math.cos(t * 2) * 4;
            this.meatObject.setPosition(this.hangingBaseX + swingX, this.hangingBaseY + swingY);
            this.meatObject.setRotation(swingX * 0.004);

            this.ropeGraphics.clear();
            this.ropeGraphics.lineStyle(3, 0x8B4513, 1);
            this.ropeGraphics.beginPath();
            this.ropeGraphics.moveTo(this.anchorImage.x, this.anchorImage.y);
            this.ropeGraphics.lineTo(this.meatObject.x, this.meatObject.y);
            this.ropeGraphics.strokePath();
        }
        if (this.meatObject && this.luffyObject) {
            const meatBounds = this.meatObject.getBounds();
            const luffyBounds = this.luffyObject.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(meatBounds, luffyBounds)) {
                if (this.hasWon) {
                    return;
                }
                this.hasWon = true;
                this.meatObject.destroy();
                this.meatObject = null;
                this.scene.start("victory1", {
                    score: this.score,
                    coinsCollected: this.coinsCollected,
                    totalCoins: 3
                });
            }
        }
    }
}