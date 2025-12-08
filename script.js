document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleModeButton = document.getElementById('toggle-mode');
    const toggleEffectButton = document.getElementById('toggle-effect');
    const goHomeButton = document.getElementById('go-home'); 
    const effectContainer = document.getElementById('effect-container');
    const navDots = document.querySelectorAll('.nav-dot');
    
// --- 0. Dock 特效初始化 ---
    function initDockEffect() {
        const dock = document.getElementById('dock'); // ⚡️ 取得 Dock 容器
        const dockIcons = document.querySelectorAll('#dock > *');
        
        // 集中管理所有圖標的縮放和 Tooltip 狀態
        function resetScale() {
            dockIcons.forEach(i => {
                i.style.transform = 'scale(1)';
                i.removeAttribute('data-show'); // ⚡️ 關鍵：移除 data-show 屬性來隱藏 Tooltip
            });
        }

        dockIcons.forEach(icon => {
            
            icon.addEventListener('mouseenter', () => {
                
                // 1. 確保滑鼠進入新圖標時，先重置其他圖標的狀態
                resetScale(); 
                
                // 2. 設置懸停圖標的提示框顯示和放大
                icon.setAttribute('data-show', 'true'); // 顯示 Tooltip
                icon.style.transform = 'scale(1.4)'; // 懸停圖標放大
                
                // 3. 獲取前後圖標並進行較小幅度的放大
                const prevIcon = icon.previousElementSibling;
                const nextIcon = icon.nextElementSibling;
                
                // 檢查是否為有效的 dock-icon
                if (prevIcon && prevIcon.classList.contains('dock-icon')) {
                    prevIcon.style.transform = 'scale(1.2)';
                }

                if (nextIcon && nextIcon.classList.contains('dock-icon')) {
                    nextIcon.style.transform = 'scale(1.2)';
                }
            });
        });
        
        // ⚡️ 關鍵修正：當滑鼠離開整個 Dock 容器時，統一清除所有效果
        if (dock) {
            dock.addEventListener('mouseleave', resetScale);
        }
    }

