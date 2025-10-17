// 公共工具函数

// API 基础路径
const API_BASE_URL = '/api';

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null}
 */
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * 导航到指定页面
 * @param {string} url - 目标URL
 * @param {Object} params - URL参数
 */
function navigateTo(url, params = {}) {
  // 如果是相对路径且不包含frontend/，自动添加
  if (!url.startsWith('http') && !url.startsWith('/') && !url.includes('frontend/')) {
    url = '/frontend/' + url;
  }
  
  const urlObj = new URL(url, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });
  window.location.href = urlObj.toString();
}

/**
 * 返回上一页
 */
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '/frontend/index.html';
  }
}

/**
 * 显示Toast提示
 * @param {string} message - 提示信息
 * @param {number} duration - 显示时长(ms)
 */
function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: fadeIn 0.3s;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

/**
 * 显示加载中
 * @returns {Function} 隐藏加载的函数
 */
function showLoading() {
  const loading = document.createElement('div');
  loading.id = 'global-loading';
  loading.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
  `;
  loading.innerHTML = '<div class="loading" style="width: 40px; height: 40px; border-width: 3px;"></div>';
  
  document.body.appendChild(loading);
  
  return function hideLoading() {
    const el = document.getElementById('global-loading');
    if (el) {
      document.body.removeChild(el);
    }
  };
}

/**
 * 格式化数字（添加千分位）
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 节流函数
 * @param {Function} func
 * @param {number} delay
 */
function throttle(func, delay = 300) {
  let timer = null;
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        func.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}

/**
 * 防抖函数
 * @param {Function} func
 * @param {number} delay
 */
function debounce(func, delay = 300) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 加载JSON数据
 * @param {string} path - JSON文件路径
 * @returns {Promise<Object>}
 */
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('加载JSON数据失败:', error);
    throw error;
  }
}

/**
 * 调用后端API
 * @param {string} endpoint - API端点
 * @param {Object} data - 请求数据
 * @returns {Promise<Object>}
 */
async function callAPI(endpoint, data = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API调用错误:', error);
    throw error;
  }
}

/**
 * 本地存储操作
 */
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('存储失败:', e);
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.error('读取失败:', e);
      return defaultValue;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('删除失败:', e);
    }
  },
  
  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('清空失败:', e);
    }
  }
};

/**
 * 设置当前激活的Tab
 * @param {string} tabName
 */
function setActiveTab(tabName) {
  const tabs = document.querySelectorAll('.tabbar-item');
  tabs.forEach(tab => {
    const name = tab.dataset.tab;
    if (name === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

/**
 * 初始化返回按钮
 */
function initBackButton() {
  const backBtn = document.querySelector('.navbar-back');
  if (backBtn) {
    backBtn.addEventListener('click', goBack);
  }
}

// 全局初始化
document.addEventListener('DOMContentLoaded', () => {
  initBackButton();
  
  // 添加CSS动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -40%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});

