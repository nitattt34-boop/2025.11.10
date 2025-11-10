// 將註解掉的 objs 陣列恢復
let objs = []; // 移除註解
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];
let cnv;
let drawSize, offsetX, offsetY;
// 標題文字變數
let titleOpacity = 0;




// 左側隱藏選單變數
let sidebarDiv;
let sidebarWidth = 300;
let sidebarX = -sidebarWidth;
let sidebarTargetX = -sidebarWidth;
// iframe overlay 變數
let overlayDiv;


// 新增測驗相關變數
let quizDiv = null;
let questionBank = [
    { q: '下列哪一個是 JavaScript 的資料型別？', choices: ['integer','string','tuple','matrix'], answer: 1 },
    { q: 'HTML 用來做什麼？', choices: ['排版與結構','資料庫管理','影像編輯','系統設定'], answer: 0 },
    { q: 'CSS 主要功能是？', choices: ['控制資料','設計樣式','執行邏輯','儲存檔案'], answer: 1 },
    { q: 'p5.js 是什麼？', choices: ['後端框架','繪圖與互動函式庫','文字編輯器','作業系統'], answer: 1 },
    { q: '哪個是等於運算子？', choices: ['=','==','->','::'], answer: 1 },
    { q: '哪個標記是 HTML 的超連結？', choices: ['<img>','<a>','<div>','<span>'], answer: 1 }
];
let quizQuestions = [];
let quizCurrentIndex = 0;
let userAnswers = [];
let quizScore = 0;




// 新增：用於結果動畫的全域變數
let resultObjects = [];
let resultMode = null;
let resultStartTime = 0;
let resultDuration = 5000; // 毫秒，顯示約 5 秒
function clearResultAnimation() {
    resultObjects = [];
    resultMode = null;
    resultStartTime = 0;
    // 還原 canvas z-index（收場），保持不攔截滑鼠以利 UI 互動
    if (cnv && cnv.elt) {
        cnv.style('z-index', '0');
        cnv.style('pointer-events', 'none');
    }
}


