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
    { level: 12, cost: 646, successRate: 33, failResult: { type: 'reset', value: 0 } }
];

// 游戏状态
const gameState = {
    currentLevel: 0,
    crystals: 0,
    totalCost: 0,
    useLuckyCharm: false,
    history: [],
    highestLevel: 0,
    attemptCount: 0
};

// DOM元素缓存
const elements = {
    levelValue: document.querySelector('.level-value'),
    currentLevel: document.getElementById('current-level'),
    crystalCount: document.getElementById('crystal-count'),
    totalCost: document.getElementById('total-cost'),
    luckyCharm: document.getElementById('lucky-charm'),
    enhanceBtn: document.getElementById('enhance-btn'),
    resetBtn: document.getElementById('reset-btn'),
    successRate: document.getElementById('success-rate'),
    nextCost: document.getElementById('next-cost'),
    historyLog: document.getElementById('history-log'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    equipmentImage: document.getElementById('equipment-image'),
    crystalInput: document.getElementById('crystal-input'),
    addCrystalBtn: document.getElementById('add-crystal-btn'),
    attemptCount: document.getElementById('attempt-count'),
    highestLevel: document.getElementById('highest-level')
};

// 初始化
function init() {
    updateUI();
    calculateExpectations();
    updateHistorySummary();
    
    // 使用本地装备图片
    elements.equipmentImage.src = "img/equipment.png";
    
    // 事件监听
    elements.luckyCharm.addEventListener('change', toggleLuckyCharm);
    elements.enhanceBtn.addEventListener('click', enhanceOnce);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.addCrystalBtn.addEventListener('click', addCrystals);
    
    // 为结晶体输入框添加回车键事件
    elements.crystalInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addCrystals();
        }
    });
    
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
    if (gameState.currentLevel >= 12) {
        addToHistory("已经达到最高等级 +12！", "normal");
        return;
    }
    
    const nextLevel = getNextLevelInfo();
    
    // 检查结晶体是否足够
    if (gameState.crystals < nextLevel.cost) {
        addToHistory(`结晶体不足！需要 ${nextLevel.cost} 个`, "fail");
        
        // 弹窗提醒用户是否添加默认数量的结晶体
        if (confirm(`结晶体不足！\n当前拥有：${gameState.crystals} 个\n需要：${nextLevel.cost} 个\n\n是否添加默认数量 100,000 个结晶体继续增幅？`)) {
            gameState.crystals += 100000;
            addToHistory(`系统默认添加了 100,000 个结晶体`, "normal");
            updateHistorySummary();
            updateUI();
            
            // 添加结晶体后重新尝试增幅
            enhanceOnce();
        }
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
    }, 500);
    
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
        
        addToHistory(`增幅成功！+${gameState.currentLevel}`, "success");
        equipmentElement.classList.add('success-animation');
        setTimeout(() => {
            equipmentElement.classList.remove('success-animation');
        }, 1000);
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
        
        addToHistory(resultMessage, "fail");
        equipmentElement.classList.add('fail-animation');
        setTimeout(() => {
            equipmentElement.classList.remove('fail-animation');
        }, 1000);
    }
    
    updateUI();
    updateHistorySummary();
}

// 重置游戏
function resetGame() {
    gameState.currentLevel = 0;
    gameState.crystals = 0;
    gameState.totalCost = 0;
    gameState.history = [];
    gameState.useLuckyCharm = elements.luckyCharm.checked;
    gameState.highestLevel = 0;
    gameState.attemptCount = 0;
    
    elements.historyLog.innerHTML = '';
    updateUI();
    updateHistorySummary();
}

// 添加历史记录
function addToHistory(message, type) {
    // 不再显示每次增幅的详细记录，只在日志中保存
    gameState.history.push({
        message: message,
        type: type,
        timestamp: new Date().toLocaleTimeString()
    });
}

// 更新历史记录摘要
function updateHistorySummary() {
    // 清空历史记录显示
    elements.historyLog.innerHTML = '';
    
    // 创建最高等级记录
    const highestLevelItem = document.createElement('div');
    highestLevelItem.className = 'history-item success';
    highestLevelItem.textContent = `最高增幅等级: +${gameState.highestLevel}`;
    elements.historyLog.appendChild(highestLevelItem);
    
    // 创建尝试次数记录
    const attemptCountItem = document.createElement('div');
    attemptCountItem.className = 'history-item normal';
    attemptCountItem.textContent = `增幅尝试次数: ${gameState.attemptCount}次`;
    elements.historyLog.appendChild(attemptCountItem);
    
    // 如果当前等级不是最高等级，显示当前等级
    if (gameState.currentLevel !== gameState.highestLevel) {
        const currentLevelItem = document.createElement('div');
        currentLevelItem.className = 'history-item normal';
        currentLevelItem.textContent = `当前等级: +${gameState.currentLevel}`;
        elements.historyLog.appendChild(currentLevelItem);
    }
    
    elements.historyLog.scrollTop = elements.historyLog.scrollHeight;
}

