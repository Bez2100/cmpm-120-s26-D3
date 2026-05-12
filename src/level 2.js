class Level2 extends Phaser.Scene {
    constructor() {
        super("Level2");
        this.score = 0;
        this.coinsCollected = 0;
        this.anchorImage = null;
        this.anchorImage2 = null;
        this.meatObject = null;
        this.ropeGraphics = null;
        this.coinsGroup = null;
        this.ropeIsBroken = false;
        this.rope1Cut = false;
        this.rope2Cut = false;
        this.luffyObject = null;
        this.ropeClickListener = null;
        this.rope1Length = 0;
        this.rope2Length = 0;
        this.hangVX = 0;
        this.hangVY = 0;
        this.lastUpdateMs = 0;
        this.hasWon = false;
    }

    preload() {
        this.load.image("level2", "assets/beach.png");
        this.load.image("luffy", "assets/luffy.png");
        this.load.image("coin", "assets/coin.png");
        this.load.image("meat", "assets/meat.png");
        this.load.image("connect", "assets/connect.png");
    }

    create() {
        // Reset all state for a fresh start
        this.score = 0;
        this.coinsCollected = 0;
        this.anchorImage = null;
        this.anchorImage2 = null;
        this.meatObject = null;
        this.ropeGraphics = null;
        this.coinsGroup = null;
        this.ropeIsBroken = false;
        this.rope1Cut = false;
        this.rope2Cut = false;
        this.luffyObject = null;
        this.ropeClickListener = null;
        this.rope1Length = 0;
        this.rope2Length = 0;
        this.hangVX = 0;
        this.hangVY = 0;
        this.lastUpdateMs = 0;
        this.hasWon = false;

        this.add
            .image(0, 0, "level2")
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);

        this.add.text(20, 20, "Level 2", {
            font: "25px Arial",
            fill: "#ffffff"
        });

        this.scoreText = this.add.text(this.scale.width - 20, 20, `Score: ${this.score}`, {
            font: "25px Arial",
            fill: "#ffffff"
        });
        this.scoreText.setOrigin(1, 0);

        const luffy = this.physics.add.staticImage(this.scale.width / 2, this.scale.height - 20, "luffy");
        luffy.setOrigin(0.5, 1);
        luffy.setScale(0.2);
        luffy.refreshBody();

        const luffyBodyWidth = luffy.displayWidth * 0.42;
        const luffyBodyHeight = luffy.displayHeight * 0.68;
        luffy.body.setSize(luffyBodyWidth, luffyBodyHeight);
        luffy.body.setOffset(
            (luffy.displayWidth - luffyBodyWidth) / 2,
            luffy.displayHeight - luffyBodyHeight
        );
        this.luffyObject = luffy;

        this.coinsGroup = this.physics.add.staticGroup();

        const coin1 = this.coinsGroup.create(this.scale.width / 2 - 60, this.scale.height - 270, "coin");
        coin1.setOrigin(0.5);
        coin1.setScale(0.15);
        coin1.refreshBody();

        const coin2 = this.coinsGroup.create(this.scale.width / 2 + 40, this.scale.height - 330, "coin");
        coin2.setOrigin(0.5);
        coin2.setScale(0.15);
        coin2.refreshBody();

        const coin3 = this.coinsGroup.create(this.scale.width / 2 + 120, this.scale.height - 250, "coin");
        coin3.setOrigin(0.5);
        coin3.setScale(0.15);
        coin3.refreshBody();

        const anchorX = this.scale.width / 2 + 180;
        const anchorY = this.scale.height - 500;
        const ropeLength = 95;

        const connectImg = this.add.image(anchorX, anchorY, "connect");
        connectImg.setOrigin(0.7, 0.5);
        connectImg.setScale(0.35);
        this.anchorImage = connectImg;

        const anchor2X = coin2.x - 70;
        const anchor2Y = coin2.y - 90;
        const connectImg2 = this.add.image(anchor2X, anchor2Y, "connect");
        connectImg2.setOrigin(0.7, 0.5);
        connectImg2.setScale(0.35);
        this.anchorImage2 = connectImg2;

        const meat = this.add.image(anchorX, anchorY + ropeLength, "meat");
        meat.setOrigin(0.7, 0.5);
        meat.setScale(0.15);
        this.meatObject = meat;
        this.meatObject.setPosition((anchorX + anchor2X) / 2, ((anchorY + anchor2Y) / 2) + ropeLength);

        this.rope1Length = Phaser.Math.Distance.Between(
            this.anchorImage.x,
            this.anchorImage.y,
            this.meatObject.x,
            this.meatObject.y
        );
        this.rope2Length = Phaser.Math.Distance.Between(
            this.anchorImage2.x,
            this.anchorImage2.y,
            this.meatObject.x,
            this.meatObject.y
        );
        this.hangVX = Phaser.Math.Between(-40, 40);
        this.hangVY = 0;
        this.lastUpdateMs = this.time.now;

        this.ropeGraphics = this.add.graphics();

        this.ropeClickListener = (pointer) => {
            if (this.ropeIsBroken || !this.anchorImage || !this.anchorImage2 || !this.meatObject) {
                return;
            }

            const nearRope1 = !this.rope1Cut && this.isPointerNearSegment(
                pointer.x,
                pointer.y,
                this.anchorImage.x,
                this.anchorImage.y,
                this.meatObject.x,
                this.meatObject.y,
                16
            );
            const nearRope2 = !this.rope2Cut && this.isPointerNearSegment(
                pointer.x,
                pointer.y,
                this.anchorImage2.x,
                this.anchorImage2.y,
                this.meatObject.x,
                this.meatObject.y,
                16
            );

            if (!nearRope1 && !nearRope2) {
                return;
            }

            if (nearRope1) {
                this.rope1Cut = true;
            }
            if (nearRope2) {
                this.rope2Cut = true;
            }

            if (!(this.rope1Cut && this.rope2Cut)) {
                return;
            }

            this.ropeIsBroken = true;
            this.ropeGraphics.clear();

            this.meatObject.setRotation(0);
            this.physics.add.existing(this.meatObject);
            this.meatObject.body.setGravityY(600);
            this.meatObject.body.setCollideWorldBounds(true);
            this.meatObject.body.onWorldBounds = true;
            this.physics.world.on('worldbounds', (body) => {
                if (body.gameObject === this.meatObject) {
                    this.scene.start("GameOver", { level: 2 });
                }
            }, this);
            this.meatObject.body.setBounce(0.3);

            this.meatObject.body.setVelocity(this.hangVX, this.hangVY);

            const meatW = this.meatObject.displayWidth;
            const meatH = this.meatObject.displayHeight;
            this.meatObject.body.setSize(meatW, meatH);
            this.meatObject.body.setOffset(0, 0);

            this.physics.add.overlap(
                this.meatObject,
                this.luffyObject,
                (meatObj) => {
                    this.finishLevel(meatObj);
                },
                null,
                this
            );

            this.input.off("pointerdown", this.ropeClickListener);
        };

        this.input.on("pointerdown", this.ropeClickListener);
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

    constrainToAnchor(anchor, ropeLength) {
        const dx = this.meatObject.x - anchor.x;
        const dy = this.meatObject.y - anchor.y;
        const dist = Math.sqrt((dx * dx) + (dy * dy));

        if (dist <= 0.0001) {
            return;
        }

        const nx = dx / dist;
        const ny = dy / dist;
        const correction = dist - ropeLength;

        this.meatObject.x -= nx * correction;
        this.meatObject.y -= ny * correction;

        const radialSpeed = (this.hangVX * nx) + (this.hangVY * ny);
        this.hangVX -= nx * radialSpeed * 0.9;
        this.hangVY -= ny * radialSpeed * 0.9;
    }

    finishLevel(meatObj = this.meatObject) {
        if (this.hasWon) {
            return;
        }

        this.hasWon = true;

        if (meatObj) {
            meatObj.destroy();
        }

        this.meatObject = null;
        this.scene.start("victory2", {
            score: this.score,
            coinsCollected: this.coinsCollected,
            totalCoins: 3
        });
    }

    collectCoin(coin) {
        if (!coin || !coin.active) {
            return;
        }

        this.score += 200;
        this.coinsCollected += 1;
        this.scoreText.setText(`Score: ${this.score}`);
        coin.destroy();
    }

    update() {
        if (!this.ropeIsBroken && this.anchorImage && this.anchorImage2 && this.meatObject && this.ropeGraphics) {
            const now = this.time.now;
            const dt = Math.min((now - this.lastUpdateMs) / 1000, 0.033);
            this.lastUpdateMs = now;

            this.hangVY += 260 * dt;
            this.hangVX *= 0.995;
            this.hangVY *= 0.995;

            this.meatObject.x += this.hangVX * dt;
            this.meatObject.y += this.hangVY * dt;

            for (let i = 0; i < 2; i += 1) {
                if (!this.rope1Cut) {
                    this.constrainToAnchor(this.anchorImage, this.rope1Length);
                }
                if (!this.rope2Cut) {
                    this.constrainToAnchor(this.anchorImage2, this.rope2Length);
                }
            }

            this.meatObject.setRotation(this.hangVX * 0.0025);

            this.ropeGraphics.clear();
            this.ropeGraphics.lineStyle(3, 0x8b4513, 1);
            this.ropeGraphics.beginPath();
            if (!this.rope1Cut) {
                this.ropeGraphics.moveTo(this.anchorImage.x, this.anchorImage.y);
                this.ropeGraphics.lineTo(this.meatObject.x, this.meatObject.y);
            }
            if (!this.rope2Cut) {
                this.ropeGraphics.moveTo(this.anchorImage2.x, this.anchorImage2.y);
                this.ropeGraphics.lineTo(this.meatObject.x, this.meatObject.y);
            }
            this.ropeGraphics.strokePath();
        }

        if (this.meatObject && this.coinsGroup) {
            const meatBounds = this.meatObject.getBounds();
            this.coinsGroup.getChildren().forEach((coin) => {
                if (!coin || !coin.active) {
                    return;
                }

                const coinBounds = coin.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(meatBounds, coinBounds)) {
                    this.collectCoin(coin);
                }
            });
        }

        if (this.meatObject && this.luffyObject) {
            const meatBounds = this.meatObject.getBounds();
            const luffyBounds = this.luffyObject.getBounds();

            if (Phaser.Geom.Intersects.RectangleToRectangle(meatBounds, luffyBounds)) {
                this.finishLevel();
            }
        }
    }
}