function setup() {
    // 背景畫布全螢幕，但內容限制在置中的正方形區域
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');
    // 初始設定：固定定位、不攔截滑鼠事件，預設 z-index 0
    cnv.style('position', 'fixed');
    cnv.style('left', '0px');
    cnv.style('top', '0px');
    cnv.style('pointer-events', 'none'); // 不阻擋下層互動
    cnv.style('z-index', '0');
    rectMode(CENTER);
   
    // 計算置中的正方形繪製區
    drawSize = min(width, height);
    offsetX = (width - drawSize) / 2;
    offsetY = (height - drawSize) / 2;
   
    // 初始化時加入一個形狀
    objs.push(new DynamicShape());




    // 建立左側隱藏選單（初始隱藏在畫面左側）
    const html = `
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:24px;padding:48px 24px;box-sizing:border-box;height:100vh;">
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">第一單元作品</div>
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">第一單元講義</div>
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">測驗系統</div>
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">測驗卷筆記</div>
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">作品筆記</div>
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;position:relative;">
                淡江大學
                <!-- submenu 改為 fixed，顯示時 JS 會計算位置並鎖定，避免滑動 -->
                <div class="submenu" style="position:fixed;display:none;background:rgba(255,255,255,0.95);color:#222;padding:8px;border-radius:6px;min-width:220px;z-index:10003;box-shadow:0 6px 18px rgba(0,0,0,0.15);transition:none;transform:none;pointer-events:auto;">
                    <div class="submenu-item" style="font-size:18px;cursor:pointer;padding:8px 10px;border-radius:4px;">教育科技學系</div>
                </div>
            </div>
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">回到首頁</div>
        </div>
    `;
    sidebarDiv = createDiv(html);
    sidebarDiv.style('position', 'fixed');
    sidebarDiv.style('top', '0px');
    sidebarDiv.style('left', sidebarX + 'px');
    sidebarDiv.style('width', sidebarWidth + 'px');
    sidebarDiv.style('height', '100vh');
    sidebarDiv.style('background', 'rgba(0,0,0,0.65)');
    sidebarDiv.style('padding', '0px');
    sidebarDiv.style('z-index', '9999');
    sidebarDiv.style('box-sizing', 'border-box');
    // 加入選單項目的點擊事件處理
    const items = sidebarDiv.elt.querySelectorAll('.menu-item');
    if (items && items.length > 0) {
        // 第一項：載入指定頁面到 iframe（作品）
        items[0].addEventListener('click', () => {
            openIframe('https://nitattt34-boop.github.io/2025.10.20/');
        });
        // 第二項：載入講義到 iframe
        items[1].addEventListener('click', () => {
            openIframe('https://hackmd.io/@NAy_WOqtQvSDsNi-Atugng/HyY6O70jlx');
        });
        // 第三項：開啟測驗系統
        items[2].addEventListener('click', () => {
            openQuiz();
        });
        // 第四項：測驗卷筆記（指定頁面）
        items[3].addEventListener('click', () => {
            openIframe('https://hackmd.io/@NAy_WOqtQvSDsNi-Atugng/SkxrYFByWx');
        });
        // 第五項：作品筆記（資料夾連結）
        items[4].addEventListener('click', () => {
            openIframe('https://hackmd.io/@NAy_WOqtQvSDsNi-Atugng/HyY6O70jlx');
        });
        // 第六項：淡江大學 - 顯示子選單（教育科技學系）
        // items[5] 包含 .submenu 與 .submenu-item：加入顯示延遲與 submenu 自身的監聽，避免滑鼠移動時過快收起
        (function(){
            const tkuItem = items[5];
            if (!tkuItem) return;
            const submenu = tkuItem.querySelector('.submenu');
            const submenuItem = tkuItem.querySelector('.submenu-item');
            let hideTimer = null;
            const SHOW = () => {
                if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
                if (submenu) {
                    // 計算固定定位座標（以避免父層造成位移）
                    const rect = tkuItem.getBoundingClientRect();
                    const left = Math.min(window.innerWidth - 12 - (submenu.offsetWidth || 240), rect.right + 12);
                    const top = Math.max(8, rect.top);
                    submenu.style.left = left + 'px';
                    submenu.style.top = top + 'px';
                    submenu.style.display = 'block';
                    submenu.style.transition = 'none';
                    submenu.style.transform = 'none';
                }
            };
            const HIDE = (delay = 180) => {
                if (hideTimer) clearTimeout(hideTimer);
                hideTimer = setTimeout(() => {
                    if (submenu) submenu.style.display = 'none';
                    hideTimer = null;
                }, delay);
            };
            // 監聽主項目與子選單，進出時處理顯示/隱藏（增加短延遲避免閃爍）
            tkuItem.addEventListener('mouseenter', SHOW);
            tkuItem.addEventListener('mouseleave', () => HIDE(200));
            if (submenu) {
                submenu.addEventListener('mouseenter', SHOW);
                submenu.addEventListener('mouseleave', () => HIDE(200));
                // 確保子選單可被互動
                submenu.style.pointerEvents = 'auto';
            }
            if (submenuItem) {
                submenuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // 點選子選單：在 overlay iframe 中開啟指定 HackMD
                    openIframe('https://hackmd.io/@NAy_WOqtQvSDsNi-Atugng/HyY6O70jlx');
                    if (submenu) submenu.style.display = 'none';
                });
            }
            // 當視窗大小改變時關閉子選單以避免錯位
            window.addEventListener('resize', () => {
                if (submenu) submenu.style.display = 'none';
            });
        })();
        // 第七項：回到主畫面
        items[6].addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}




function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // 重新計算置中正方形區
    drawSize = min(width, height);
    offsetX = (width - drawSize) / 2;
    offsetY = (height - drawSize) / 2;
}




