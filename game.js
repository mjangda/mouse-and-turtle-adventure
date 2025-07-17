class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gravity = 0.8;
        this.friction = 0.85;
        
        this.keys = {};
        this.gameState = 'playing';
        this.currentLevel = 1;
        
        this.mickey = new Mickey(100, 400);
        this.bowser = new Bowser(200, 400);
        
        this.projectiles = [];
        this.platforms = this.createLevel(this.currentLevel);
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    createLevel(level) {
        const platforms = [];
        this.enemies = [];
        this.items = [];
        
        if (level === 1) {
            platforms.push(new Platform(0, this.height - 40, this.width, 40, '#4a4a4a'));
            platforms.push(new Platform(300, 500, 200, 20, '#8B4513'));
            platforms.push(new Platform(600, 400, 200, 20, '#8B4513'));
            platforms.push(new Platform(900, 300, 200, 20, '#8B4513'));
            platforms.push(new Platform(200, 350, 150, 20, '#8B4513'));
            
            this.enemies = [
                new Enemy(400, 460, 'ghost'),
                new Enemy(700, 360, 'skeleton'),
                new Enemy(1000, 260, 'bat')
            ];
            
            this.items.push(new Item(950, 250, 'portal'));
            
        } else if (level === 2) {
            platforms.push(new Platform(0, this.height - 40, this.width, 40, '#2F4F2F'));
            platforms.push(new Platform(100, 450, 150, 20, '#8B0000'));
            platforms.push(new Platform(350, 380, 100, 20, '#8B0000'));
            platforms.push(new Platform(550, 320, 150, 20, '#8B0000'));
            platforms.push(new Platform(800, 250, 100, 20, '#8B0000'));
            platforms.push(new Platform(1000, 180, 150, 20, '#8B0000'));
            platforms.push(new Platform(250, 200, 200, 20, '#8B0000'));
            platforms.push(new Platform(500, 150, 150, 20, '#8B0000'));
            
            this.enemies = [
                new Enemy(150, 410, 'ghost'),
                new Enemy(400, 340, 'skeleton'),
                new Enemy(600, 280, 'ghost'),
                new Enemy(850, 210, 'bat'),
                new Enemy(1050, 140, 'skeleton'),
                new Enemy(300, 160, 'ghost')
            ];
            
            this.items.push(new Item(575, 100, 'portal'));
            
        } else if (level === 3) {
            platforms.push(new Platform(0, this.height - 40, this.width, 40, '#F4A460'));
            platforms.push(new Platform(200, 500, 150, 20, '#DEB887'));
            platforms.push(new Platform(450, 420, 200, 20, '#DEB887'));
            platforms.push(new Platform(750, 350, 150, 20, '#DEB887'));
            platforms.push(new Platform(300, 280, 200, 20, '#DEB887'));
            platforms.push(new Platform(600, 200, 150, 20, '#DEB887'));
            platforms.push(new Platform(900, 150, 200, 20, '#DEB887'));
            
            this.enemies = [
                new Enemy(250, 460, 'skeleton'),
                new Enemy(500, 380, 'ghost'),
                new Enemy(800, 310, 'bat'),
                new Enemy(350, 240, 'skeleton'),
                new Enemy(650, 160, 'ghost'),
                new Enemy(950, 110, 'bat'),
                new Enemy(1050, 110, 'skeleton')
            ];
            
            this.items.push(new Item(1000, 100, 'goldenCup'));
        }
        
        return platforms;
    }
    
    update() {
        this.mickey.update(this.keys, this.platforms);
        this.bowser.update(this.keys, this.platforms);
        
        this.enemies.forEach(enemy => enemy.update(this.platforms));
        
        this.projectiles.forEach((projectile, index) => {
            projectile.update();
            if (projectile.x < 0 || projectile.x > this.width || 
                projectile.y < 0 || projectile.y > this.height) {
                this.projectiles.splice(index, 1);
            }
        });
        
        this.checkCollisions();
        this.updateUI();
    }
    
    checkCollisions() {
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.isColliding(this.mickey, enemy)) {
                if (this.mickey.attacking) {
                    this.enemies.splice(enemyIndex, 1);
                } else {
                    this.mickey.takeDamage(10);
                }
            }
            
            if (this.isColliding(this.bowser, enemy)) {
                if (this.bowser.attacking) {
                    this.enemies.splice(enemyIndex, 1);
                } else {
                    this.bowser.takeDamage(10);
                }
            }
            
            this.projectiles.forEach((projectile, projIndex) => {
                if (this.isColliding(projectile, enemy)) {
                    this.enemies.splice(enemyIndex, 1);
                    this.projectiles.splice(projIndex, 1);
                }
            });
        });
        
        this.items.forEach((item, index) => {
            const mickeyTouching = this.isColliding(this.mickey, item);
            const bowserTouching = this.isColliding(this.bowser, item);
            
            if (mickeyTouching || bowserTouching) {
                if (item.type === 'goldenCup') {
                    this.gameState = 'victory';
                    this.items.splice(index, 1);
                } else if (item.type === 'portal') {
                    if (mickeyTouching && bowserTouching) {
                        this.nextLevel();
                        return;
                    } else {
                        item.bothNeeded = true;
                    }
                }
            } else if (item.type === 'portal') {
                item.bothNeeded = false;
            }
        });
    }
    
    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel <= 3) {
            this.resetCharacterPositions();
            this.platforms = this.createLevel(this.currentLevel);
            this.projectiles = [];
        }
    }
    
    jumpToLevel(level) {
        if (level >= 1 && level <= 3) {
            this.currentLevel = level;
            this.resetCharacterPositions();
            this.platforms = this.createLevel(this.currentLevel);
            this.projectiles = [];
            this.gameState = 'playing';
        }
    }
    
    resetCharacterPositions() {
        this.mickey.x = 100;
        this.mickey.y = 400;
        this.mickey.vx = 0;
        this.mickey.vy = 0;
        this.mickey.health = Math.max(this.mickey.health, 50);
        
        this.bowser.x = 200;
        this.bowser.y = 400;
        this.bowser.vx = 0;
        this.bowser.vy = 0;
        this.bowser.health = Math.max(this.bowser.health, 50);
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    render() {
        this.renderBackground();
        
        this.platforms.forEach(platform => platform.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        this.items.forEach(item => item.render(this.ctx));
        
        this.mickey.render(this.ctx);
        this.bowser.render(this.ctx);
        
        this.renderLevelInfo();
        
        if (this.gameState === 'victory') {
            this.renderVictoryScreen();
        }
    }
    
    renderBackground() {
        if (this.currentLevel === 1) {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#87ceeb');
            gradient.addColorStop(1, '#98fb98');
            this.ctx.fillStyle = gradient;
        } else if (this.currentLevel === 2) {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#2F2F2F');
            gradient.addColorStop(1, '#4B0082');
            this.ctx.fillStyle = gradient;
        } else if (this.currentLevel === 3) {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#FF6347');
            gradient.addColorStop(1, '#F4A460');
            this.ctx.fillStyle = gradient;
        }
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    renderLevelInfo() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        
        if (this.currentLevel === 1) {
            this.ctx.fillText('The Forest Path', this.width / 2, 50);
        } else if (this.currentLevel === 2) {
            this.ctx.fillText('The Haunted Mansion', this.width / 2, 50);
        } else if (this.currentLevel === 3) {
            this.ctx.fillText('Haunted Beach of Doom', this.width / 2, 50);
        }
        
        this.ctx.textAlign = 'left';
    }
    
    renderVictoryScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTORY!', this.width / 2, this.height / 2 - 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Mickey and Bowser found the Golden Cup of Infinity!', this.width / 2, this.height / 2 + 20);
    }
    
    updateUI() {
        document.getElementById('mickeyHealth').textContent = this.mickey.health;
        document.getElementById('bowserHealth').textContent = this.bowser.health;
        document.getElementById('currentLevel').textContent = this.currentLevel;
        
        // Update level button states
        document.querySelectorAll('.level-button').forEach((button, index) => {
            button.classList.toggle('active', index + 1 === this.currentLevel);
        });
        
        // Debug: log items array
        if (this.items.length > 0) {
            console.log(`Level ${this.currentLevel} has ${this.items.length} items:`, this.items.map(item => `${item.type} at (${item.x}, ${item.y})`));
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Character {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.health = 100;
        this.attacking = false;
        this.attackCooldown = 0;
        this.speed = 5;
        this.jumpPower = 15;
    }
    
    update(keys, platforms) {
        this.handleInput(keys);
        this.applyPhysics();
        this.checkPlatformCollisions(platforms);
        
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        } else {
            this.attacking = false;
        }
    }
    
    applyPhysics() {
        this.vy += 0.8;
        this.vx *= 0.85;
        
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        if (this.x + this.width > 1200) {
            this.x = 1200 - this.width;
            this.vx = 0;
        }
        
        if (this.y > 600) {
            this.y = 100;
            this.health -= 20;
        }
    }
    
    checkPlatformCollisions(platforms) {
        this.onGround = false;
        
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                if (this.vy > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        });
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    
    attack() {
        if (this.attackCooldown === 0) {
            this.attacking = true;
            this.attackCooldown = 30;
        }
    }
}

