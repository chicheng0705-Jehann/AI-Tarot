// AI对话框逻辑

// 状态管理
const chatState = {
  messages: [],
  currentSpreadId: null,
  currentQuestion: null,
  sessionId: null,
  isWaitingResponse: false,
  mode: 'default', // default, spread_selected, drawing, reading
};

let spreadsData = [];
let quickQuestionsData = {};

// 初始化
async function initChat() {
  try {
    // 检查URL参数（先获取参数）
    const spreadId = getUrlParameter('spreadId');
    const question = getUrlParameter('question');
    const mode = getUrlParameter('mode');
    
    if (spreadId) {
      chatState.currentSpreadId = spreadId;
    }
    
    // 加载数据
    spreadsData = await loadJSON('../data/spreads.json');
    quickQuestionsData = await loadJSON('../data/quick-questions.json');
    
    // 数据加载完成后，渲染界面
    // 根据是否有spreadId渲染不同的欢迎消息
    renderWelcomeMessage();
    
    // 渲染快捷问题
    renderQuickQuestions();
    
    // 如果有预填问题，只填充不提交
    if (question && mode === 'prefill') {
      setTimeout(() => {
        fillQuestion(question);
      }, 500);
    }
    
  } catch (error) {
    console.error('初始化失败:', error);
    showToast('初始化失败，请刷新重试');
  }
}

// 渲染欢迎消息
function renderWelcomeMessage() {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  // 清空现有消息
  messagesList.innerHTML = '';
  
  let welcomeText = '';
  let spread = null;
  
  // 如果有指定牌阵，显示牌阵介绍
  if (chatState.currentSpreadId) {
    spread = spreadsData.find(s => s.id === chatState.currentSpreadId);
    if (spread) {
      welcomeText = spread.description;
    }
  }
  
  // 否则显示默认欢迎语
  if (!welcomeText) {
    welcomeText = 'Hi，我是准了AI塔罗师～\n\n请告诉我你想咨询的问题，我会为你挑选合适的牌阵并进行解读。';
  }
  
  // 添加欢迎消息
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-item ai-message welcome-message';
  
  messageDiv.innerHTML = `
    <div class="welcome-avatar">
      <div class="avatar-circle-large">
        <span style="font-size: 48px;">🔮</span>
      </div>
    </div>
    <div class="message-content">
      <div class="message-bubble welcome-bubble">
        <p>${welcomeText.replace(/\n/g, '</p><p>')}</p>
      </div>
    </div>
  `;
  
  messagesList.appendChild(messageDiv);
}

// 渲染快捷问题（在气泡内）
function renderQuickQuestions() {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  let questions = quickQuestionsData.default || [];
  
  // 如果有指定牌阵，使用该牌阵的快捷问题
  if (chatState.currentSpreadId && quickQuestionsData.spread_specific) {
    const spreadQuestions = quickQuestionsData.spread_specific[chatState.currentSpreadId];
    if (spreadQuestions) {
      questions = spreadQuestions;
    }
  }
  
  // 创建快捷问题气泡
  const quickQuestionsDiv = document.createElement('div');
  quickQuestionsDiv.className = 'message-item ai-message';
  quickQuestionsDiv.id = 'quickQuestionsMessage';
  
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar';
  avatarDiv.innerHTML = `
    <div class="avatar-circle">
      <span style="font-size: 20px;">🔮</span>
    </div>
  `;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'message-bubble';
  
  const titleP = document.createElement('p');
  titleP.className = 'quick-title';
  titleP.textContent = '你可能想问我';
  
  const questionsContainer = document.createElement('div');
  questionsContainer.className = 'quick-questions-in-bubble';
  
  // 为每个问题创建按钮
  questions.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'quick-question-btn-bubble';
    btn.textContent = q;
    btn.onclick = function() {
      fillQuestion(q);
    };
    questionsContainer.appendChild(btn);
  });
  
  bubbleDiv.appendChild(titleP);
  bubbleDiv.appendChild(questionsContainer);
  contentDiv.appendChild(bubbleDiv);
  quickQuestionsDiv.appendChild(avatarDiv);
  quickQuestionsDiv.appendChild(contentDiv);
  
  messagesList.appendChild(quickQuestionsDiv);
  scrollToBottom();
}