function draw() {
    background(255);
   
    // 使用倒序迭代並在同一迴圈內移除已死亡物件，避免陣列爆增與同步問題
    for (let i = objs.length - 1; i >= 0; i--) {
        try {
            objs[i].run();
        } catch (e) {
            // 若某個物件執行出錯，移除它以避免整個畫面卡死
            objs.splice(i, 1);
            continue;
        }
        if (objs[i].isDead) {
            objs.splice(i, 1);
        }
    }
    // 若在結果模式中，讓背景稍微變暗以突顯全螢幕特效
    if (resultMode) {
        push();
        noStroke();
        fill(0, 0, 0, 80);
        rectMode(CORNER);
        rect(0, 0, width, height);
        pop();
    }

    // 限制最大動態物件數量，避免無限制新增導致效能崩潰
    const MAX_OBJS = 150;
    if (frameCount % 20 === 0 && objs.length < MAX_OBJS) {
        let addNum = int(random(1, 5)); // 減少每次新增數量
        addNum = min(addNum, MAX_OBJS - objs.length);
        for (let i = 0; i < addNum; i++) {
            objs.push(new DynamicShape());
        }
    }


    // 繪製標題文字
    if (titleOpacity < 255) titleOpacity += 2; // 淡入效果
    push();
    textAlign(CENTER, CENTER);
    // 改成粗體並使用深灰色（#333 / 51），同時保留淡入透明度
    textSize(36);
    textStyle(BOLD);
    fill(51, titleOpacity);
    text('淡江教育科技學系', width/2, height/2 - 24);
    textSize(24);
    text('414730688-陳君慈', width/2, height/2 + 24);
    textStyle(NORMAL);
    pop();




    // 選單動畫
    if (mouseX >= 0 && mouseX <= 100) {
        sidebarTargetX = 0;
    } else {
        sidebarTargetX = -sidebarWidth;
    }
    sidebarX = lerp(sidebarX, sidebarTargetX, 0.12);
    if (sidebarDiv) sidebarDiv.style('left', sidebarX + 'px');




    // 若 quizDiv 存在，可繼續顯示互動或做視覺效果（此處用 titleOpacity 變化示意）
    if (quizDiv) {
        // 畫面右上顯示簡單提示
        push();
        textSize(14);
        fill(0, 120);
        textAlign(RIGHT, TOP);
        text('測驗進行中...', width - 12, 12);
        pop();
    }




    // 顯示並更新結果動畫物件（若有）
    for (let i = resultObjects.length - 1; i >= 0; i--) {
        const obj = resultObjects[i];
        try {
            if (obj && typeof obj.run === 'function') obj.run();
        } catch (e) {
            resultObjects.splice(i, 1);
            continue;
        }
        if (obj && obj.isDead) resultObjects.splice(i, 1);
    }
    // 若結果模式存在且超過時間，清除特效
    if (resultMode && resultStartTime > 0) {
        if (millis() - resultStartTime >= resultDuration) {
            clearResultAnimation();
        }
    }
}




function easeInOutExpo(x) {
  return x === 0 ? 0 :
    x === 1 ? 1 :
    x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
    (2 - Math.pow(2, -20 * x + 10)) / 2;
}




class DynamicShape {
    constructor() {
        this.reset();
    }


    reset() {
        this.x = random(width);
        this.y = random(height);
        this.fromX = this.x;
        this.fromY = this.y;
        this.targetX = random(width);
        this.targetY = random(height);
        this.size = random(20, 60);
        this.shapeType = int(random(4));
        this.clr = random(colors);
        this.lineSW = random(0.3, 2);
        this.animationType = int(random(3));
        this.reductionRatio = 1;
        this.actionPoints = int(random(30, 120));
        this.maxActionPoints = this.actionPoints;
        this.isDead = false;
        this.message = '';
        this.isResult = false;
    }


