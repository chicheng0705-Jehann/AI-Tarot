// 牌阵详情页逻辑

let currentSpread = null;

// 渲染牌阵详情
function renderSpreadDetail(spread) {
  // 更新牌阵名称
  document.getElementById('spreadName').textContent = spread.name;
  
  // 更新标签
  const tagsHTML = spread.tags.join(' / ');
  document.getElementById('spreadTags').textContent = tagsHTML;
  
  // 更新介绍
  document.getElementById('spreadIntro').textContent = spread.description;
  
  // 更新测过人数
  const countElement = document.querySelector('.count-number');
  if (countElement) {
    countElement.textContent = formatNumber(spread.usageCount);
  }
  
  // 更新热门问题
  renderHotQuestions(spread.hotQuestions, spread.id);
  
  // 更新banner（这里可以添加真实图片）
  const banner = document.getElementById('spreadBanner');
  if (banner) {
    banner.innerHTML = `
      <div style="text-align: center; color: white;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔮</div>
        <div style="font-size: 18px; font-weight: 600;">${spread.name}</div>
        <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">${spread.cardCount} 张牌</div>
      </div>
    `;
  }
}

// 渲染热门问题
function renderHotQuestions(questions, spreadId) {
  const container = document.getElementById('hotQuestions');
  if (!container || !questions || questions.length === 0) return;
  
  container.innerHTML = questions.map((question, index) => `
    <div class="question-item" onclick="handleQuestionClick('${spreadId}', '${escapeHtml(question)}')">
      <span class="question-icon">❓</span>
      <span class="question-text">${question}</span>
      <span class="question-arrow"></span>
    </div>
  `).join('');
}

// 转义HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 处理热门问题点击
function handleQuestionClick(spreadId, question) {
  console.log('埋点: 点击热门问题', { spreadId, question });
  
  // 跳转到对话框，带上牌阵ID和问题（但不自动提交）
  navigateTo('chat.html', {
    spreadId: spreadId,
    question: question,
    mode: 'prefill' // 预填充模式（不自动提交）
  });
}

// 处理立即使用按钮点击
function handleStartClick() {
  if (!currentSpread) {
    showToast('数据加载中，请稍候');
    return;
  }
  
  console.log('埋点: 点击立即使用按钮', { spreadId: currentSpread.id });
  
  // 跳转到对话框，带上牌阵ID
  navigateTo('chat.html', {
    spreadId: currentSpread.id,
    mode: 'normal' // 普通提问模式
  });
}

// 加载牌阵详情数据
async function loadSpreadDetail() {
  try {
    // 获取URL参数中的牌阵ID
    const spreadId = getUrlParameter('id');
    
    if (!spreadId) {
      showToast('参数错误');
      setTimeout(() => goBack(), 1000);
      return;
    }
    
    // 加载牌阵数据（添加时间戳避免缓存）
    const spreads = await loadJSON(`../data/spreads.json?t=${Date.now()}`);
    const spread = spreads.find(s => s.id === spreadId);
    
    if (!spread) {
      showToast('牌阵不存在');
      setTimeout(() => goBack(), 1000);
      return;
    }
    
    currentSpread = spread;
    
    // 渲染页面
    renderSpreadDetail(spread);
    
    console.log('牌阵详情加载成功:', spread);
  } catch (error) {
    console.error('加载牌阵详情失败:', error);
    showToast('加载失败，请稍后重试');
  }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  loadSpreadDetail();
  
  // 绑定立即使用按钮
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', handleStartClick);
  }
});

