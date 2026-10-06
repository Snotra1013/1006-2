// ==========================================================
// p5.js 高一英文單字測驗系統 (sketch.js)
// 響應式 (RWD) 優化版：自動適應手機、平板與桌機螢幕
// 每條指令均附帶中文註解
// ==========================================================

// 高一英文單字測驗題目庫 (共 5 題)
let questions = [
  {
    question: "1. 'Reluctant' 最接近下列哪一個中文意思？",
    options: ["A. 不情願的", "B. 熱情的", "C. 靈活的", "D. 顯著的"],
    answer: 0 // 正確答案：A
  },
  {
    question: "2. The heavy rain was a major _______ to our outdoor activity.",
    options: ["A. solution (解決方案)", "B. obstacle (障礙)", "C. advantage (優點)", "D. feature (特色)"],
    answer: 1 // 正確答案：B
  },
  {
    question: "3. She is very _______ about learning new languages.",
    options: ["A. reluctant (不情願)", "B. enthusiastic (熱情的)", "C. careless (粗心的)", "D. hostile (敵意的)"],
    answer: 1 // 正確答案：B
  },
  {
    question: "4. To achieve success, you must _______ through all difficulties.",
    options: ["A. persevere (堅持)", "B. hesitate (猶豫)", "C. abandon (放棄)", "D. collapse (倒塌)"],
    answer: 0 // 正確答案：A
  },
  {
    question: "5. He _______ broke the window to get everyone's attention.",
    options: ["A. accidentally (意外地)", "B. deliberately (故意地)", "C. scarcely (幾乎不)", "D. gradually (漸漸地)"],
    answer: 1 // 正確答案：B
  }
];

// ---------- 配色主題集中管理 ----------
const PALETTE = {
  bg:        [233, 229, 223],    // 暖灰米色背景
  card:      [249, 247, 243],    // 奶油白卡片底色
  cardLine:  [222, 217, 209],    // 卡片邊框色
  ink:       [78, 73, 70],       // 主文字深灰褐色
  muted:     [154, 147, 140],    // 次要文字灰褐色
  track:     [224, 219, 211],    // 進度條軌道色
  accent:    [118, 134, 150],    // 主點綴灰藍色
  accentDk:  [96, 112, 128],     // 點綴色懸停加深
  optBg:     [244, 241, 236],    // 選項按鈕預設底色
  optHover:  [236, 232, 225],    // 選項按鈕懸停底色
  optLine:   [218, 212, 204],    // 選項按鈕預設邊框
  okBg:      [220, 228, 213],    // 答對時的綠色底色
  okLine:    [138, 163, 132],    // 答對時的綠色邊框
  okText:    [66, 88, 62],       // 答對時的綠色文字
  badBg:     [238, 218, 214],    // 答錯時的紅色底色
  badLine:   [190, 134, 128],    // 答錯時的紅色邊框
  badText:   [112, 68, 64],      // 答錯時的紅色文字
  hintBg:    '#caf0f8',          // 答錯時，提示正確答案的亮藍色底色
  hintLine:  [124, 152, 166],    // 提示正確答案的邊框
  hintText:  [58, 80, 92]        // 提示正確答案的文字色
};

// 系統狀態變數
let currentQuestion = 0;    // 當前題目索引 (0 ~ 4)
let score = 0;              // 答對累積題數
let selectedOption = -1;    // 玩家點選的選項 (-1 代表尚未點選)
let isAnswered = false;     // 目前題目是否已經作答
let isCorrect = false;      // 目前題目是否答對

// 響應式 UI 按鈕座標儲存物件
let optionButtons = [];     // 儲存 4 個選項按鈕的座標區域
let nextButton = {};        // 儲存「下一題」按鈕的座標區域
let restartButton = {};     // 儲存「重新開始」按鈕的座標區域

// 初始化 setup 函式：只執行一次
function setup() {
  // 建立與視窗大小相同的全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 設定文字預設對齊方式為水平居中、垂直居中
  textAlign(CENTER, CENTER);
}

// 主繪製迴圈：每秒預設執行 60 次
function draw() {
  // 塗刷背景顏色
  background(...PALETTE.bg);
  // 預設將滑鼠游標設為標準箭頭
  cursor(ARROW);

  // 根據當前題號判斷顯示測驗畫面或結果畫面
  if (currentQuestion < questions.length) {
    drawQuizScreen();
  } else {
    drawResultScreen();
  }
}