// 添加结晶体
function addCrystals() {
    const inputValue = elements.crystalInput.value.trim();
    
    // 检查用户是否输入了结晶体数量
    if (!inputValue || inputValue === '') {
        // 弹窗提醒用户没有输入数量，询问是否使用默认值
        if (confirm('您没有输入结晶体数量！\n是否使用默认数量 100,000 个结晶体？')) {
            gameState.crystals += 100000;
            elements.crystalInput.value = '';
            updateUI();
            
            // 添加到历史记录
            addToHistory(`系统默认添加了 100,000 个结晶体`, "normal");
            updateHistorySummary();
        }
        return;
    }
    
    const amount = parseInt(inputValue);
    if (!isNaN(amount) && amount > 0) {
        gameState.crystals += amount;
        elements.crystalInput.value = '';
        updateUI();
        
        // 添加到历史记录
        addToHistory(`添加了 ${amount} 个结晶体`, "normal");
        updateHistorySummary();
    } else {
        // 输入的不是有效数字
        alert('请输入有效的结晶体数量（正整数）！');
    }
}

// 更新UI
function updateUI() {
    elements.levelValue.textContent = gameState.currentLevel;
    elements.currentLevel.textContent = gameState.currentLevel;
    elements.crystalCount.textContent = gameState.crystals;
    elements.totalCost.textContent = gameState.totalCost;
    
    if (gameState.currentLevel < 12) {
        const nextLevel = getNextLevelInfo();
        elements.nextCost.textContent = nextLevel.cost;
        const successRate = getActualSuccessRate(nextLevel.successRate);
        elements.successRate.textContent = `${successRate}%`;
        elements.enhanceBtn.disabled = false;
    } else {
        elements.nextCost.textContent = "-";
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
    
    // 填充表格
    for (let level = 1; level <= 12; level++) {
        const row = document.createElement('tr');
        
        const levelCell = document.createElement('td');
        levelCell.textContent = level;
        
        const withoutCharmCell = document.createElement('td');
        withoutCharmCell.textContent = Math.round(expectationsWithoutCharm[level]);
        
        const withCharmCell = document.createElement('td');
        withCharmCell.textContent = Math.round(expectationsWithCharm[level]);
        
        const ratioCell = document.createElement('td');
        const ratio = expectationsWithoutCharm[level] / expectationsWithCharm[level];
        ratioCell.textContent = ratio.toFixed(2);
        
        // 添加颜色提示：绿色表示使用幸运符更划算，红色表示不使用更划算
        if (ratio > 1) {
            ratioCell.style.color = '#28a745'; // 绿色
            ratioCell.textContent += ' ✓';
        } else if (ratio < 1) {
            ratioCell.style.color = '#dc3545'; // 红色
            ratioCell.textContent += ' ✗';
        }
        
        row.appendChild(levelCell);
        row.appendChild(withoutCharmCell);
        row.appendChild(withCharmCell);
        row.appendChild(ratioCell);
        
        tableBody.appendChild(row);
    }
}

// 计算期望成本
function calculateExpectedCosts(useCharm) {
    const expectedCosts = new Array(13).fill(0);
    
    // 从1级开始计算到12级的期望值
    for (let targetLevel = 1; targetLevel <= 12; targetLevel++) {
        expectedCosts[targetLevel] = calculateExpectedCostToLevel(targetLevel, useCharm);
    }
    
    return expectedCosts;
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
        const failRate = 100 - successRate;
        
        if (failRate === 0) {
            // 100%成功率的情况
            dp[level] = dp[level - 1] + cost;
        } else {
            // 计算失败后的期望
            let failExpectation = 0;
            
            if (currentConfig.failResult.type === 'level') {
                // 失败降低等级
                const newLevel = Math.max(0, level - 1 + currentConfig.failResult.value);
                failExpectation = dp[newLevel];
            } else if (currentConfig.failResult.type === 'reset') {
                // 失败重置到0
                failExpectation = dp[0];
            }
            
            // 期望公式：E = 成本 + (失败概率 * (失败后继续尝试的期望))
            // 对于成功概率p，失败概率q=1-p，成本为c，
            // E = c + q*E => E = c / (1 - q) = c / p
            dp[level] = dp[level - 1] + cost + (failRate / 100) * (failExpectation - dp[level - 1] + dp[level]);
            dp[level] = cost + (failRate / 100) * (failExpectation) + (successRate / 100) * dp[level - 1];
            dp[level] = (cost + (failRate / 100) * failExpectation + (successRate / 100) * dp[level - 1]) / (1 - (failRate / 100) * 0);
        }
    }
    
    return dp[targetLevel];
}

// 当文档加载完成时初始化
document.addEventListener('DOMContentLoaded', init);
