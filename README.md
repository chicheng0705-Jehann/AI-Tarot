# AI 塔罗占卜解读 Demo

这是一个用于面试展示的 AI 塔罗占卜应用，展示完整的产品交互流程和大模型对话能力。

## 项目结构

```
AI Tarot/
├── api/                      # Vercel Serverless 后端
│   └── chat.py              # AI 对话 API
├── frontend/                # 前端页面
│   ├── index.html          # 首页
│   ├── ai.html             # AI解读页
│   ├── tarot.html          # 塔罗页（牌阵列表）
│   ├── spread.html         # 牌阵详情页
│   ├── chat.html           # AI对话框页面
│   ├── css/                # 样式文件
│   │   ├── common.css      # 公共样式
│   │   ├── index.css       # 首页样式
│   │   ├── tarot.css       # 塔罗页样式
│   │   ├── spread.css      # 牌阵详情样式
│   │   └── chat.css        # 对话框样式
│   ├── js/                 # JavaScript文件
│   │   ├── common.js       # 公共函数
│   │   ├── index.js        # 首页逻辑
│   │   ├── tarot.js        # 塔罗页逻辑
│   │   ├── spread.js       # 牌阵详情逻辑
│   │   └── chat.js         # 对话框逻辑
│   └── assets/             # 静态资源
│       └── images/         # 图片
├── data/                    # 模拟数据
│   ├── spreads.json        # 牌阵数据
│   ├── cards.json          # 塔罗牌数据
│   └── quick-questions.json # 快捷问题
├── requirements.txt        # Python 依赖
├── vercel.json            # Vercel 配置
└── README.md              # 项目说明
```

## 技术栈

- **前端**: HTML5 + CSS3 + 原生 JavaScript
- **后端**: Python + LangChain
- **部署**: Vercel Serverless

## 页面流程

1. **首页** → 金刚位"塔罗" → **塔罗页**
2. **首页** → 底部Tab"AI" → **AI解读页**
3. **塔罗页** → 点击牌阵卡片 → **牌阵详情页**
4. **牌阵详情页** → "立即使用"/"热门问题" → **AI对话框**
5. **AI解读页** → 问询按钮 → **AI对话框**

## 快速开始

### 本地开发

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 配置环境变量（创建 `.env` 文件）：
```
GEMINI_API_KEY=your_api_key_here
```

3. 启动本地服务器：
```bash
python -m http.server 8000
```

4. 访问：http://localhost:8000/frontend/index.html

### Vercel 部署

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录并部署：
```bash
vercel
```

3. 设置环境变量（在 Vercel 控制台）

## 功能特性

- ✅ 完整的页面跳转流程
- ✅ AI 自动匹配牌阵
- ✅ 流式对话体验
- ✅ 牌阵切换功能
- ✅ 快捷提问支持
- ✅ 多轮对话能力

## 开发说明

本项目仅用于面试展示，演示时长约 15 分钟，重点展示：
- 产品交互流程的完整性
- 大模型调用的真实性
- AI 产品 Demo 的实现能力

## License

MIT

