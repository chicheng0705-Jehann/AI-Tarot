// AI咨询页逻辑

let quickQuestionsData = {};
let currentMode = 'auto'; // auto, tarot, astro, bazi

// 模式配置
const modeConfig = {
  auto: {
    title: '准了小精灵',
    emoji: '🧚',
    subtitle: '写下问题，小精灵会用最合适的方式为你解答～',
  },
  tarot: {
    title: '准了塔罗师',
    emoji: '🔮',
    subtitle: '帮你解答/常见问题/答疑解惑/带给你宽慰/帮助',
  },
  astro: {
    title: '准了星盘师',
    emoji: '⭐',
    subtitle: '通过星盘为你解答关于命运/性格/关系的问题',
  },
  bazi: {
    title: '准了八字师',
    emoji: '☯',
    subtitle: '通过八字为你预测未来/分析运势/指点迷津',
  },
};

// 初始化
async function init() {
  try {
    console.log('开始初始化AI咨询页...');
    
    // 加载快捷问题
    quickQuestionsData = await loadJSON('../data/quick-questions.json');
    console.log('快捷问题数据加载成功:', quickQuestionsData);
    
    // 绑定输入框字数统计
    const input = document.getElementById('questionInput');
    const charCount = document.getElementById('charCount');
    
    if (input && charCount) {
      input.addEventListener('input', () => {
        charCount.textContent = input.value.length;
      });
    }
    
    // 回车提交（Ctrl+Enter 或 Cmd+Enter）
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          handleSubmit();
        }
      });
    }
    
    // 点击页面其他地方关闭模式菜单
    document.addEventListener('click', (e) => {
      const modeMenu = document.getElementById('modeMenu');
      const modeSelector = document.getElementById('modeSelector');
      
      if (modeMenu && !modeMenu.contains(e.target) && !modeSelector.contains(e.target)) {
        modeMenu.style.display = 'none';
      }
    });
    
  } catch (error) {
    console.error('初始化失败:', error);
  }
}

// 切换模式菜单
function toggleModeMenu() {
  console.log('=== 切换模式菜单 ===');
  
  const modeMenu = document.getElementById('modeMenu');
  console.log('- modeMenu元素:', modeMenu);
  
  if (modeMenu) {
    const currentDisplay = modeMenu.style.display;
    console.log('- 当前显示状态:', currentDisplay);
    
    const newDisplay = currentDisplay === 'none' ? 'block' : 'none';
    modeMenu.style.display = newDisplay;
    
    console.log('- 新显示状态:', newDisplay);
    console.log('✅ 菜单状态已切换');
  } else {
    console.error('❌ 找不到modeMenu元素！');
  }
}

// 选择模式
function selectMode(mode, closeMenu = true) {
  console.log('埋点: 选择模式', { mode });
  
  // 星盘和八字未开放
  if (mode === 'astro' || mode === 'bazi') {
    showToast('功能开放中，敬请期待');
    if (closeMenu) toggleModeMenu();
    return;
  }
  
  currentMode = mode;
  
  // 更新UI
  const config = modeConfig[mode];
  document.getElementById('navTitle').textContent = config.title;
  document.getElementById('currentMode').textContent = mode === 'auto' ? '自动匹配' : mode === 'tarot' ? '塔罗占卜' : '';
  document.getElementById('avatarEmoji').textContent = config.emoji;
  document.getElementById('aiName').textContent = config.title;
  document.getElementById('aiSubtitle').textContent = config.subtitle;
  
  // 更新选中状态
  document.querySelectorAll('.mode-option').forEach(opt => {
    opt.classList.remove('active');
  });
  document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');
  
  // 关闭菜单（如果需要）
  if (closeMenu) toggleModeMenu();
}

// 显示历史记录
function showHistory() {
  console.log('埋点: 点击历史记录');
  showToast('功能开放中，敬请期待');
}

// 切换热门问题浮层
function toggleHotQuestions() {
  console.log('=== 点击热门提问按钮 ===');
  
  const overlay = document.getElementById('hotQuestionsOverlay');
  const questionsList = document.getElementById('questionsList');
  
  console.log('浮层元素检查:');
  console.log('- overlay:', overlay);
  console.log('- questionsList:', questionsList);
  
  if (!questionsList || !overlay) {
    console.error('❌ 找不到浮层元素！');
    console.log('检查HTML中是否存在 id="hotQuestionsOverlay" 和 id="questionsList"');
    return;
  }
  
  // 检查数据是否已加载
  console.log('数据检查:');
  console.log('- quickQuestionsData:', quickQuestionsData);
  console.log('- 数据为空？', !quickQuestionsData || Object.keys(quickQuestionsData).length === 0);
  
  if (!quickQuestionsData || Object.keys(quickQuestionsData).length === 0) {
    console.error('❌ 快捷问题数据未加载！');
    showToast('数据加载中，请稍候...');
    return;
  }
  
  console.log('✅ 数据检查通过，开始渲染问题列表');
  
  // 渲染问题列表
  renderHotQuestions();
  
  console.log('设置浮层显示样式');
  overlay.style.display = 'flex';
  
  // 添加动画
  setTimeout(() => {
    overlay.classList.add('show');
    console.log('✅ 浮层动画完成');
  }, 10);
}

// 关闭热门问题浮层
function closeHotQuestions() {
  const overlay = document.getElementById('hotQuestionsOverlay');
  if (!overlay) return;
  
  overlay.classList.remove('show');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);
}

