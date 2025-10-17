// 首页逻辑

document.addEventListener('DOMContentLoaded', () => {
  // 设置当前激活的tab
  setActiveTab('home');
  
  // 顶部标签页切换
  const topTabs = document.querySelectorAll('.top-tabs .tab-item');
  topTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      topTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // 这里可以添加切换不同时间段运势的逻辑
      console.log('切换到:', this.textContent);
    });
  });
  
  // 金刚位点击埋点
  const tarotEntry = document.querySelector('[data-track="tarot_entry"]');
  if (tarotEntry) {
    tarotEntry.addEventListener('click', () => {
      console.log('埋点: 点击金刚位塔罗入口');
      // 实际项目中这里会调用埋点SDK
    });
  }
  
  // AI Tab点击埋点
  const aiTab = document.querySelector('[data-track="ai_tab_entry"]');
  if (aiTab) {
    aiTab.addEventListener('click', () => {
      console.log('埋点: 点击底部Tab AI入口');
      // 实际项目中这里会调用埋点SDK
    });
  }
  
  // 其他金刚位项目点击提示
  const kingKongItems = document.querySelectorAll('.king-kong-item:not([href])');
  kingKongItems.forEach(item => {
    item.addEventListener('click', () => {
      showToast('功能开发中，敬请期待');
    });
  });
  
  // 服务项点击提示
  const serviceItems = document.querySelectorAll('.service-item');
  serviceItems.forEach(item => {
    item.addEventListener('click', () => {
      showToast('功能开发中，敬请期待');
    });
  });
  
  // 咨询卡片点击提示
  const consultCards = document.querySelectorAll('.consult-card');
  consultCards.forEach(card => {
    card.addEventListener('click', () => {
      showToast('功能开发中，敬请期待');
    });
  });
});