    run() {
        this.move();
        this.show();
    }


    move() {
        this.x = lerp(this.x, this.targetX, 0.01);
        this.y = lerp(this.y, this.targetY, 0.01);
        this.fromX = lerp(this.fromX, this.x, 0.02);
        this.fromY = lerp(this.fromY, this.y, 0.02);
        this.actionPoints--;
       
        if (this.animationType == 1 || this.animationType == 2) {
            this.reductionRatio = map(
                sin(frameCount * 0.1), -1, 1, 0.5, 1
            );
        }


        if (this.actionPoints <= 0) {
            this.isDead = true;
        }
    }


    show() {
        push();
        translate(this.x, this.y);
        if (this.animationType == 1) scale(1, this.reductionRatio);
        if (this.animationType == 2) scale(this.reductionRatio, 1);
       
        fill(this.clr);
        stroke(this.clr);
        strokeWeight(this.size * 0.05);
       
        if (this.shapeType == 0) {
            noStroke();
            circle(0, 0, this.size);
        } else if (this.shapeType == 1) {
            noFill();
            circle(0, 0, this.size);
        } else if (this.shapeType == 2) {
            noStroke();
            rect(0, 0, this.size, this.size);
        } else if (this.shapeType == 3) {
            noFill();
            rect(0, 0, this.size * 0.9, this.size * 0.9);
        }


        // 如果是結果動畫，顯示文字
        if (this.isResult && this.message) {
            push();
            textAlign(CENTER, CENTER);
            textSize(36);
            textStyle(BOLD);
            noStroke();
            fill(51, map(this.actionPoints, 0, this.maxActionPoints, 0, 255));
            text(this.message, width/2 - this.x, height/2 - this.y);
            pop();
        }
       
        pop();
       
        strokeWeight(this.lineSW);
        stroke(this.clr);
        line(this.x, this.y, this.fromX, this.fromY);
    }
}




// 建立並顯示 iframe overlay（70vw × 85vh），含關閉鈕
function openIframe(url) {
    // 如果已有 overlay，先移除
    if (overlayDiv) {
        overlayDiv.remove();
        overlayDiv = null;
    }
    // overlay container，置中顯示
    overlayDiv = createDiv('');
    overlayDiv.style('position', 'fixed');
    overlayDiv.style('left', '50%');
    overlayDiv.style('top', '50%');
    overlayDiv.style('transform', 'translate(-50%,-50%)');
    overlayDiv.style('width', '70vw');
    overlayDiv.style('height', '85vh');
    overlayDiv.style('z-index', '10001');
    overlayDiv.style('background', '#ffffff');
    overlayDiv.style('box-shadow', '0 12px 40px rgba(0,0,0,0.5)');
    overlayDiv.style('border-radius', '6px');
    overlayDiv.style('overflow', 'hidden');




    // 內部 HTML：關閉鈕 + iframe
    overlayDiv.html(`
        <div style="position:absolute;right:10px;top:10px;z-index:10002;">
            <button id="close-iframe" style="font-size:16px;padding:8px 12px;cursor:pointer;background:transparent;border:none;color:inherit;">關閉</button>
        </div>
        <iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>
    `);




    // 關閉按鈕事件
    const btn = overlayDiv.elt.querySelector('#close-iframe');
    if (btn) {
        btn.addEventListener('click', () => {
            if (overlayDiv) {
                overlayDiv.remove();
                overlayDiv = null;
            }
        });
    }
    // 點擊 overlay 背景以外也可以關閉（選擇性，可視需求移除）
    // 這裡不額外綁全域點擊以避免誤關閉 iframe 內點擊
}




/* -------------------------
   測驗系統：CSV 匯出、隨機抽三題、互動 UI、成績與回饋
   ------------------------- */