// 渲染热门问题
function renderHotQuestions() {
  const container = document.getElementById('questionsList');
  if (!container) {
    console.error('找不到questionsList容器');
    return;
  }
  
  console.log('开始渲染热门问题，quickQuestionsData:', quickQuestionsData);
  
  // 获取问题列表（过滤掉标题类文本）
  let questions = quickQuestionsData.default || [];
  
  // 如果有ai_page，使用ai_page的问题（跳过第一个，因为它是标题）
  if (quickQuestionsData.ai_page && quickQuestionsData.ai_page.length > 1) {
    questions = quickQuestionsData.ai_page.slice(1);
  }
  
  console.log('使用的问题列表:', questions);
  
  if (questions.length === 0) {
    console.warn('问题列表为空');
    container.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">暂无热门问题</p>';
    return;
  }
  
  const html = questions.map((q, index) => `
    <div class="question-item" onclick="selectHotQuestion('${escapeHtml(q)}')">
      <span class="question-icon">❓</span>
      <span class="question-text">${q}</span>
      <span class="question-arrow">›</span>
    </div>
  `).join('');
  
  console.log('生成的HTML:', html);
  container.innerHTML = html;
  console.log('热门问题渲染完成');
}

// 选择热门问题
function selectHotQuestion(question) {
  console.log('埋点: 点击热门问题', { question });
  
  // 填充到输入框
  const input = document.getElementById('questionInput');
  const charCount = document.getElementById('charCount');
  
  if (input) {
    input.value = question;
    input.focus();
  }
  
  if (charCount) {
    charCount.textContent = question.length;
  }
  
  // 关闭浮层
  closeHotQuestions();
}

// 处理提交
async function handleSubmit() {
  const input = document.getElementById('questionInput');
  if (!input) return;
  
  const question = input.value.trim();
  
  if (!question) {
    showToast('请输入您的问题');
    return;
  }
  
  console.log('埋点: 提交问题', { question, mode: currentMode });
  
  if (currentMode === 'tarot') {
    // 塔罗占卜模式：直接跳转到对话框，并自动提交问题
    navigateTo('chat.html', { 
      question: question,
      mode: 'auto_submit' // 自动提交模式
    });
  } else if (currentMode === 'auto') {
    // 自动匹配模式：显示加载，然后展示匹配结果
    await showAutoMatchResult(question);
  }
}

// 显示自动匹配结果
async function showAutoMatchResult(question) {
  // 创建加载遮罩
  const loadingHTML = `
    <div class="auto-match-overlay" id="autoMatchOverlay">
      <div class="loading-box">
        <div class="loading-avatar">
          <span class="loading-emoji">🧚</span>
        </div>
        <p class="loading-text">小精灵思考中<span class="dots"></span></p>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', loadingHTML);
  
  // 模拟思考时间
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 移除加载，显示匹配结果
  const loadingOverlay = document.getElementById('autoMatchOverlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
  
  // 显示匹配结果
  showMatchResultPanel(question);
}

// 显示匹配结果面板
function showMatchResultPanel(question) {
  const resultHTML = `
    <div class="match-result-overlay" id="matchResultOverlay" onclick="closeMatchResult()">
      <div class="match-result-panel" onclick="event.stopPropagation()">
        <div class="result-avatar">
          <span class="result-emoji">🧚</span>
        </div>
        <h3 class="result-title">已为你自动匹配最适合的解答方式</h3>
        <p class="result-desc">根据你的问题，我为你匹配了以下最合适的解答方式，让解答更加准确～</p>
        
        <div class="result-card">
          <div class="result-card-icon">🔮</div>
          <div class="result-card-content">
            <h4>塔罗占卜</h4>
            <p>通过塔罗牌为你解读问题，并希望塔罗能给出指引~</p>
          </div>
        </div>
        
        <div class="result-buttons">
          <button class="btn-result-cancel" onclick="closeMatchResult()">换个方式</button>
          <button class="btn-result-confirm" onclick="confirmMatchResult('${escapeHtml(question)}')">去咨询塔罗师</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', resultHTML);
  
  // 添加显示动画
  setTimeout(() => {
    const overlay = document.getElementById('matchResultOverlay');
    if (overlay) {
      overlay.classList.add('show');
    }
  }, 10);
}

// 关闭匹配结果
function closeMatchResult() {
  const overlay = document.getElementById('matchResultOverlay');
  if (!overlay) return;
  
  overlay.classList.remove('show');
  setTimeout(() => {
    overlay.remove();
  }, 300);
}

// 确认匹配结果
function confirmMatchResult(question) {
  console.log('埋点: 确认匹配结果', { question, result: 'tarot' });
  
  // 跳转到塔罗对话框，并自动提交问题
  navigateTo('chat.html', { 
    question: question,
    mode: 'auto_submit' // 自动提交模式
  });
}

// 转义HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 覆盖goBack函数，AI咨询页返回到首页
window.goBack = function() {
  console.log('AI咨询页：返回首页');
  window.location.href = '/frontend/index.html';
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== AI咨询页面开始初始化 ===');
  
  // 检查关键元素是否存在
  const modeSelector = document.getElementById('modeSelector');
  const modeMenu = document.getElementById('modeMenu');
  const hotQuestionsBtn = document.getElementById('hotQuestionsBtn');
  
  console.log('关键元素检查:');
  console.log('- modeSelector:', modeSelector);
  console.log('- modeMenu:', modeMenu);
  console.log('- hotQuestionsBtn:', hotQuestionsBtn);
  
  setActiveTab('ai');
  init();
  
  // 确保菜单初始状态是关闭的
  if (modeMenu) {
    modeMenu.style.display = 'none';
    console.log('强制设置菜单为关闭状态');
  }
  
  selectMode('auto', false); // 默认自动匹配模式（不关闭菜单，因为菜单本来就是关闭的）
  
  console.log('=== AI咨询页面初始化完成 ===');
});
