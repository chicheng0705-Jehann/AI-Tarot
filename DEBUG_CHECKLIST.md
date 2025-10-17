# 调试检查清单

## 问题检查

### 1. 快捷问题自动提交问题
**预期：** 点击快捷问题只填充到输入框，不自动提交
**检查点：**
- ✅ `fillQuestion`函数不调用`sendUserMessage`
- ✅ URL参数`mode`为`'prefill'`时才调用`fillQuestion`
- ✅ 快捷问题按钮使用DOM事件而非innerHTML onclick

### 2. 欢迎消息和头像不显示
**预期：** 显示大头像和欢迎气泡
**检查点：**
- ✅ `spreadsData`在渲染前已加载完成
- ✅ `renderWelcomeMessage`在数据加载后调用
- ✅ `messagesList`元素存在
- ✅ CSS样式已加载

### 3. 牌阵匹配按钮布局未改变
**预期：** "换个牌阵"在气泡下方，"去抽牌"+"重新输入"在底部
**检查点：**
- ✅ `addSpreadMatchMessage`创建正确的DOM结构
- ✅ `showBottomActions`创建底部按钮容器
- ✅ `hideInputArea`隐藏输入框
- ✅ CSS样式`.bottom-actions`正确

## 调试步骤

### 步骤1：检查控制台错误
打开浏览器控制台（F12），查看是否有JavaScript错误

### 步骤2：检查网络请求
在Network标签中确认：
- ✅ `spreads.json`加载成功
- ✅ `quick-questions.json`加载成功
- ✅ CSS文件加载成功

### 步骤3：检查DOM结构
在Elements标签中确认：
- ✅ `#messagesList`存在
- ✅ `#inputArea`存在
- ✅ `#bottomActions`是否创建（匹配牌阵后）

### 步骤4：检查函数调用
在Console中手动测试：
```javascript
// 测试1：检查数据是否加载
console.log(spreadsData);
console.log(quickQuestionsData);

// 测试2：手动调用渲染函数
renderWelcomeMessage();
renderQuickQuestions();

// 测试3：测试fillQuestion
fillQuestion('测试问题');

// 测试4：检查输入框
document.getElementById('chatInput').value;
```

## 修复记录

### 修复1：初始化顺序
- 问题：`renderWelcomeMessage`在数据加载前调用
- 解决：先加载数据，再渲染

### 修复2：事件绑定
- 问题：使用innerHTML中的onclick导致作用域问题
- 解决：改用DOM元素的onclick属性

### 修复3：按钮创建
- 问题：底部按钮HTML字符串中使用onclick
- 解决：创建DOM元素并绑定事件

## 浏览器刷新测试

### 测试前准备
1. 打开浏览器控制台
2. 清除缓存（Ctrl+Shift+Delete）
3. 强制刷新（Ctrl+Shift+R）

### 测试场景A：从"问询"进入
```
塔罗页 → 点击"问询" → chat.html?mode=normal
预期：
✅ 显示100px大头像（居中）
✅ 显示默认开场白
✅ 显示快捷问题气泡
✅ 点击快捷问题只填充不提交
```

### 测试场景B：从牌阵详情页"立即使用"
```
牌阵详情页 → 点击"立即使用" → chat.html?spreadId=xxx&mode=normal
预期：
✅ 显示100px大头像（居中）
✅ 显示牌阵介绍作为开场白
✅ 显示该牌阵的快捷问题
✅ 点击快捷问题只填充不提交
```

### 测试场景C：从牌阵详情页点击快捷问题
```
牌阵详情页 → 点击快捷问题 → chat.html?spreadId=xxx&question=xxx&mode=prefill
预期：
✅ 显示100px大头像（居中）
✅ 显示牌阵介绍作为开场白
✅ 显示该牌阵的快捷问题
✅ 问题已填充到输入框
✅ 未自动提交
```

### 测试场景D：匹配牌阵环节
```
输入问题"我的财运如何" → 发送
预期：
✅ AI回复匹配结果
✅ "换个牌阵"按钮在气泡下方
✅ "去抽牌"+"重新输入"在底部居中
✅ "去抽牌"右上角有"💎消耗1道具"徽章
✅ 输入框隐藏
```

### 测试场景E：重新输入
```
匹配牌阵后 → 点击"重新输入"
预期：
✅ 底部两个按钮消失
✅ 输入框显示
✅ 之前的问题已填充
✅ AI不发送新消息
```

## 常见问题排查

### Q1: 页面空白
- 检查控制台是否有JS错误
- 检查`messagesList`元素是否存在
- 检查数据文件是否加载成功

### Q2: 快捷问题点击无反应
- 检查`fillQuestion`函数是否定义
- 检查事件是否正确绑定
- 打开控制台查看是否有错误

### Q3: 按钮不显示
- 检查CSS文件是否加载
- 检查`display`属性是否被设置为`none`
- 检查元素是否被创建

### Q4: 输入框不隐藏
- 检查`hideInputArea`函数是否调用
- 检查`#inputArea`的display属性
- 检查CSS优先级

---

**创建时间：** 2025-10-08
**用途：** 帮助快速定位和解决对话框页面的问题