// 繪製卡片底圖與柔和陰影 (通用組件)
function drawCard(x, y, w, h, r) {
  push(); // 隔離繪圖狀態
  // 設定 CSS3 柔和陰影
  drawingContext.shadowColor = 'rgba(90, 80, 70, 0.12)';
  drawingContext.shadowBlur = 20;
  drawingContext.shadowOffsetY = 6;
  fill(...PALETTE.card);       // 卡片填滿色
  stroke(...PALETTE.cardLine); // 卡片邊框色
  strokeWeight(1);             // 邊框粗細
  rect(x, y, w, h, r);         // 繪製圓角矩形卡片
  pop();  // 恢復繪圖狀態
}

// 繪製圓角膠囊按鈕 (通用組件)
function drawPillButton(btn, label, baseCol, hoverCol) {
  // 判斷滑鼠是否懸停於按鈕上
  let hover = isMouseOver(btn.x, btn.y, btn.w, btn.h);
  if (hover) cursor(HAND); // 若懸停則更改游標為手勢

  push();
  // 繪製按鈕下方的微陰影
  drawingContext.shadowColor = 'rgba(90, 80, 70, 0.16)';
  drawingContext.shadowBlur = 10;
  drawingContext.shadowOffsetY = 3;
  noStroke();
  fill(...(hover ? hoverCol : baseCol)); // 動態切換預設與懸停顏色
  rect(btn.x, btn.y, btn.w, btn.h, btn.h / 2); // 圓角膠囊形狀
  pop();

  // 繪製按鈕文字
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  // 依據按鈕高度自動計算適當字體大小 (RWD)
  textSize(constrain(btn.h * 0.38, 13, 16));
  textStyle(BOLD);
  text(label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  textStyle(NORMAL);
}

// 繪製響應式測驗主介面
function drawQuizScreen() {
  let q = questions[currentQuestion];

  // ===== RWD 佈局參數動態計算 =====
  // 依據視窗寬度決定卡片寬度 (手機佔 92%，桌機最大 620px)
  let cardW = min(width * 0.92, 620);
  // 依據視窗高度動態計算最小所需卡片高度，確保不溢出畫面
  let cardH = min(height * 0.92, 580);
  // 動態設定最小高度限制，防止極小螢幕壓縮
  cardH = max(cardH, 420);
  
  // 計算卡片置中座標
  let cardX = (width - cardW) / 2;
  let cardY = (height - cardH) / 2;

  // 動態邊距 (隨螢幕寬度調整)
  let padX = constrain(cardW * 0.06, 16, 36);
  let innerW = cardW - padX * 2;

  // 繪製主卡片容器
  drawCard(cardX, cardY, cardW, cardH, 20);

  // ===== 1. 頂部：標題列與動態進度條 =====
  let topY = cardY + cardH * 0.06;

  noStroke();
  fill(...PALETTE.muted);
  textSize(constrain(cardW * 0.028, 12, 14));
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
  text("高一英文單字測驗", cardX + padX, topY);

  textAlign(RIGHT, CENTER);
  text(`${currentQuestion + 1} / ${questions.length}`, cardX + cardW - padX, topY);

  // 計算並繪製進度條
  let barY = topY + 18;
  let progressRatio = (currentQuestion + 1) / questions.length;
  fill(...PALETTE.track);
  rect(cardX + padX, barY, innerW, 4, 2); // 進度條軌道
  fill(...PALETTE.accent);
  rect(cardX + padX, barY, innerW * progressRatio, 4, 2); // 進度條填滿

  // ===== 2. 題目文字繪製 (自動適應字級與高度) =====
  let qY = barY + 22;
  let qH = cardH * 0.16; // 題目區域佔卡片高度的比例
  fill(...PALETTE.ink);
  // 根據卡片寬度動態調整題目字級
  textSize(constrain(cardW * 0.035, 15, 20));
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  // 使用四參數 text() 自動在區域內進行換行
  text(q.question, cardX + padX, qY, innerW, qH);
  textStyle(NORMAL);

  // ===== 3. 選項按鈕區域 (核心 RWD 高度計算) =====
  optionButtons = [];
  let optStartY = qY + qH + 8;
  // 預留底部「下一題」按鈕的高度空間
  let bottomReservedH = cardH * 0.15;
  // 計算剩餘可用於 4 個選項的高度
  let availH = (cardY + cardH - bottomReservedH) - optStartY;
  let gap = constrain(availH * 0.05, 6, 12); // 動態計算選項間距
  // 自動計算每一個選項按鈕的高度
  let btnHeight = constrain((availH - gap * 3) / 4, 38, 54);

  for (let i = 0; i < q.options.length; i++) {
    let btnX = cardX + padX;
    let btnY = optStartY + i * (btnHeight + gap);
    let btnW = innerW;

    // 預設選項卡片樣式
    let bgColor = color(...PALETTE.optBg);
    let strokeColor = color(...PALETTE.optLine);
    let textColor = color(...PALETTE.ink);
    let badgeFill = color(...PALETTE.track);
    let badgeText = color(...PALETTE.muted);
    let offsetY = 0; // 用於跳動動畫的垂直偏移量

    // 滑鼠懸停於選項上時的視覺反饋
    if (isMouseOver(btnX, btnY, btnW, btnHeight) && !isAnswered) {
      cursor(HAND);
      bgColor = color(...PALETTE.optHover);
      strokeColor = color(...PALETTE.accent);
      badgeFill = color(...PALETTE.accent);
      badgeText = color(255);
    }

    // 已經作答時的顏色狀態處理
    if (isAnswered) {
      if (i === q.answer) {
        if (!isCorrect) {
          // 答錯時：正確選項更換為 #caf0f8 底色，並加上正弦波跳動效果
          bgColor = color(PALETTE.hintBg);
          strokeColor = color(...PALETTE.hintLine);
          textColor = color(...PALETTE.hintText);
          badgeFill = color(...PALETTE.hintLine);
          badgeText = color(255);
          // 使用 sin() 動態計算跳動位移
          offsetY = sin(frameCount * 0.18) * 6;
        } else {
          // 答對時：正確選項顯示鼠尾草綠色
          bgColor = color(...PALETTE.okBg);
          strokeColor = color(...PALETTE.okLine);
          textColor = color(...PALETTE.okText);
          badgeFill = color(...PALETTE.okLine);
          badgeText = color(255);
        }
      } else if (i === selectedOption && !isCorrect) {
        // 使用者選錯的選項：顯示淡紅色
        bgColor = color(...PALETTE.badBg);
        strokeColor = color(...PALETTE.badLine);
        textColor = color(...PALETTE.badText);
        badgeFill = color(...PALETTE.badLine);
        badgeText = color(255);
      }
    }

    // 將按鈕邊界記錄於陣列中，以供點擊觸發偵測
    optionButtons.push({ x: btnX, y: btnY, w: btnW, h: btnHeight, index: i });

    // 繪製選項卡片本體
    push();
    translate(0, offsetY); // 加上動畫位移平移

    fill(bgColor);
    stroke(strokeColor);
    strokeWeight(1.2);
    rect(btnX, btnY, btnW, btnHeight, 10); // 繪製選項矩形

    // 繪製左側選項字母圓形徽章 (A, B, C, D)
    let badgeR = constrain(btnHeight - 16, 22, 30);
    let badgeCX = btnX + 12 + badgeR / 2;
    let badgeCY = btnY + btnHeight / 2;
    noStroke();
    fill(badgeFill);
    ellipse(badgeCX, badgeCY, badgeR, badgeR);

    // 徽章內的字母文字
    fill(badgeText);
    textAlign(CENTER, CENTER);
    textSize(constrain(badgeR * 0.48, 11, 14));
    textStyle(BOLD);
    text(q.options[i].charAt(0), badgeCX, badgeCY + 1);
    textStyle(NORMAL);

    // 繪製選項文字 (切除前三個字元 "A. "，因已在圓形徽章內呈現)
    fill(textColor);
    textAlign(LEFT, CENTER);
    textSize(constrain(cardW * 0.026, 13, 15));
    text(q.options[i].substring(3), badgeCX + badgeR / 2 + 10, btnY + btnHeight / 2 + 1);
    pop();
  }
  textAlign(CENTER, CENTER); // 恢復預設對齊方式

  // ===== 4. 「下一題 / 查看結果」按鈕 (僅於答題後動態呈現) =====
  if (isAnswered) {
    let nextW = constrain(cardW * 0.28, 120, 160);
    let nextH = constrain(cardH * 0.08, 36, 44);
    
    // 設置於卡片右下角
    nextButton = {
      x: cardX + cardW - padX - nextW,
      y: cardY + cardH - (cardH * 0.04) - nextH,
      w: nextW,
      h: nextH
    };
    
    let label = (currentQuestion === questions.length - 1) ? "查看結果  →" : "下一題  →";
    // 呼叫通用按鈕繪製函式
    drawPillButton(nextButton, label, PALETTE.accent, PALETTE.accentDk);
  }
}

// 繪製響應式測驗結果結算畫面
function drawResultScreen() {
  // 動態計算結算卡片尺寸
  let cardW = min(width * 0.9, 450);
  let cardH = min(height * 0.85, 420);
  cardH = max(cardH, 360); // 最小高度保護

  let cardX = (width - cardW) / 2;
  let cardY = (height - cardH) / 2;

  // 繪製卡片底圖
  drawCard(cardX, cardY, cardW, cardH, 20);

  // 1. 頂部標題與結果文字
  noStroke();
  fill(...PALETTE.muted);
  textSize(constrain(cardW * 0.03, 12, 14));
  textAlign(CENTER, CENTER);
  text("高一英文單字測驗", width / 2, cardY + cardH * 0.1);

  fill(...PALETTE.ink);
  textSize(constrain(cardW * 0.06, 20, 26));
  textStyle(BOLD);
  text("測驗完成！", width / 2, cardY + cardH * 0.2);

  // 2. 得分圓環 (繪製動態弧線比例)
  let ringX = width / 2;
  let ringY = cardY + cardH * 0.48;
  let ringD = constrain(cardH * 0.28, 80, 110);

  // 繪製底環
  noFill();
  strokeWeight(8);
  stroke(...PALETTE.track);
  ellipse(ringX, ringY, ringD, ringD);

  // 根據得分繪製比例弧線
  if (score > 0) {
    stroke(...PALETTE.accent);
    strokeCap(ROUND); // 圓弧端點
    arc(ringX, ringY, ringD, ringD, -HALF_PI, -HALF_PI + TWO_PI * (score / questions.length));
    strokeCap(SQUARE);
  }

  // 圓環中央得分數字
  noStroke();
  fill(...PALETTE.ink);
  textSize(constrain(ringD * 0.28, 22, 32));
  textStyle(BOLD);
  text(`${score} / ${questions.length}`, ringX, ringY + 1);
  textStyle(NORMAL);

  // 3. 根據得分給予評語
  let feedback = "";
  if (score === 5) feedback = "太厲害了！英文單字量非常紮實！";
  else if (score >= 3) feedback = "表現不錯！繼續保持學習的習慣！";
  else feedback = "加油！多複習高一常見單字會更進步！";

  fill(...PALETTE.muted);
  textSize(constrain(cardW * 0.035, 13, 15));
  text(feedback, cardX + 20, cardY + cardH * 0.72, cardW - 40, 30);

  // 4. 「重新開始測驗」膠囊按鈕
  let btnW = constrain(cardW * 0.45, 150, 190);
  let btnH = constrain(cardH * 0.11, 40, 48);
  restartButton = {
    x: width / 2 - btnW / 2,
    y: cardY + cardH - (cardH * 0.08) - btnH,
    w: btnW,
    h: btnH
  };
  
  drawPillButton(restartButton, "↻  重新開始測驗", PALETTE.accent, PALETTE.accentDk);
}

// 輔助點擊判斷函式：檢測滑鼠點擊位置是否在矩形範圍內
function isMouseOver(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

// 滑鼠點擊觸發事件 (MouseEvent)
function mousePressed() {
  // 狀態 A：測驗進行中
  if (currentQuestion < questions.length) {
    // 尚未作答時：偵測選項按鈕點擊
    if (!isAnswered) {
      for (let btn of optionButtons) {
        if (isMouseOver(btn.x, btn.y, btn.w, btn.h)) {
          selectedOption = btn.index; // 記錄選取的選項
          isAnswered = true;          // 設為已作答

          // 驗證正確答案
          if (selectedOption === questions[currentQuestion].answer) {
            isCorrect = true;
            score++; // 答對加分
          } else {
            isCorrect = false;
          }
          break;
        }
      }
    } 
    // 已作答時：偵測「下一題」按鈕點擊
    else {
      if (isMouseOver(nextButton.x, nextButton.y, nextButton.w, nextButton.h)) {
        currentQuestion++;  // 進入下一題
        isAnswered = false; // 重置作答狀態
        selectedOption = -1;// 重置選項選取狀態
        isCorrect = false;  // 重置對錯狀態
      }
    }
  } 
  // 狀態 B：測驗結果結算畫面
  else {
    // 偵測「重新開始」按鈕點擊
    if (isMouseOver(restartButton.x, restartButton.y, restartButton.w, restartButton.h)) {
      resetQuiz(); // 重置所有測驗變數
    }
  }
}

// 重置測驗系統狀態
function resetQuiz() {
  currentQuestion = 0;
  score = 0;
  selectedOption = -1;
  isAnswered = false;
  isCorrect = false;
}

// 瀏覽器視窗大小改變時（如手機旋轉螢幕、視窗拉動），自動觸發 RWD 調整
function windowResized() {
  // 將畫布即時重設為最新的瀏覽器視窗尺寸
  resizeCanvas(windowWidth, windowHeight);
}