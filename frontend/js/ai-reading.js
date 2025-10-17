// AI解读入口页逻辑

let quickQuestionsData = {};

// 初始化
async function init() {
  try {
    // 加载快捷问题
    quickQuestionsData = await loadJSON('../data/quick-questions.json');
    renderHints();
    
    // 绑定输入框字数统计
    const input = document.getElementById('questionInput');
    const charCount = document.getElementById('charCount');
    
    if (input && charCount) {
      input.addEventListener('input', () => {
        charCount.textContent = input.value.length;
      });
    }
    
    // 绑定提交按钮
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', handleSubmit);
    }
    
    // 回车提交
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          handleSubmit();
        }
      });
    }
    
  } catch (error) {
    console.error('初始化失败:', error);
  }
}

// 渲染快捷提示
function renderHints() {
  const container = document.getElementById('hintsGrid');
  if (!container) return;
  
  const hints = quickQuestionsData.ai_page || quickQuestionsData.default || [];
  
  container.innerHTML = hints.slice(0, 3).map(hint => `
    <div class="hint-item" onclick="handleHintClick('${escapeHtml(hint)}')">${hint}</div>
  `).join('');
}

// 处理快捷问题点击
function handleHintClick(question) {
  console.log('埋点: 点击快捷问题', { question });
  
  // 跳转到对话框，带上问题
  navigateTo('chat.html', { question: question });
}

// 处理提交
function handleSubmit() {
  const input = document.getElementById('questionInput');
  if (!input) return;
  
  const question = input.value.trim();
  
  if (!question) {
    showToast('请输入您的问题');
    return;
  }
  
  console.log('埋点: 提交问题', { question, from: 'ai_reading_page' });
  
  // 跳转到对话框
  navigateTo('chat.html', { question: question });
}

// 转义HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  setActiveTab('ai');
  init();
});