// 填充问题到输入框（不自动提交）
function fillQuestion(question) {
  console.log('埋点: 点击快捷问题（填充）', { question });
  
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = question;
    input.focus();
    
    // 自动调整高度
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  }
  
  // 隐藏快捷问题消息
  const quickMsg = document.getElementById('quickQuestionsMessage');
  if (quickMsg) {
    quickMsg.style.display = 'none';
  }
}

// 发送用户消息
function sendUserMessage(text) {
  if (!text || !text.trim()) {
    showToast('请输入问题');
    return;
  }
  
  if (chatState.isWaitingResponse) {
    showToast('请等待AI回复');
    return;
  }
  
  // 隐藏快捷问题消息
  const quickMsg = document.getElementById('quickQuestionsMessage');
  if (quickMsg) {
    quickMsg.style.display = 'none';
  }
  
  // 添加用户消息
  addMessage('user', text);
  
  // 清空输入框
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = '';
    input.style.height = 'auto';
  }
  
  // 保存问题
  chatState.currentQuestion = text;
  chatState.isWaitingResponse = true;
  
  // 显示AI正在思考
  setTimeout(() => {
    addTypingIndicator();
    
    // 模拟AI匹配牌阵
    setTimeout(() => {
      matchSpreadAndRespond(text);
    }, 1500);
  }, 300);
}

// 匹配牌阵并回复
async function matchSpreadAndRespond(question) {
  removeTypingIndicator();
  
  try {
    // 如果已经指定了牌阵，直接使用
    let selectedSpread = null;
    
    if (chatState.currentSpreadId) {
      selectedSpread = spreadsData.find(s => s.id === chatState.currentSpreadId);
    } else {
      // 模拟AI匹配牌阵（实际应该调用后端API）
      selectedSpread = await mockMatchSpread(question);
    }
    
    if (!selectedSpread) {
      addMessage('ai', '抱歉，暂时无法匹配合适的牌阵，请重新描述您的问题。');
      chatState.isWaitingResponse = false;
      return;
    }
    
    chatState.currentSpreadId = selectedSpread.id;
    
    // 添加AI匹配结果消息
    addSpreadMatchMessage(selectedSpread);
    
    chatState.isWaitingResponse = false;
    
  } catch (error) {
    console.error('匹配牌阵失败:', error);
    removeTypingIndicator();
    addMessage('ai', '抱歉，系统出现了一些问题，请稍后重试。');
    chatState.isWaitingResponse = false;
  }
}

// 模拟匹配牌阵（实际应该调用embedding API）
async function mockMatchSpread(question) {
  // 简单的关键词匹配逻辑
  const q = question.toLowerCase();
  
  if (q.includes('财') || q.includes('钱') || q.includes('收入') || q.includes('赚')) {
    return spreadsData.find(s => s.id === 'financial_machine');
  } else if (q.includes('感情') || q.includes('爱') || q.includes('恋')) {
    return spreadsData.find(s => s.id === 'love_destiny');
  } else {
    // 默认返回三牌阵
    return spreadsData.find(s => s.id === 'three_card') || spreadsData[0];
  }
}

// 添加消息
function addMessage(role, text, html = null) {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-item ${role}-message`;
  
  const avatarEmoji = role === 'ai' ? '🔮' : '👤';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <div class="avatar-circle">
        <span style="font-size: 20px;">${avatarEmoji}</span>
      </div>
    </div>
    <div class="message-content">
      <div class="message-bubble">
        ${html || `<p>${escapeHtml(text)}</p>`}
      </div>
    </div>
  `;
  
  messagesList.appendChild(messageDiv);
  scrollToBottom();
  
  chatState.messages.push({ role, text, html, timestamp: Date.now() });
}

