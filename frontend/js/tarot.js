// 塔罗页逻辑

let spreadsData = [];

// 渲染牌阵列表
function renderSpreadList(spreads) {
  const listContainer = document.getElementById('spreadList');
  
  if (!listContainer) return;
  
  listContainer.innerHTML = spreads.map(spread => `
    <div class="spread-card" onclick="navigateTo('spread.html', { id: '${spread.id}' })">
      <div class="spread-image">
        <div class="spread-placeholder">牌阵图片<br>${spread.cardCount}张牌</div>
      </div>
      <div class="spread-content">
        <div class="spread-header">
          <h4 class="spread-title">${spread.name}</h4>
          <span class="spread-count">${formatNumber(spread.usageCount)} 人测过</span>
        </div>
        <p class="spread-description">${spread.description}</p>
        <div class="spread-tags">
          ${spread.tags.map(tag => `<span class="spread-tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// 渲染骨架屏
function renderSkeleton() {
  const listContainer = document.getElementById('spreadList');
  if (!listContainer) return;
  
  const skeletonHTML = Array(3).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line long"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');
  
  listContainer.innerHTML = skeletonHTML;
}

// 加载牌阵数据
async function loadSpreads() {
  try {
    renderSkeleton();
    
    // 添加时间戳避免缓存
    const data = await loadJSON(`../data/spreads.json?t=${Date.now()}`);
    spreadsData = data;
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    renderSpreadList(spreadsData);
    
    console.log('牌阵数据加载成功:', spreadsData.length, '个牌阵');
  } catch (error) {
    console.error('加载牌阵数据失败:', error);
    showToast('加载失败，请稍后重试');
    
    // 显示错误提示
    const listContainer = document.getElementById('spreadList');
    if (listContainer) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <p>加载失败</p>
          <button class="btn btn-primary mt-md" onclick="loadSpreads()">重试</button>
        </div>
      `;
    }
  }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  setActiveTab('ai');
  loadSpreads();
  
  // 问询按钮点击埋点
  const consultBtn = document.querySelector('.btn-consult');
  if (consultBtn) {
    consultBtn.addEventListener('click', () => {
      console.log('埋点: 点击AI塔罗师问询按钮');
    });
  }
});