// 產生 CSV 並下載（UTF-8 BOM 以支援中文）
function exportQuestionCSV() {
    let lines = [];
    // 欄位：題目, 選項A, 選項B, 選項C, 選項D, 正答索引
    lines.push(['question','choiceA','choiceB','choiceC','choiceD','answerIndex'].join(','));
    for (let it of questionBank) {
        // 確保有 4 個選項，若不足填空
        let c = it.choices.slice(0,4);
        while (c.length < 4) c.push('');
        // escape commas / quotes minimal by wrapping in quotes
        let row = [
            `"${it.q.replace(/"/g,'""')}"`,
            `"${c[0].replace(/"/g,'""')}"`,
            `"${c[1].replace(/"/g,'""')}"`,
            `"${c[2].replace(/"/g,'""')}"`,
            `"${c[3].replace(/"/g,'""')}"`,
            it.answer
        ].join(',');
        lines.push(row);
    }
    let csvContent = '\uFEFF' + lines.join('\n'); // BOM
    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let a = createA(url, 'download');
    a.attribute('download', 'question_bank.csv');
    a.hide();
    a.elt.click();
    URL.revokeObjectURL(url);
    a.remove();
}


// 開啟測驗 UI（抽取 3 題）
function openQuiz() {
    // 若已有 quizDiv 則先移除
    if (quizDiv) {
        quizDiv.remove();
        quizDiv = null;
    }
    // 隨機選 3 題（若題庫少於 3 則全部）
    startQuiz();


    quizDiv = createDiv('');
    quizDiv.style('position', 'fixed');
    quizDiv.style('left', '50%');
    quizDiv.style('top', '50%');
    quizDiv.style('transform', 'translate(-50%,-50%)');
    quizDiv.style('width', '520px');
    quizDiv.style('max-width', '90vw');
    quizDiv.style('background', '#ffffff');
    quizDiv.style('z-index', '10002');
    quizDiv.style('padding', '18px');
    quizDiv.style('box-shadow', '0 12px 36px rgba(0,0,0,0.35)');
    quizDiv.style('border-radius', '8px');
    quizDiv.style('font-family', 'sans-serif');


    // 移除右下角關閉按鈕
    quizDiv.html(`
        <div id="quiz-content" style="display:flex;flex-direction:column;gap:12px;"></div>
    `);


    renderQuizQuestion();
}


// 建立 quizQuestions 與初始狀態
function startQuiz() {
    let indices = [];
    let total = questionBank.length;
    let pick = 6; // 固定抽 6 題
    while (indices.length < pick) {
        let r = int(random(0, total));
        if (!indices.includes(r)) indices.push(r);
    }
    quizQuestions = indices.map(i => questionBank[i]);
    quizCurrentIndex = 0;
    userAnswers = [];
    quizScore = 0;
}


