// 增幅系统配置数据
const enhancementSystem = [
    { level: 0, cost: 0, successRate: 0, failResult: { type: 'none' } },
    { level: 1, cost: 35, successRate: 100, failResult: { type: 'none' } },
    { level: 2, cost: 53, successRate: 100, failResult: { type: 'none' } },
    { level: 3, cost: 73, successRate: 100, failResult: { type: 'none' } },
    { level: 4, cost: 97, successRate: 100, failResult: { type: 'none' } },
    { level: 5, cost: 126, successRate: 80, failResult: { type: 'level', value: -1 } },
    { level: 6, cost: 164, successRate: 70, failResult: { type: 'level', value: -1 } },
    { level: 7, cost: 203, successRate: 60, failResult: { type: 'level', value: -1 } },
    { level: 8, cost: 280, successRate: 70, failResult: { type: 'level', value: -3 } },
    { level: 9, cost: 357, successRate: 60, failResult: { type: 'level', value: -3 } },
    { level: 10, cost: 472, successRate: 50, failResult: { type: 'level', value: -3 } },
    { level: 11, cost: 587, successRate: 40, failResult: { type: 'reset', value: 0 } },
    { level: 12, cost: 646, successRate: 30, failResult: { type: 'reset', value: 0 } },
    { level: 13, cost: 800, successRate: 25, failResult: { type: 'reset', value: 0 } },
    { level: 14, cost: 1000, successRate: 20, failResult: { type: 'reset', value: 0 } },
    { level: 15, cost: 1250, successRate: 15, failResult: { type: 'reset', value: 0 } }
];

// 洗浴中心消费档位
const bathServiceLevels = [
    { minPrice: 100, maxPrice: 299, service: "基础搓澡+简单按摩" },
    { minPrice: 300, maxPrice: 499, service: "精油按摩+足疗套餐" },
    { minPrice: 500, maxPrice: 699, service: "全身SPA+深度护理" },
    { minPrice: 700, maxPrice: 999, service: "贵宾套房+专业技师" },
    { minPrice: 1000, maxPrice: 1499, service: "豪华包间+双人服务" },
    { minPrice: 1500, maxPrice: 1999, service: "至尊体验+私人定制" },
    { minPrice: 2000, maxPrice: 2999, service: "皇家套餐+全程管家" },
    { minPrice: 3000, maxPrice: 4999, service: "顶级会所+专属服务" },
    { minPrice: 5000, maxPrice: 7999, service: "奢华殿堂+VIP待遇" },
    { minPrice: 8000, maxPrice: 9999, service: "至尊享受+贵族体验" },
    { minPrice: 10000, maxPrice: 14999, service: "帝王级服务+私人团队" },
    { minPrice: 15000, maxPrice: 19999, service: "传说级体验+天堂享受" },
    { minPrice: 20000, maxPrice: 29999, service: "神话级待遇+皇室规格" },
    { minPrice: 30000, maxPrice: 39999, service: "史诗级服务+完美人生" },
    { minPrice: 40000, maxPrice: 49999, service: "传奇级享受+巅峰体验" },
    { minPrice: 50000, maxPrice: 999999, service: "神级待遇+超凡脱俗" }
];

// 游戏状态
const gameState = {
    currentLevel: 0,
    crystals: 100000, // 默认10万结晶体
    totalCost: 0,
    useLuckyCharm: false,
    history: [],
    highestLevel: 0,
    attemptCount: 0,
    houseSoldCount: 0, // 卖房次数
    crystalToTeraRate: 1000 // 结晶兑换泰拉比例
};