class Mickey extends Character {
    constructor(x, y) {
        super(x, y, 40, 40, '#FFB6C1');
        this.ears = true;
    }
    
    handleInput(keys) {
        if (keys['a']) {
            this.vx = -this.speed;
        }
        if (keys['d']) {
            this.vx = this.speed;
        }
        if (keys['w'] && this.onGround) {
            this.vy = -this.jumpPower;
        }
        if (keys['s']) {
            this.throwPaintball();
        }
    }
    
    throwPaintball() {
        if (this.attackCooldown === 0) {
            this.attacking = true;
            this.attackCooldown = 20;
            game.projectiles.push(new Paintball(this.x + this.width, this.y + this.height / 2));
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.attacking ? '#FF69B4' : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 5, 8, 0, Math.PI * 2);
        ctx.arc(this.x + 30, this.y + 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y + 15, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 28, this.y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 25, 4, 0, Math.PI);
        ctx.fill();
    }
}

class Bowser extends Character {
    constructor(x, y) {
        super(x, y, 50, 45, '#228B22');
        this.shell = true;
    }
    
    handleInput(keys) {
        if (keys['arrowleft']) {
            this.vx = -this.speed;
        }
        if (keys['arrowright']) {
            this.vx = this.speed;
        }
        if (keys['arrowup'] && this.onGround) {
            this.vy = -this.jumpPower;
        }
        if (keys['arrowdown']) {
            this.fireAttack();
        }
    }
    