// 顯示當前題目到 quizDiv
function renderQuizQuestion() {
    if (!quizDiv) return;
    const content = quizDiv.elt.querySelector('#quiz-content');
    if (!content) return;


    // 如果已完成所有題目，顯示結果
    if (quizCurrentIndex >= quizQuestions.length) {
        // 計算分數
        quizScore = 0;
        for (let i = 0; i < quizQuestions.length; i++) {
            if (userAnswers[i] === quizQuestions[i].answer) quizScore++;
        }


        // 根據分數給予回饋
        let feedback = '';
        if (quizScore === quizQuestions.length) {
            feedback = '非常好！全部答對，繼續保持！';
        } else if (quizScore >= quizQuestions.length - 1) {
            feedback = '不錯，再接再厲！';
        } else if (quizScore > 0) {
            feedback = '部分正確，建議再複習相關內容。';
        } else {
            feedback = '需要加強，請多練習基礎概念。';
        }


        // 修改顯示結果的 HTML
        content.innerHTML = `
            <div style="font-size:20px;font-weight:600;">測驗完成</div>
            <div>共 ${quizQuestions.length} 題，正確 ${quizScore} 題</div>
            <div style="margin-top:8px;padding:10px;background:#f4f4f4;border-radius:6px;">
                回饋：${feedback}
            </div>
            <div id="detail-area" style="margin-top:12px;"></div>
            <div style="display:flex;justify-content:center;margin-top:16px;">
                <button id="close-final" style="padding:8px 24px;cursor:pointer;font-size:16px;background:transparent;color:#4a90e2;border:none;">關閉</button>
            </div>
        `;


        // 顯示每題的答題詳情
        const detail = content.querySelector('#detail-area');
        let html = '<ol style="padding-left:18px;">';
        for (let i = 0; i < quizQuestions.length; i++) {
            const q = quizQuestions[i];
            const userAns = userAnswers[i];
            const isCorrect = userAns === q.answer;
           
            html += `
                <li style="margin-bottom:12px;">
                    <div style="font-weight:600;">${q.q}</div>
                    <div style="color:${isCorrect ? '#2e7d32' : '#c62828'}">
                        你的答案：${q.choices[userAns]}
                        ${isCorrect ? '✓' : '✗'}
                    </div>
                    <div style="color:#1976d2">
                        正確答案：${q.choices[q.answer]}
                    </div>
                </li>
            `;
        }
        html += '</ol>';
        detail.innerHTML = html;


        // 只綁定關閉按鈕
        const closeBtn = content.querySelector('#close-final');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (quizDiv) {
                    quizDiv.remove();
                    quizDiv = null;
                }
                // 移除結果動畫但不動到主畫面內容
                clearResultAnimation();
            });
        }


        // 顯示動畫效果
        showResultAnimation(quizScore);
        return;
    }


    // 顯示當前題目
    const q = quizQuestions[quizCurrentIndex];
    let choicesHtml = '';
    for (let i = 0; i < q.choices.length; i++) {
        choicesHtml += `
            <button class="choice-btn" data-idx="${i}"
                style="display:block;width:100%;text-align:left;padding:10px;
                border-radius:6px;border:1px solid #ddd;background:#fff;
                cursor:pointer;margin-top:6px;">
                ${String.fromCharCode(65+i)}. ${q.choices[i]}
            </button>
        `;
    }


    content.innerHTML = `
        <div style="font-size:18px;font-weight:600;">
            題目 ${quizCurrentIndex+1} / ${quizQuestions.length}
        </div>
        <div style="margin-top:8px;">${q.q}</div>
        <div style="margin-top:8px;">${choicesHtml}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
            <div style="color:#666;font-size:14px;">
                ${quizCurrentIndex < quizQuestions.length-1 ? '請繼續作答下一題' : '最後一題'}
            </div>
            <button id="restart-quiz" style="padding:8px 12px;cursor:pointer;">重新測驗</button>
        </div>
    `;


    // 綁定選項按鈕
    const btns = content.querySelectorAll('.choice-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', (ev) => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            userAnswers[quizCurrentIndex] = idx;
            quizCurrentIndex++;
            renderQuizQuestion();
        });
    });


    // 綁定重新測驗按鈕
    const restartBtn = content.querySelector('#restart-quiz');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            startQuiz();
            renderQuizQuestion();
        });
    }
}




