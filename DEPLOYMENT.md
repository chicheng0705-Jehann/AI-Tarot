# 部署指南

本文档介绍如何将AI塔罗占卜应用部署到Vercel平台。

## 前置准备

1. **注册Vercel账号**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录

2. **获取Gemini API Key**
   - 访问 [Google AI Studio](https://ai.google.dev/)
   - 创建API Key
   - 保存好API Key（后续需要配置）

3. **安装Vercel CLI（可选）**
   ```bash
   npm install -g vercel
   ```

## 部署步骤

### 方法一：通过Vercel网页部署（推荐）

1. **上传代码到GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **在Vercel导入项目**
   - 登录 [Vercel控制台](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 点击 "Import"

3. **配置环境变量**
   - 在项目设置中找到 "Environment Variables"
   - 添加以下变量：
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - 点击 "Save"

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成（通常1-2分钟）
   - 获得部署URL

### 方法二：通过Vercel CLI部署

1. **登录Vercel**
   ```bash
   vercel login
   ```

2. **部署项目**
   ```bash
   # 首次部署
   vercel
   
   # 按照提示操作：
   # - Set up and deploy? Yes
   # - Which scope? 选择你的账号
   # - Link to existing project? No
   # - What's your project's name? ai-tarot
   # - In which directory is your code located? ./
   ```

3. **设置环境变量**
   ```bash
   vercel env add GEMINI_API_KEY
   # 输入你的API Key
   # 选择 Production, Preview, Development
   ```

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

## 验证部署

1. **访问应用**
   - 打开Vercel提供的URL
   - 应该能看到首页

2. **测试功能**
   - 点击"塔罗"入口 → 进入塔罗页
   - 选择一个牌阵 → 进入牌阵详情页
   - 点击"立即使用" → 进入对话框
   - 输入问题 → 查看AI回复

3. **检查API**
   - 打开浏览器开发者工具
   - 查看Network标签
   - 确认 `/api/chat` 请求成功

## 常见问题

### 1. API调用失败

**现象**：对话框显示模拟数据，而非真实AI回复

**解决**：
- 检查环境变量是否正确设置
- 验证Gemini API Key是否有效
- 查看Vercel的Functions日志

### 2. 页面样式错误

**现象**：页面布局混乱

**解决**：
- 清除浏览器缓存
- 检查CSS文件路径是否正确
- 确认所有静态文件都已上传

### 3. 路由404错误

**现象**：刷新页面后出现404

**解决**：
- 检查 `vercel.json` 配置
- 确认rewrites规则正确
- 使用Hash路由或单页应用配置

### 4. Python依赖安装失败

**现象**：部署时显示依赖错误

**解决**：
- 检查 `requirements.txt` 格式
- 确认包版本兼容性
- 使用Vercel支持的Python版本（3.9+）

## 性能优化

1. **启用CDN加速**
   - Vercel自动启用Edge Network
   - 静态资源自动缓存

2. **优化图片**
   - 使用WebP格式
   - 压缩图片大小
   - 考虑使用Vercel Image Optimization

3. **减少API调用**
   - 实现客户端缓存
   - 使用防抖和节流
   - 考虑Server-Side Rendering

## 监控与日志

1. **查看部署日志**
   ```bash
   vercel logs
   ```

2. **实时日志**
   ```bash
   vercel logs --follow
   ```

3. **Vercel控制台**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 查看Analytics
   - 监控函数执行时间和错误

## 更新部署

### 自动部署

- GitHub仓库main分支有新提交时自动部署
- 可在Vercel设置中配置部署分支

### 手动部署

```bash
# 推送代码
git add .
git commit -m "Update features"
git push

# 或使用CLI
vercel --prod
```

## 自定义域名

1. **添加域名**
   - 在Vercel项目设置中选择 "Domains"
   - 添加你的域名
   - 按照提示配置DNS

2. **配置DNS**
   - A记录指向: `76.76.21.21`
   - CNAME记录指向: `cname.vercel-dns.com`

3. **HTTPS**
   - Vercel自动配置SSL证书
   - 支持自动续期

## 成本估算

**Vercel免费额度：**
- Bandwidth: 100GB/月
- Function执行时间: 100小时/月
- Function调用次数: 100万次/月

**Gemini API免费额度：**
- 每分钟15次请求
- 每天1,500次请求
- Flash模型免费

**预计成本：**
- 小规模演示（<1000用户/月）：**免费**
- 中等规模（1000-10000用户/月）：**$0-50/月**

## 安全建议

1. **保护API Key**
   - 不要在前端代码中硬编码API Key
   - 使用环境变量
   - 定期轮换密钥

2. **限流保护**
   - 实现请求频率限制
   - 添加用户认证（如需要）
   - 监控异常流量

3. **输入验证**
   - 验证用户输入长度
   - 过滤敏感内容
   - 防止注入攻击

## 技术支持

- Vercel文档: https://vercel.com/docs
- Gemini API文档: https://ai.google.dev/docs
- 项目Issues: YOUR_GITHUB_REPO/issues

## License

MIT License