// DOM元素缓存
const elements = {
    levelValue: document.querySelector('.level-value'),
    currentLevel: document.getElementById('current-level'),
    totalCost: document.getElementById('total-cost'),
    luckyCharm: document.getElementById('lucky-charm'),
    enhanceBtn: document.getElementById('enhance-btn'),
    resetBtn: document.getElementById('reset-btn'),
    successRate: document.getElementById('success-rate'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    equipmentImage: document.getElementById('equipment-image'),
    attemptCount: document.getElementById('attempt-count'),
    highestLevel: document.getElementById('highest-level'),
    crystalRate: document.getElementById('crystal-rate'),
    totalTera: document.getElementById('total-tera'),
    totalMoney: document.getElementById('total-money'),
    summerSets: document.getElementById('summer-sets'),
    bathLevel: document.getElementById('bath-level')
};

// 初始化
function init() {
    updateUI();
    calculateExpectations();
    updateConsumptionStats();
    
    // 使用本地装备图片
    elements.equipmentImage.src = "img/equipment.png";
    
    // 事件监听
    elements.luckyCharm.addEventListener('change', toggleLuckyCharm);
    elements.enhanceBtn.addEventListener('click', enhanceOnce);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.crystalRate.addEventListener('input', updateCrystalRate);
    
    // 标签切换
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// 切换标签
function switchTab(tabId) {
    elements.tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    elements.tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// 切换幸运符
function toggleLuckyCharm() {
    gameState.useLuckyCharm = elements.luckyCharm.checked;
    updateUI();
}

// 获取下一级增幅信息
function getNextLevelInfo() {
    return enhancementSystem[gameState.currentLevel + 1];
}

// 获取实际成功率（考虑幸运符）
function getActualSuccessRate(baseSuccessRate) {
    return gameState.useLuckyCharm ? Math.min(baseSuccessRate + 5, 100) : baseSuccessRate;
}

// 增幅一次
function enhanceOnce() {
    if (gameState.currentLevel >= 15) {
        return;
    }
    
    const nextLevel = getNextLevelInfo();
    
    // 检查结晶体是否足够
    if (gameState.crystals < nextLevel.cost) {
        // 自动卖房补充结晶体
        gameState.houseSoldCount++;
        gameState.crystals += 100000;
        updateConsumptionStats();
        updateUI();
        
        // 添加结晶体后重新尝试增幅
        enhanceOnce();
        return;
    }
    
    // 增加尝试次数
    gameState.attemptCount++;
    
    // 扣除结晶体
    gameState.crystals -= nextLevel.cost;
    gameState.totalCost += nextLevel.cost;
    
    // 动画效果
    const equipmentElement = elements.equipmentImage.parentElement;
    equipmentElement.classList.add('enhance-animation');
    setTimeout(() => {
        equipmentElement.classList.remove('enhance-animation');
    }, 800);
    
    // 计算增幅结果
    const successRate = getActualSuccessRate(nextLevel.successRate);
    const roll = Math.random() * 100;
    const isSuccess = roll < successRate;
    
    if (isSuccess) {
        // 增幅成功
        gameState.currentLevel++;
        
        // 更新最高等级
        if (gameState.currentLevel > gameState.highestLevel) {
            gameState.highestLevel = gameState.currentLevel;
        }
        equipmentElement.classList.add('success-animation');
        setTimeout(() => {
            equipmentElement.classList.remove('success-animation');
        }, 1800);
    } else {
        // 增幅失败
        const failResult = nextLevel.failResult;
        let resultMessage = "";
        
        if (failResult.type === 'level') {
            // 降低等级
            gameState.currentLevel = Math.max(0, gameState.currentLevel + failResult.value);
            resultMessage = `失败！等级降低到 +${gameState.currentLevel}`;
        } else if (failResult.type === 'reset') {
            // 重置到0
            gameState.currentLevel = 0;
            resultMessage = "失败！等级重置到 +0";
        }
        
        equipmentElement.classList.add('fail-animation');
        setTimeout(() => {
            equipmentElement.classList.remove('fail-animation');
        }, 1500);
    }
    
    updateUI();
    updateConsumptionStats();
}

// 重置游戏
function resetGame() {
    gameState.currentLevel = 0;
    gameState.crystals = 100000; // 重置为10万结晶体
    gameState.totalCost = 0;
    gameState.history = [];
    gameState.useLuckyCharm = elements.luckyCharm.checked;
    gameState.highestLevel = 0;
    gameState.attemptCount = 0;
    gameState.houseSoldCount = 0; // 重置卖房次数
    gameState.crystalToTeraRate = parseInt(elements.crystalRate.value) || 1000; // 重置兑换比例
    
    updateUI();
    updateConsumptionStats();
}

// 获取洗浴服务档位
function getBathServiceLevel(money) {
    if (money < 100) {
        return "暂无消费";
    }
    
    for (let level of bathServiceLevels) {
        if (money >= level.minPrice && money <= level.maxPrice) {
            return level.service;
        }
    }
    
    return "神级待遇+超凡脱俗";
}



// 更新结晶兑换比例
function updateCrystalRate() {
    gameState.crystalToTeraRate = parseInt(elements.crystalRate.value) || 1000;
    updateConsumptionStats();
}

// 更新消费统计
function updateConsumptionStats() {
    // 计算总泰拉消耗
    const totalTera = gameState.totalCost * gameState.crystalToTeraRate;
    const totalTeraInWan = Math.round(totalTera / 10000 * 100) / 100; // 保留两位小数
    
    // 计算总金额 (30万泰拉 = 200元)
    const totalMoney = Math.round(totalTera / 300000 * 200);
    
    // 计算夏日套数量 (200元 = 1个夏日套)
    const summerSetsCount = Math.round(totalMoney / 200 * 10) / 10; // 保留一位小数
    
    // 获取洗浴服务档位
    const bathService = getBathServiceLevel(totalMoney);
    
    // 更新显示
    elements.totalTera.textContent = totalTeraInWan;
    elements.totalMoney.textContent = totalMoney;
    elements.summerSets.textContent = summerSetsCount;
    elements.bathLevel.textContent = bathService;
}





// 更新UI
function updateUI() {
    elements.levelValue.textContent = gameState.currentLevel;
    elements.currentLevel.textContent = gameState.currentLevel;
    elements.totalCost.textContent = gameState.totalCost;
    
    if (gameState.currentLevel < 15) {
        const nextLevel = getNextLevelInfo();
        const successRate = getActualSuccessRate(nextLevel.successRate);
        elements.successRate.textContent = `${successRate}%`;
        elements.enhanceBtn.disabled = false;
    } else {
        elements.successRate.textContent = "-";
        elements.enhanceBtn.disabled = true;
    }
    elements.attemptCount.textContent = gameState.attemptCount;
    elements.highestLevel.textContent = gameState.highestLevel;
}

// 计算数学期望
function calculateExpectations() {
    // 初始化表格
    const tableBody = document.querySelector('#expectations-table tbody');
    tableBody.innerHTML = '';
    
    // 不使用幸运符的期望
    const expectationsWithoutCharm = calculateExpectedCosts(false);
    
    // 使用幸运符的期望
    const expectationsWithCharm = calculateExpectedCosts(true);
    
    // 不使用幸运符的期望次数
    const expectedAttemptsWithoutCharm = calculateExpectedAttempts(false);
    
    // 填充表格
    for (let level = 1; level <= 15; level++) {
        const row = document.createElement('tr');
        
        const levelCell = document.createElement('td');
        levelCell.textContent = level;
        
        const withoutCharmCell = document.createElement('td');
        withoutCharmCell.textContent = Math.round(expectationsWithoutCharm[level]);
        
        const withCharmCell = document.createElement('td');
        withCharmCell.textContent = Math.round(expectationsWithCharm[level]);
        
        // 增幅期望次数（期望增幅次数，考虑失败概率）
        const totalAttemptsCell = document.createElement('td');
        totalAttemptsCell.textContent = Math.round(expectedAttemptsWithoutCharm[level]);
        
        row.appendChild(levelCell);
        row.appendChild(withoutCharmCell);
        row.appendChild(withCharmCell);
        row.appendChild(totalAttemptsCell);
        
        tableBody.appendChild(row);
    }
}

// 计算期望成本
function calculateExpectedCosts(useCharm) {
    const expectedCosts = new Array(16).fill(0);
    
    // 从1级开始计算到15级的期望值
    for (let targetLevel = 1; targetLevel <= 15; targetLevel++) {
        expectedCosts[targetLevel] = calculateExpectedCostToLevel(targetLevel, useCharm);
    }
    
        return expectedCosts;
}

// 计算期望增幅次数
function calculateExpectedAttempts(useCharm) {
    const expectedAttempts = new Array(16).fill(0);
    
    // 从1级开始计算到15级的期望次数
    for (let targetLevel = 1; targetLevel <= 15; targetLevel++) {
        expectedAttempts[targetLevel] = calculateExpectedAttemptsToLevel(targetLevel, useCharm);
    }
    
    return expectedAttempts;
}

// 计算从0级到指定等级的期望增幅次数
function calculateExpectedAttemptsToLevel(targetLevel, useCharm) {
    // 动态规划数组，dp[i]表示从0级到i级的期望增幅次数
    const dp = new Array(targetLevel + 1).fill(0);
    
    // 基本情况：到达0级的次数为0
    dp[0] = 0;
    
    // 逐级计算期望次数
    for (let level = 1; level <= targetLevel; level++) {
        const currentConfig = enhancementSystem[level];
        const baseSuccessRate = currentConfig.successRate;
        const successRate = useCharm ? Math.min(baseSuccessRate + 5, 100) : baseSuccessRate;
        
        if (successRate === 100) {
            // 100%成功率的情况
            dp[level] = dp[level - 1] + 1;
        } else {
            // 计算失败后的目标等级
            let failTargetLevel = 0;
            
            if (currentConfig.failResult.type === 'level') {
                // 失败降低等级
                failTargetLevel = Math.max(0, level + currentConfig.failResult.value);
            } else if (currentConfig.failResult.type === 'reset') {
                // 失败重置到0
                failTargetLevel = 0;
            }
            
            // 期望次数计算
            const p = successRate / 100;
            
            // 从level-1到level的期望次数
            // 每次尝试，成功概率为p
            // 失败后回到failTargetLevel，需要额外的(dp[level-1] - dp[failTargetLevel])次重新回到level-1
            // 期望次数 = 1/p + (1-p)/p * (dp[level-1] - dp[failTargetLevel])
            
            const expectedAttemptsThisLevel = 1 / p + (1 - p) / p * (dp[level - 1] - dp[failTargetLevel]);
            
            dp[level] = dp[level - 1] + expectedAttemptsThisLevel;
        }
    }
    
    return dp[targetLevel];
}

// 计算从0级到指定等级的期望花费
function calculateExpectedCostToLevel(targetLevel, useCharm) {
    // 动态规划数组，dp[i]表示从0级到i级的期望结晶体花费
    const dp = new Array(targetLevel + 1).fill(0);
    
    // 基本情况：到达0级的成本为0
    dp[0] = 0;
    
    // 逐级计算期望值
    for (let level = 1; level <= targetLevel; level++) {
        const currentConfig = enhancementSystem[level];
        const cost = currentConfig.cost;
        const baseSuccessRate = currentConfig.successRate;
        const successRate = useCharm ? Math.min(baseSuccessRate + 5, 100) : baseSuccessRate;
        
        if (successRate === 100) {
            // 100%成功率的情况
            dp[level] = dp[level - 1] + cost;
        } else {
            // 计算失败后的目标等级
            let failTargetLevel = 0;
            
            if (currentConfig.failResult.type === 'level') {
                // 失败降低等级
                failTargetLevel = Math.max(0, level + currentConfig.failResult.value);
            } else if (currentConfig.failResult.type === 'reset') {
                // 失败重置到0
                failTargetLevel = 0;
            }
            
            // 简单直接的期望公式
            const p = successRate / 100;
            
            // 从level-1到level的期望成本
            // 每次尝试消耗cost，成功概率为p
            // 失败后回到failTargetLevel，需要额外的(dp[level-1] - dp[failTargetLevel])成本重新回到level-1
            // 期望尝试次数 = 1/p
            // 期望总成本 = cost/p + (1-p)/p * (dp[level-1] - dp[failTargetLevel])
            
            const expectedCostThisLevel = cost / p + (1 - p) / p * (dp[level - 1] - dp[failTargetLevel]);
            
            dp[level] = dp[level - 1] + expectedCostThisLevel;
        }
    }
    
    return dp[targetLevel];
}

// 当文档加载完成时初始化
document.addEventListener('DOMContentLoaded', init);
