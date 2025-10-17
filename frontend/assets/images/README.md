# 图片资源说明

本目录用于存放应用所需的图片资源。

## 目录结构

```
images/
├── spreads/          # 牌阵示意图
│   ├── single.png
│   ├── three.png
│   ├── financial.png
│   └── love.png
├── cards/            # 塔罗牌图片
│   ├── 00_fool.jpg
│   ├── 01_magician.jpg
│   └── ...
└── icons/            # 应用图标
    ├── tarot.svg
    ├── ai.svg
    └── ...
```

## 图片规格要求

### 牌阵示意图（spreads/）
- 格式：PNG
- 尺寸：750x500px
- 大小：< 200KB
- 内容：牌阵的布局示意图

### 塔罗牌图片（cards/）
- 格式：JPG
- 尺寸：400x600px
- 大小：< 150KB
- 内容：塔罗牌的完整图案

### 应用图标（icons/）
- 格式：SVG（优先）或PNG
- 尺寸：根据使用场景
- 内容：功能图标、装饰元素

## 当前状态

⚠️ **注意**：当前应用使用占位符（placeholder）显示图片区域。

在正式使用前，请：
1. 准备符合规格的图片
2. 按照目录结构放置
3. 更新代码中的图片路径

## 图片来源建议

### 免费资源：
1. **Unsplash** - https://unsplash.com/
   - 高质量免费图片
   - 可商用

2. **Pexels** - https://www.pexels.com/
   - 免费照片和视频
   - 无版权问题

3. **Pixabay** - https://pixabay.com/
   - 大量免费素材
   - 支持中文搜索

### 塔罗牌图片：
1. **经典韦特塔罗**
   - 版权已过期，可免费使用
   - 搜索 "Rider-Waite Tarot"

2. **自制插画**
   - 使用Midjourney或DALL-E生成
   - 注意遵守使用条款

## 图片优化

上传图片前建议优化：

1. **压缩工具**
   - TinyPNG - https://tinypng.com/
   - ImageOptim (Mac)
   - Squoosh - https://squoosh.app/

2. **格式转换**
   - PNG → WebP（更小）
   - JPG → WebP（更小）

3. **响应式图片**
   - 提供多种尺寸
   - 使用srcset属性
   - 懒加载

## 使用示例

### HTML中引用：
```html
<img src="/frontend/assets/images/spreads/three.png" alt="三牌阵">
```

### CSS中引用：
```css
.spread-banner {
  background-image: url('/frontend/assets/images/spreads/three.png');
}
```

### JavaScript中引用：
```javascript
const imagePath = '/frontend/assets/images/spreads/three.png';
```

## 版权说明

请确保使用的图片符合以下条件之一：
- ✅ 公有领域（Public Domain）
- ✅ CC0许可
- ✅ 已购买商用授权
- ✅ 自己创作的原创作品

⚠️ 避免使用：
- ❌ 未经授权的商业图片
- ❌ 有水印的图片
- ❌ 版权不明的素材