// --- 1. 模式切換 ---
    if (toggleModeButton) {
        toggleModeButton.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
        });
    }

    // --- 2. 星光微粒特效邏輯 (包含糖果色修正) ---
    let effectActive = false;
    let particleInterval; 
    
    // ⚡️ 修正: 新增 isImmediate 參數，用於控制動畫延遲
    function createParticle(isImmediate = false) {
        const particle = document.createElement('div');
        particle.classList.add('star-particle'); 
        
        // 隨機初始位置
        particle.style.left = Math.random() * 100 + 'vw';
        // 修正: 將 top 設置為負值，確保微粒從視窗頂部以外生成
        particle.style.top = -(Math.random() * 10 + 5) + 'vh'; 
        
        // 隨機大小 (微粒更小)
        const size = Math.random() * 8 + 3; // 3px to 11px
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        // 隨機動畫速度 (更慢)
        particle.style.animationDuration = Math.random() * 15 + 10 + 's'; // 10s to 25s
        
        // ⚡️ 修正: 根據是否為立即模式設定動畫延遲
        let maxDelay = isImmediate ? 0.5 : 4; // 立即模式最大延遲 0.5s，循環模式最大延遲 4s
        particle.style.animationDelay = Math.random() * maxDelay + 's'; 
        
        // 隨機初始透明度 (與 twinkle 動畫配合)
        particle.style.opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8 opacity

        // 核心修正：根據模式設定顏色和發光效果
        const isDarkMode = body.classList.contains('dark-mode');
        let particleColor;

        if (isDarkMode) {
            // 夜間模式：統一白色星光
            particleColor = 'var(--particle-color-1)'; // 即白色
            particle.style.boxShadow = '0 0 5px 1px rgba(255, 255, 255, 0.7)'; // 強白色發光
        } else {
            // 日間模式：隨機糖果色
            const colorIndex = Math.floor(Math.random() * 4) + 1; // 1, 2, 3, or 4
            particleColor = `var(--particle-color-${colorIndex})`; 
            
            // 由於背景較亮，我們使用柔和的同色發光
            // 透過獲取計算後的顏色值來創建柔和陰影
            const computedStyle = getComputedStyle(document.documentElement);
            const actualColor = computedStyle.getPropertyValue(particleColor).trim();
            
            particle.style.boxShadow = `0 0 5px 1px ${actualColor}70`; // 70% 透明度的柔和發光
        }
        
        particle.style.backgroundColor = particleColor;


        effectContainer.appendChild(particle);

        // 移除跑出視窗的微粒
        setTimeout(() => {
            particle.remove();
        }, parseFloat(particle.style.animationDuration) * 1000); 
    }

    if (toggleEffectButton) {
        toggleEffectButton.addEventListener('click', () => {
            effectActive = !effectActive;
            effectContainer.classList.toggle('active', effectActive);
            
            // 修正: 切換 active-effect class 以實現視覺反饋
            toggleEffectButton.classList.toggle('active-effect', effectActive); 
            
            if (effectActive) {
                // ⚡️ 修正: 立即生成大量微粒 (initial burst, 數量增加至 20)
                for(let i = 0; i < 20; i++) {
                    createParticle(true); // 使用立即模式 (isImmediate = true)
                }

                // 開始生成微粒 (循環生成時使用非立即模式)
                particleInterval = setInterval(() => createParticle(false), 500); 
                
            } else {
                // 停止生成並清除現有的微粒
                clearInterval(particleInterval);
                effectContainer.querySelectorAll('.star-particle').forEach(p => p.remove());
            }
        });
    }

    // --- 3. 側邊導航點點擊邏輯 (關鍵修正區塊) ---
    function initSideNavigation() {
        navDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = dot.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start' // 確保區塊頂部對齊視窗頂部
                    });
                }
            });
        });
    }
    
    // --- 4. 滾動時導航點的狀態更新 ---
    const sections = document.querySelectorAll('.content-block');

    function updateNavDots() {
        let currentActiveDot = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            
            // 判斷區塊是否在視窗的上方四分之一處 (作為活動區塊的判定點)
            const isVisible = rect.top <= window.innerHeight * 0.25 && rect.bottom >= window.innerHeight * 0.25;

            if (isVisible) {
                // 找到對應的導航點
                const dot = document.querySelector(`.nav-dot[data-target="${section.id}"]`);
                if (dot) {
                    currentActiveDot = dot;
                }
            }
        });

        // 移除所有 active 狀態，並設定目前活動的點
        navDots.forEach(dot => dot.classList.remove('active'));
        if (currentActiveDot) {
            currentActiveDot.classList.add('active');
        }
    }
    
    // 首頁按鈕
    if (goHomeButton) {
        goHomeButton.addEventListener('click', () => {
            const heroSection = document.getElementById('hero-section');
            if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // 監聽滾動事件
    window.addEventListener('scroll', updateNavDots);
    // 初始載入時執行一次
    updateNavDots();


    // --- 5. 2D 橫向跑酷遊戲邏輯 (包含上次的修正) ---
    function initRunnerGame() {
        const canvas = document.getElementById('runnerCanvas');
        if (!canvas) return; // 確保元素存在
        
        const ctx = canvas.getContext('2d');
        const highScoreDisplay = document.getElementById('highScore');
        const currentScoreDisplay = document.getElementById('currentScore');

        // 遊戲設定
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const groundHeight = 20;
        const groundY = canvasHeight - groundHeight;
        
        // 儲存分數
        let highScore = localStorage.getItem('runnerHighScore') ? parseInt(localStorage.getItem('runnerHighScore')) : 0;
        highScoreDisplay.textContent = highScore;
        
        let gameFrame;
        let isGameRunning = false;
        let isGameOver = false; // 新增變數：指示遊戲是否處於結束狀態
        let score = 0;
        let speed = 5; 
        let obstacleTimeout;
        
        // 玩家 (Player)
        let player = {
            width: 15,
            height: 20,
            x: 50,
            y: groundY - 20,
            vy: 0, 
            gravity: 0.5,
            jumpStrength: -10,
            isJumping: false
        };

        // 障礙物 (Obstacles)
        let obstacles = [];
        
        // --- 繪圖工具 ---

        function getStyle(prop) {
            // 獲取 CSS 變數值
            return getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
        }

        function drawPlayer() {
            ctx.fillStyle = getStyle('--game-element-color');
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        function drawGround() {
            ctx.strokeStyle = getStyle('--game-line-color');
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(canvasWidth, groundY);
            ctx.stroke();
        }

        function drawObstacle(obs) {
            ctx.fillStyle = getStyle('--game-element-color');
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
        
        function drawScore() {
            currentScoreDisplay.textContent = score;
            highScoreDisplay.textContent = highScore;
        }

        // --- 遊戲邏輯 ---
        
        function updatePlayer() {
            player.vy += player.gravity;
            player.y += player.vy;

            if (player.y >= groundY - player.height) {
                player.y = groundY - player.height;
                player.isJumping = false;
                player.vy = 0;
            }
        }
        
        function updateObstacles() {
            for (let i = 0; i < obstacles.length; i++) {
                let obs = obstacles[i];
                obs.x -= speed;

                // 檢查碰撞
                if (
                    player.x < obs.x + obs.width &&
                    player.x + player.width > obs.x &&
                    player.y + player.height > obs.y
                ) {
                    endGame();
                    return;
                }

                // 移除跑出畫面的障礙物
                if (obs.x + obs.width < 0) {
                    obstacles.splice(i, 1);
                    i--; 
                    score++;
                }
            }
        }
        
        // 難度控制：根據分數增加障礙物複雜度
        function getDifficultyParams(currentScore) {
            let baseSpeed = 5;
            let maxSpeed = 10;
            let minGap = 80; 
            let maxGap = 200;
            
            let minObstacleHeight = 20; 
            let maxObstacleHeight = 40; 
            let minObstacleWidth = 15;
            let maxObstacleWidth = 50; 

            if (currentScore >= 5) {
                baseSpeed = 6;
                minGap = 70;
            }
            if (currentScore >= 15) {
                baseSpeed = 7;
                maxObstacleHeight = 55;
                maxGap = 150;
            }
            if (currentScore >= 30) {
                baseSpeed = 8;
                minGap = 60; 
                maxObstacleWidth = 60;
            }
            
            // 速度平滑增加
            speed = Math.min(maxSpeed, baseSpeed + currentScore * 0.1);
            
            return {
                width: Math.random() * (maxObstacleWidth - minObstacleWidth) + minObstacleWidth, 
                height: Math.random() * (maxObstacleHeight - minObstacleHeight) + minObstacleHeight, 
                gap: Math.random() * (maxGap - minGap) + minGap,
            };
        }


        function spawnObstacle() {
            if (!isGameRunning) return;

            const params = getDifficultyParams(score);

            if (obstacles.length > 0) {
                const lastObs = obstacles[obstacles.length - 1];
                const requiredGap = params.gap + lastObs.width;
                
                if (canvasWidth - lastObs.x < requiredGap) {
                    const nextAttemptDelay = 50 + Math.random() * 50; 
                    obstacleTimeout = setTimeout(spawnObstacle, nextAttemptDelay);
                    return;
                }
            }

            const width = params.width;
            const height = params.height;

            obstacles.push({
                x: canvasWidth,
                y: groundY - height,
                width: width,
                height: height
            });
            
            // --- 障礙物生成間隔邏輯 ---
            const minBaseInterval = 800; 
            const maxBaseInterval = 1800; 
            
            const randomBase = Math.random() * (maxBaseInterval - minBaseInterval) + minBaseInterval;
            
            const speedFactor = speed / 5; 

            const nextSpawnDelay = randomBase / speedFactor; 
            
            const finalDelay = Math.max(400, nextSpawnDelay); 

            obstacleTimeout = setTimeout(spawnObstacle, finalDelay);
        }


        function gameLoop() {
            if (!isGameRunning) return;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            // 繪製背景
            ctx.fillStyle = getStyle('--game-canvas-bg');
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            updatePlayer();
            updateObstacles();
            drawGround();
            drawPlayer();
            
            obstacles.forEach(drawObstacle);
            drawScore();

            gameFrame = requestAnimationFrame(gameLoop);
        }

        // --- 控制輸入 ---
        
        function playerJump() {
            if (isGameOver) {
                // 如果處於結束狀態，則呼叫 startGame
                startGame();
                return;
            }
            
            if (!player.isJumping) {
                if (!isGameRunning) {
                    startGame();
                    return;
                }
                player.isJumping = true;
                player.vy = player.jumpStrength;
            }
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault(); 
                playerJump();
            }
        });
        
        canvas.addEventListener('mousedown', playerJump);
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            playerJump();
        });


        // --- 遊戲狀態控制 ---

        function startGame() {
            if (isGameRunning) return; 

            player.y = groundY - player.height;
            player.isJumping = false;
            player.vy = 0;
            obstacles = [];
            score = 0;
            speed = 5; 
            
            isGameRunning = true;
            isGameOver = false; // 遊戲開始，重設結束標記

            gameFrame = requestAnimationFrame(gameLoop);
            
            obstacleTimeout = setTimeout(spawnObstacle, 1000); 
        }

        function endGame() {
            isGameRunning = false;
            cancelAnimationFrame(gameFrame);
            clearTimeout(obstacleTimeout); 
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('runnerHighScore', highScore);
            }
            drawScore();
            
            // 立即顯示紅屏碰撞效果
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            // 短暫延遲後顯示重新開始的提示，並設定 isGameOver = true，允許點擊重啟
            setTimeout(() => {
                ctx.fillStyle = getStyle('--game-canvas-bg');
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                drawGround();
                drawPlayer();
                
                ctx.fillStyle = getStyle('--text-color');
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Tap or Press Space to Restart!', canvasWidth / 2, canvasHeight / 2);

                isGameOver = true; // 關鍵修正：確保顯示提示後才能重新開始
            }, 100);
        }

        // 初始繪製
        function drawInitialState() {
            ctx.fillStyle = getStyle('--game-canvas-bg');
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            drawGround();
            drawPlayer();
            
            ctx.fillStyle = getStyle('--text-color');
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Tap or Press Space to Start!', canvasWidth / 2, canvasHeight / 2);

            drawScore(); 
            isGameOver = true; // 初始狀態視為可以開始的"結束"狀態
        }
        
        drawInitialState();
    }
    