// 添加牌阵匹配消息
function addSpreadMatchMessage(spread) {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-item ai-message';
  messageDiv.id = 'spreadMatchMessage';
  
  // 创建头像
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar';
  avatarDiv.innerHTML = `
    <div class="avatar-circle">
      <span style="font-size: 20px;">🔮</span>
    </div>
  `;
  
  // 创建内容
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  // 创建气泡
  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'message-bubble';
  
  const p1 = document.createElement('p');
  p1.innerHTML = `针对你的问题，我为你选择的牌阵是【<strong>${spread.name}</strong>】`;
  
  const p2 = document.createElement('p');
  p2.className = 'spread-match-desc';
  p2.textContent = spread.description;
  
  bubbleDiv.appendChild(p1);
  bubbleDiv.appendChild(p2);
  
  // 创建"换个牌阵"按钮
  const changeBtn = document.createElement('button');
  changeBtn.className = 'btn-change-spread';
  changeBtn.textContent = '⇄ 换个牌阵';
  changeBtn.onclick = openSpreadSelector;
  
  contentDiv.appendChild(bubbleDiv);
  contentDiv.appendChild(changeBtn);
  
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  
  messagesList.appendChild(messageDiv);
  
  // 隐藏输入区域，显示底部操作按钮
  hideInputArea();
  showBottomActions();
  
  scrollToBottom();
}

// 打开牌阵选择器
function openSpreadSelector() {
  console.log('埋点: 点击换个牌阵');
  
  const modal = document.getElementById('spreadSelector');
  const listContainer = document.getElementById('spreadSelectorList');
  
  if (!modal || !listContainer) return;
  
  // 渲染牌阵列表
  listContainer.innerHTML = spreadsData.map(spread => `
    <div class="spread-selector-item ${spread.id === chatState.currentSpreadId ? 'active' : ''}"
         onclick="selectSpread('${spread.id}')">
      <div class="spread-selector-name">${spread.name}</div>
      <div class="spread-selector-desc">${spread.description}</div>
    </div>
  `).join('');
  
  modal.style.display = 'flex';
}