// 顯示結果時的視覺互動：依成績建立不同的動畫物件（改為全螢幕並啟動計時）
function showResultAnimation(score) {
    // 不影響主畫面內容，僅在畫布上加上動畫物件
    clearResultAnimation();
    resultMode = 'showing';
    resultStartTime = millis();
    // 將 canvas 提升到最上層以覆蓋 quizDiv（仍不攔截滑鼠）
    if (cnv && cnv.elt) {
        cnv.style('z-index', '10005');
        cnv.style('pointer-events', 'none');
    }
    let total = max(1, quizQuestions.length);
    let percent = Math.round((score / total) * 100);
    if (score === total) {
        // 完全正確：大量金黃煙火散佈全螢幕 + 置中文字
        for (let i = 0; i < 16; i++) {
            let fx = new Firework(random(width * 0.05, width * 0.95), random(height * 0.15, height * 0.8), color('#FFD700'));
            resultObjects.push(fx);
        }
        // 加一些彩色煙火
        let cols = ['#FF4D4D','#4CAF50','#2196F3','#FFB86B'];
        for (let i = 0; i < 8; i++) {
            let fx = new Firework(random(width * 0.05, width * 0.95), random(height * 0.15, height * 0.8), color(random(cols)));
            resultObjects.push(fx);
        }
        resultObjects.push(new MessageBanner('太棒了！完美表現！', '#b8860b'));
    } else if (score >= 2 && score <= 5) {
        // 中等：多隻小動物分佈並加上溫暖訊息（全螢幕）
        let count = 6;
        for (let i = 0; i < count; i++) {
            let ax = new AnimalCheer(width * (0.1 + i * 0.14), height * 0.55 + random(-30,30), '加油！', i);
            resultObjects.push(ax);
        }
        // 少量彩色煙火點綴
        for (let i = 0; i < 6; i++) {
            let fx = new Firework(random(width * 0.1, width * 0.9), random(height * 0.2, height * 0.7), color(random(['#FFD54F','#81C784','#64B5F6'])));
            resultObjects.push(fx);
        }
        resultObjects.push(new MessageBanner('表現不錯，繼續努力！', '#2e7d32'));
    } else {
        // 全錯：全螢幕紅色閃爍 + 置中文字（清楚提示需加強）
        resultObjects.push(new RedAlarm()); // RedAlarm 已改為全螢幕效果
        resultObjects.push(new MessageBanner('需要加強，請再練習！', '#c62828'));
    }
}


// Firework 與粒子
class Firework {
    constructor(x, y, col) {
        this.pos = createVector(x, y);
        this.particles = [];
        this.color = col || color(255,200,0);
        this.isDead = false;
        // 強烈爆炸：大量粒子
        let burstCount = 120;
        for (let i = 0; i < burstCount; i++) {
            let angle = random(TWO_PI);
            let speed = random(2.5, 8);
            let vx = cos(angle) * speed * (1 + random(-0.25, 0.25));
            let vy = sin(angle) * speed * (1 + random(-0.25, 0.25));
            let sz = random(3, 8);
            let life = random(80, 180);
            this.particles.push(new FireworkParticle(this.pos.x, this.pos.y, vx, vy, sz, life, this.color));
        }
        // 次級散射點綴
        for (let i = 0; i < 8; i++) {
            let angle = random(TWO_PI);
            let dist = random(8, 28);
            this.particles.push(new FireworkParticle(
                this.pos.x + cos(angle) * dist,
                this.pos.y + sin(angle) * dist,
                random(-1, 1),
                random(-1, 1),
                random(2, 4),
                random(100, 180),
                color(random(['#FFEB3B','#FF7043','#66BB6A','#29B6F6']))
            ));
        }
        // 中央衝擊波視覺
        this.shock = { r: 10, a: 200 };
    }
    run() {
        // 更新並繪製粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.show();
            if (p.isDead) this.particles.splice(i, 1);
        }
        // 繪製衝擊波環
        push();
        noFill();
        strokeWeight(3);
        stroke(red(this.color), green(this.color), blue(this.color), this.shock.a);
        ellipse(this.pos.x, this.pos.y, this.shock.r * 2);
        pop();
        this.shock.r += 6;
        this.shock.a -= 6;
        if (this.shock.a <= 0 && this.particles.length === 0) {
            this.isDead = true;
        }
    }
}