// ----------------------------------------------------------------
    // --- 6. 3D 立方體互動邏輯 (物理速度版 + 點擊拖動 + 觸控) ---
    // ----------------------------------------------------------------
    function initCubeInteraction() {
        const cube = document.getElementById('cube');
        const container = document.getElementById('about-section');
        const cubeContainer = document.getElementById('cube-container');
        
        // ⚡️ 修正 1: 邏輯錯誤修正為 !cubeContainer
        if (!cube || !container || !cubeContainer) return; 
        
        const influenceRadius = 150; 
        
        let currentRotateX = 0;
        let currentRotateY = 0;
        
        let autoRotateId = null;
        let isInteracting = false; 
        let isDragging = false;    
        let isTouching = false;    
        let lastX = 0;             
        let lastY = 0;             

        // ... (updateRotation, autoRotateLoop, startAutoRotation, stopAutoRotation 函式不變)

        function updateRotation() {
            cube.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
        }

        function startAutoRotation() {
            cube.style.animation = 'none';
            if (autoRotateId === null) {
                lastTime = 0;
                autoRotateLoop(0); 
            }
        }
        
        function stopAutoRotation() {
            if (autoRotateId !== null) {
                cancelAnimationFrame(autoRotateId);
                autoRotateId = null;
            }
        }

        // ----------------------------------------
        // 1. 滑鼠事件 
        // ----------------------------------------
        
        // 1.1. 滑鼠按下事件 (在立方體容器上觸發)
        cubeContainer.addEventListener('mousedown', (e) => {
            e.preventDefault(); 
            isInteracting = false; 
            stopAutoRotation();
            cube.style.animation = 'none';

            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        // 1.2. 滑鼠放開事件 (在文件上觸發)
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                startAutoRotation(); 
            }
        });

        // 1.3. 監聽滑鼠移動 (拖動和靠近感應)
        container.addEventListener('mousemove', (e) => {
            
            // ⚡️ 修正 2a: 如果正在拖動或正在觸控，則優先處理，不執行靠近感應
            if (isDragging || isTouching) { 
                if (isDragging) {
                    // 模式 A: 點擊拖動
                    const deltaX = e.clientX - lastX;
                    const deltaY = e.clientY - lastY;
                    
                    currentRotateY += deltaX * 0.5; 
                    currentRotateX += deltaY * 0.5; 

                    updateRotation();
                    
                    lastX = e.clientX;
                    lastY = e.clientY;
                }
                return; 
            } 
            
            // ⚡️ 修正 2b: 僅在非觸控裝置上執行靠近感應
            if (!('ontouchstart' in window)) { 
                
                // 模式 B: 靠近感應
                const cubeRect = cubeContainer.getBoundingClientRect();
                const cubeCenterX = cubeRect.left + cubeRect.width / 2;
                const cubeCenterY = cubeRect.top + cubeRect.height / 2;
                const mouseX = e.clientX;
                const mouseY = e.clientY;

                const distance = Math.sqrt(
                    Math.pow(mouseX - cubeCenterX, 2) + Math.pow(mouseY - cubeCenterY, 2)
                );
                
                if (distance < influenceRadius) {
                    isInteracting = true;
                    stopAutoRotation();
                    cube.style.animation = 'none';

                    const deltaX = e.movementX || 0;
                    const deltaY = e.movementY || 0;

                    currentRotateY += deltaX * 0.5; 
                    currentRotateX -= deltaY * 0.5; 

                    updateRotation();

                } else {
                    if (isInteracting) {
                        isInteracting = false;
                        startAutoRotation();
                    }
                }
            }
        });

        // 1.4. 滑鼠離開整個區域時確保恢復自動旋轉
        container.addEventListener('mouseleave', () => {
            if (!isDragging && !isTouching) { // 確保當滑鼠拖動或觸控離開時，不觸發此處邏輯
                isInteracting = false;
                startAutoRotation();
            }
        });


        // ----------------------------------------
        // 2. 觸控事件 
        // ----------------------------------------

        // 2.1. 觸摸開始 (Touch Start)
        cubeContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) { 
                e.preventDefault(); 
                
                isInteracting = false; 
                stopAutoRotation();
                cube.style.animation = 'none';

                isTouching = true;
                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
            }
        }, { passive: false }); 

        // 2.2. 觸摸移動 (Touch Move)
        // ⚡️ 修正 3: 將監聽器移動到 container，提供更大的拖動範圍
        container.addEventListener('touchmove', (e) => { 
            if (isTouching && e.touches.length === 1) {
                
                // 檢查 touchmove 是否發生在 about-section 內，但我們用 isTouching 來控制
                e.preventDefault();

                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                
                const deltaX = currentX - lastX;
                const deltaY = currentY - lastY;
                
                currentRotateY += deltaX * 0.5; 
                currentRotateX += deltaY * 0.5; 

                updateRotation();

                lastX = currentX;
                lastY = currentY;
            }
        }, { passive: false }); 

        // 2.3. 觸摸結束 (Touch End)
        document.addEventListener('touchend', () => {
            if (isTouching) {
                isTouching = false;
                startAutoRotation(); 
            }
        });
        
        // 初始啟動
        startAutoRotation(); 
    }
    
    // --- 程式初始化 ---
    initDockEffect();
    initSideNavigation(); // ⚡️ 啟用導航點
    initRunnerGame();
    initCubeInteraction(); // ⚡️ 啟用 3D 立方體互動
});