// 关闭牌阵选择器
function closeSpreadSelector() {
  const modal = document.getElementById('spreadSelector');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 选择牌阵
function selectSpread(spreadId) {
  console.log('埋点: 选择新牌阵', { spreadId });
  
  const spread = spreadsData.find(s => s.id === spreadId);
  if (!spread) return;
  
  chatState.currentSpreadId = spreadId;
  closeSpreadSelector();
  
  // 添加切换牌阵的消息
  addMessage('ai', `已为你切换到「${spread.name}」牌阵。`);
  
  // 重新显示操作按钮
  setTimeout(() => {
    addSpreadMatchMessage(spread);
  }, 300);
}

// 重新输入问题
function handleReinput() {
  console.log('埋点: 点击重新输入问题');
  
  // 不发送AI消息
  // 隐藏底部操作按钮
  hideBottomActions();
  
  // 显示输入区域
  showInputArea();
  
  // 将之前的问题填充到输入框
  const input = document.getElementById('chatInput');
  if (input && chatState.currentQuestion) {
    input.value = chatState.currentQuestion;
    input.focus();
    
    // 自动调整高度
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    
    // 尝试唤起键盘（移动端）
    if ('ontouchstart' in window) {
      input.click();
    }
  }
}

// 去抽牌
async function handleDrawCards() {
  console.log('埋点: 点击去抽牌', { 
    spreadId: chatState.currentSpreadId,
    question: chatState.currentQuestion 
  });
  
  if (!chatState.currentSpreadId || !chatState.currentQuestion) {
    showToast('参数错误');
    return;
  }
  
  // 隐藏底部操作按钮
  hideBottomActions();
  
  // 显示抽牌动画
  showDrawingAnimation();
  
  // 模拟抽牌过程（2秒）
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 隐藏抽牌动画
  hideDrawingAnimation();
  
  // 显示输入区域
  showInputArea();
  
  // 模拟抽牌结果
  const spread = spreadsData.find(s => s.id === chatState.currentSpreadId);
  const drawResult = mockDrawCards(spread);
  
  // 显示抽牌结果
  addDrawResultMessage(drawResult, spread);
  
  // 开始AI解读
  setTimeout(() => {
    startAIReading(drawResult, spread);
  }, 1000);
}

// 模拟抽牌
function mockDrawCards(spread) {
  const cardNames = ['愚者', '魔术师', '女祭司', '皇后', '皇帝', '教皇', '恋人', '战车', '力量', '隐者', '命运之轮', '正义', '倒吊人', '死神', '节制', '恶魔', '塔', '星星', '月亮', '太阳', '审判', '世界'];
  const orientations = ['正位', '逆位'];
  
  return spread.positions.map((pos, index) => ({
    position: pos.position,
    positionName: pos.name,
    cardName: cardNames[Math.floor(Math.random() * cardNames.length)],
    orientation: orientations[Math.floor(Math.random() * orientations.length)],
  }));
}

// 添加抽牌结果消息
function addDrawResultMessage(drawResult, spread) {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  const cardsHTML = drawResult.map(card => `
    <div class="card-item">
      <div class="card-position">${card.positionName}</div>
      <div class="card-name">${card.cardName}</div>
      <div style="font-size: 10px; margin-top: 4px;">${card.orientation}</div>
    </div>
  `).join('');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-item ai-message';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <div class="avatar-circle">
        <span style="font-size: 20px;">🔮</span>
      </div>
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <p>抽牌完成！你的牌面如下：</p>
        <div class="draw-result-card">
          <div class="draw-result-title">${spread.name} · 牌面结果</div>
          <div class="cards-display">
            ${cardsHTML}
          </div>
        </div>
      </div>
    </div>
  `;
  
  messagesList.appendChild(messageDiv);
  scrollToBottom();
}

// 开始AI解读
async function startAIReading(drawResult, spread) {
  addTypingIndicator();
  
  try {
    // 调用后端API获取解读
    const reading = await callAIReadingAPI(chatState.currentQuestion, spread, drawResult);
    
    removeTypingIndicator();
    
    // 添加解读消息（支持流式输出）
    addStreamingMessage(reading);
    
  } catch (error) {
    console.error('AI解读失败:', error);
    removeTypingIndicator();
    
    // 降级：使用模拟解读
    const mockReading = generateMockReading(drawResult, spread);
    addStreamingMessage(mockReading);
  }
}

// 调用AI解读API
async function callAIReadingAPI(question, spread, drawResult) {
  try {
    const response = await callAPI('chat', {
      question: question,
      spread: {
        id: spread.id,
        name: spread.name,
        positions: spread.positions,
      },
      cards: drawResult,
    });
    
    return response.reading || generateMockReading(drawResult, spread);
  } catch (error) {
    console.error('调用API失败，使用模拟数据:', error);
    return generateMockReading(drawResult, spread);
  }
}

// 生成模拟解读
function generateMockReading(drawResult, spread) {
  const readings = [];
  
  // 单张牌解读
  drawResult.forEach(card => {
    readings.push({
      type: 'card',
      title: `${card.positionName} · ${card.cardName} (${card.orientation})`,
      content: `${card.cardName}在${card.positionName}出现，${card.orientation}代表着新的开始和无限的可能。这张牌提示你要勇敢地踏出第一步，不要被恐惧所束缚。虽然前路未知，但正是这种未知才充满了机遇。`,
    });
  });
  
  // 综合解读
  readings.push({
    type: 'summary',
    title: '综合解读',
    content: `从整体牌面来看，${spread.name}为你揭示了一个完整的发展脉络。当前的状况需要你保持开放和积极的心态，相信自己的直觉。这些牌告诉我们，虽然过程可能充满挑战，但只要坚持正确的方向，未来一定会有好的结果。`,
  });
  
  // 建议
  readings.push({
    type: 'advice',
    title: '给你的建议',
    content: `建议你在面对当前的问题时，要相信自己的判断力。不要过于焦虑，保持平和的心态很重要。同时，也要勇于尝试新的方法，有时候突破常规反而能带来意想不到的收获。记住，塔罗牌只是一个指引，真正的选择权永远在你手中。`,
  });
  
  return readings;
}

// 添加流式消息
async function addStreamingMessage(readings) {
  for (const reading of readings) {
    const fullText = `**${reading.title}**\n\n${reading.content}`;
    
    // 模拟流式输出效果
    await typewriterEffect(fullText);
    
    // 每段解读之间暂停
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 解读完成，可以继续提问
  addMessage('ai', '以上就是我为你的解读。如果你还有其他问题，欢迎继续咨询。');
  
  chatState.isWaitingResponse = false;
}

// 打字机效果
async function typewriterEffect(text) {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-item ai-message';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <div class="avatar-circle">
        <span style="font-size: 20px;">🔮</span>
      </div>
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <p class="typewriter-text"></p>
      </div>
    </div>
  `;
  
  messagesList.appendChild(messageDiv);
  scrollToBottom();
  
  const textElement = messageDiv.querySelector('.typewriter-text');
  
  // 将Markdown格式的文本转换为HTML
  const formattedText = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // 简化版：直接显示（真实项目中可以逐字显示）
  textElement.innerHTML = formattedText;
  
  scrollToBottom();
  
  // 模拟打字延迟
  await new Promise(resolve => setTimeout(resolve, 800));
}

// 显示/隐藏输入区域
function hideInputArea() {
  const inputArea = document.getElementById('inputArea');
  if (inputArea) {
    inputArea.style.display = 'none';
  }
}

function showInputArea() {
  const inputArea = document.getElementById('inputArea');
  if (inputArea) {
    inputArea.style.display = 'block';
  }
}

// 显示/隐藏底部操作按钮
function showBottomActions() {
  let bottomActions = document.getElementById('bottomActions');
  
  if (!bottomActions) {
    // 创建底部操作按钮容器
    bottomActions = document.createElement('div');
    bottomActions.id = 'bottomActions';
    bottomActions.className = 'bottom-actions';
    
    // 创建"去抽牌"按钮
    const drawBtn = document.createElement('button');
    drawBtn.className = 'btn-action btn-draw';
    drawBtn.onclick = handleDrawCards;
    
    const badge = document.createElement('span');
    badge.className = 'cost-badge';
    badge.textContent = '💎 消耗1道具';
    
    drawBtn.appendChild(badge);
    drawBtn.appendChild(document.createTextNode('去抽牌'));
    
    // 创建"重新输入"按钮
    const reinputBtn = document.createElement('button');
    reinputBtn.className = 'btn-action btn-reinput';
    reinputBtn.textContent = '重新输入';
    reinputBtn.onclick = handleReinput;
    
    bottomActions.appendChild(drawBtn);
    bottomActions.appendChild(reinputBtn);
    
    document.querySelector('.container').appendChild(bottomActions);
  }
  
  bottomActions.style.display = 'flex';
}

function hideBottomActions() {
  const bottomActions = document.getElementById('bottomActions');
  if (bottomActions) {
    bottomActions.style.display = 'none';
  }
}

// 添加/移除打字中指示器
function addTypingIndicator() {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  const existingIndicator = document.getElementById('typingIndicator');
  if (existingIndicator) return;
  
  const indicatorDiv = document.createElement('div');
  indicatorDiv.id = 'typingIndicator';
  indicatorDiv.className = 'message-item ai-message';
  
  indicatorDiv.innerHTML = `
    <div class="message-avatar">
      <div class="avatar-circle">
        <span style="font-size: 20px;">🔮</span>
      </div>
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    </div>
  `;
  
  messagesList.appendChild(indicatorDiv);
  scrollToBottom();
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

// 显示/隐藏抽牌动画
function showDrawingAnimation() {
  const modal = document.getElementById('drawingModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function hideDrawingAnimation() {
  const modal = document.getElementById('drawingModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 滚动到底部
function scrollToBottom() {
  const container = document.getElementById('chatContainer');
  if (container) {
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }
}

// 转义HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  initChat();
  
  // 绑定发送按钮
  const sendButton = document.getElementById('sendButton');
  const chatInput = document.getElementById('chatInput');
  
  if (sendButton) {
    sendButton.addEventListener('click', () => {
      const text = chatInput.value.trim();
      if (text) {
        sendUserMessage(text);
      }
    });
  }
  
  // 输入框自动调整高度
  if (chatInput) {
    chatInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
    
    // 回车发送（Shift+回车换行）
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = this.value.trim();
        if (text) {
          sendUserMessage(text);
        }
      }
    });
  }
  
  // 点击模态框背景关闭
  const spreadSelector = document.getElementById('spreadSelector');
  if (spreadSelector) {
    spreadSelector.addEventListener('click', function(e) {
      if (e.target === this) {
        closeSpreadSelector();
      }
    });
  }
});