class FireworkParticle {
    constructor(x, y, vx, vy, sz, life, col) {
        this.pos = createVector(x, y);
        this.vel = createVector(vx, vy);
        this.acc = createVector(0, 0.06); // 重力
        this.size = sz;
        this.lifespan = life;
        this.maxLife = life;
        this.color = col || color(255, 200, 50);
        this.isDead = false;
    }
    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.lifespan -= 1.8; // 較慢消逝以延長可見時間
        this.size *= 0.995;
        if (this.lifespan <= 0 || this.size < 0.3) this.isDead = true;
    }
    show() {
        push();
        blendMode(ADD);
        noStroke();
        let a = map(this.lifespan, 0, this.maxLife, 0, 255);
        fill(red(this.color), green(this.color), blue(this.color), a);
        ellipse(this.pos.x, this.pos.y, this.size);
        // 些微閃爍光點
        if (random() < 0.08) {
            fill(255, 255, 255, a * 0.7);
            ellipse(this.pos.x + random(-2, 2), this.pos.y + random(-2, 2), max(1, this.size * 0.25));
        }
        blendMode(BLEND);
        pop();
    }
}


// 小動物鼓勵（簡單向量圖）
class AnimalCheer {
    constructor(x, y, text, idx = 0) {
        this.x = x;
        this.y = y;
        this.t = text || '加油';
        this.offset = random(0, 1000) + idx * 10;
        this.isDead = false; // 持續顯示，直到 clearResultAnimation()
    }
    run() {
        // 簡單上下擺動
        let bob = sin((frameCount + this.offset) * 0.06) * 6;
        push();
        translate(this.x, this.y + bob);
        // 身體
        noStroke();
        fill('#F6CBA5');
        ellipse(0, -6, 48, 42); // head
        fill('#7B3F00');
        ellipse(0, 18, 64, 40); // body
        // 眼睛
        fill(0);
        ellipse(-10, -8, 6, 6);
        ellipse(10, -8, 6, 6);
        // 鼻子
        fill('#E07A5F');
        triangle(0, -2, -4, 4, 4, 4);
        // 加油棒（右手）
        stroke('#ff4d4d');
        strokeWeight(6);
        line(18, 6, 38, -6);
        noStroke();
        // 文字下方
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(12);
        stroke(0, 60);
        strokeWeight(0.5);
        fill('#000');
        text(this.t, 0, 40);
        pop();
    }
}


// 紅色警報（改為全螢幕閃爍）
class RedAlarm {
    constructor() {
        this.isDead = false; // 由外層計時清除
        this.flash = 0;
    }
    run() {
        this.flash = (sin(frameCount * 0.3) + 1) * 0.5;
        // 全螢幕紅色半透明閃爍覆蓋
        push();
        noStroke();
        fill(200, 50, 50, 120 * (0.6 + 0.4 * this.flash));
        rectMode(CORNER);
        rect(0, 0, width, height);
        // 中央警示文字
        textAlign(CENTER, CENTER);
        textSize(min(48, width * 0.06));
        fill(255, 230 * (0.6 + 0.4 * this.flash));
        textStyle(BOLD);
        text('警告：需要加強', width/2, height/2 - 24);
        textSize(min(28, width * 0.035));
        fill(255, 200 * (0.6 + 0.4 * this.flash));
        text('請回去複習並再嘗試', width/2, height/2 + 28);
        pop();
    }
}


// 置中訊息橫幅（持續顯示）
class MessageBanner {
    constructor(msg, colorHex) {
        this.msg = msg || '';
        this.col = colorHex || '#333';
        this.isDead = false;
        this.alpha = 0;
    }
    run() {
        // 漸入
        this.alpha = lerp(this.alpha, 220, 0.08);
        push();
        rectMode(CENTER);
        textAlign(CENTER, CENTER);
        fill(255, this.alpha * 0.95);
        noStroke();
        rect(width/2, height*0.18, min(width - 80, 680), 64, 10);
        fill(this.col, this.alpha);
        textSize(26);
        textStyle(BOLD);
        text(this.msg, width/2, height*0.18);
        pop();
    }
}