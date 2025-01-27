const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreDisplay = document.getElementById('score');
const specialCountDisplay = document.getElementById('specialCount');

let characters = [];
let score = 0;
let gameRunning = false;

// 特異キャラクターの数を更新する関数
function updateSpecialCount() {
  const specialCount = characters.filter(char => char.isSpecial).length;
  specialCountDisplay.textContent = specialCount;
}

// キャラクタークラス
class Character {
  constructor(x, y, isSpecial) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.isSpecial = isSpecial; // 特異的動作を持つかどうか
    this.dx = Math.random() * 2 - 1;
    this.dy = Math.random() * 2 - 1;
    this.color = isSpecial ? 'red' : 'blue';
    this.color = 'gray';
    this.fill_color = 'rgba(0, 0, 255, 0.5)';
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    // 輪郭線の設定
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.stroke();
    // 半透明の塗りつぶし
    ctx.fillStyle = this.fill_color
    ctx.fill();
    ctx.closePath();
  }

  move() {
    this.x += this.dx * (this.isSpecial ? 2 : 1); // 特異キャラは速く動く
    this.y += this.dy * (this.isSpecial ? 2 : 1);

    // キャンバスの境界で跳ね返る
    if (this.x < this.radius || this.x > canvas.width - this.radius) this.dx *= -1;
    if (this.y < this.radius || this.y > canvas.height - this.radius) this.dy *= -1;
  }

  // 他のキャラクターとの衝突を検出
  checkCollision(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // 描画された境界の30%を基準にする（radiusの70%を使用）
    const collisionRadius = this.radius * 0.7;
    const otherCollisionRadius = other.radius * 0.7;
    return distance < (collisionRadius + otherCollisionRadius);
  }

  // 衝突時の方向転換
  reverseDirection() {
    this.dx *= -1;
    this.dy *= -1;
  }
}

// ゲーム開始
function startGame() {
  score = 0;
  gameRunning = true;
  characters = [];

  // 通常キャラクターを17個生成
  for (let i = 0; i < 17; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    characters.push(new Character(x, y, false));
  }

  // 特異キャラクターを3個生成
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    characters.push(new Character(x, y, true));
  }

  updateSpecialCount(); // 特異キャラクターの数を初期表示
  requestAnimationFrame(gameLoop);
}

// ゲームループ
function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // キャラクター同士の衝突チェック
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      if (characters[i].checkCollision(characters[j])) {
        characters[i].reverseDirection();
        characters[j].reverseDirection();
      }
    }
  }

  // キャラクターの移動と描画
  characters.forEach((char) => {
    char.move();
    char.draw();
  });

  requestAnimationFrame(gameLoop);
}

// キャラクタークリック処理
canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  characters.forEach((char, index) => {
    const dist = Math.sqrt((char.x - clickX) ** 2 + (char.y - clickY) ** 2);
    if (dist < char.radius) {
      if (char.isSpecial) {
        score += 10;
        characters.splice(index, 1); // キャラクターを削除
      } else {
        score -= 5;
        char.color = 'blue'
        char.fill_color = 'rgba(200, 200, 200, 0.5)';
        char.color = 'gray';
      }
      //characters.splice(index, 1); // キャラクターを削除
      updateSpecialCount(); // 特異キャラクターの数を更新
    }
  });

  scoreDisplay.textContent = score;
});

// ボタンクリックでスタート
startBtn.addEventListener('click', startGame);