    fireAttack() {
        if (this.attackCooldown === 0) {
            this.attacking = true;
            this.attackCooldown = 60;
            game.projectiles.push(new Fireball(this.x + this.width, this.y + this.height / 2));
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.attacking ? '#FF4500' : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 5, this.y - 10, this.width - 10, 15);
        
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 35, this.y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.attacking) {
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.arc(this.x + 50, this.y + 20, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Platform {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.vx = Math.random() > 0.5 ? 1 : -1;
        this.vy = 0;
        this.health = 50;
    }
    
    update(platforms) {
        this.x += this.vx;
        this.vy += 0.5;
        this.y += this.vy;
        
        if (this.x <= 0 || this.x >= 1170) {
            this.vx *= -1;
        }
        
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                if (this.vy > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                }
            }
        });
    }
    
    render(ctx) {
        if (this.type === 'ghost') {
            ctx.fillStyle = '#E6E6FA';
            ctx.globalAlpha = 0.7;
        } else if (this.type === 'skeleton') {
            ctx.fillStyle = '#F5F5DC';
        } else if (this.type === 'bat') {
            ctx.fillStyle = '#2F2F2F';
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 8, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 22, this.y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
}

class Fireball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.vx = 8;
        this.vy = 0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    render(ctx) {
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/4, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Paintball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 12;
        this.vx = 10;
        this.vy = 0;
        this.colors = ['#FF1493', '#00CED1', '#32CD32', '#FFD700', '#FF4500'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 2, this.y + this.height/2 - 2, this.width/4, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = type === 'portal' ? 50 : 30;
        this.height = type === 'portal' ? 50 : 30;
        this.type = type;
        this.animationFrame = 0;
    }
    
    render(ctx) {
        this.animationFrame++;
        
        if (this.type === 'goldenCup') {
            const glow = Math.sin(this.animationFrame * 0.1) * 0.3 + 0.7;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10 * glow;
            
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x, this.y + 10, this.width, this.height - 10);
            
            ctx.fillRect(this.x - 5, this.y + 15, 10, 5);
            ctx.fillRect(this.x + this.width - 5, this.y + 15, 10, 5);
            
            ctx.fillRect(this.x + 5, this.y, this.width - 10, 15);
            
            ctx.strokeStyle = '#B8860B';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y + 10, this.width, this.height - 10);
            
            ctx.shadowBlur = 0;
            
        } else if (this.type === 'portal') {
            const pulseSize = Math.sin(this.animationFrame * 0.15) * 10 + 50;
            const baseColor = this.bothNeeded ? [255, 165, 0] : [138, 43, 226];
            
            // Debug: Draw collision box
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            ctx.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${0.8 + Math.sin(this.animationFrame * 0.1) * 0.2})`;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, pulseSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = `rgba(${Math.floor(baseColor[0] * 0.6)}, ${Math.floor(baseColor[1] * 0.6)}, ${Math.floor(baseColor[2] * 0.6)}, 0.9)`;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, pulseSize/3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Portal label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PORTAL', this.x + this.width/2, this.y - 15);
            
            if (this.bothNeeded) {
                ctx.fillStyle = '#FFFF00';
                ctx.font = '12px Arial';
                ctx.fillText('Both Needed!', this.x + this.width/2, this.y - 30);
            }
        }
    }
}

let game = new Game();

// Global function for level navigation buttons
function jumpToLevel(level) {
    game.jumpToLevel(level);
}