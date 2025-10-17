"""
AI塔罗占卜对话API
支持牌阵匹配和解读生成
"""

import os
import json
from http.server import BaseHTTPRequestHandler
from typing import Dict, List, Any

# 尝试导入依赖，如果失败则使用降级方案
try:
    import google.generativeai as genai
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.prompts import ChatPromptTemplate
    from langchain.schema import HumanMessage, SystemMessage
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: Gemini dependencies not available, using mock responses")


class handler(BaseHTTPRequestHandler):
    """Vercel Serverless函数处理器"""
    
    def do_POST(self):
        """处理POST请求"""
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}
            
            # 处理CORS
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # 生成解读
            response = self.generate_reading(data)
            
            # 返回结果
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, str(e))
    
    def do_OPTIONS(self):
        """处理OPTIONS请求（CORS预检）"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def generate_reading(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """生成塔罗解读"""
        question = data.get('question', '')
        spread = data.get('spread', {})
        cards = data.get('cards', [])
        
        if not question or not spread or not cards:
            return {
                'success': False,
                'error': '参数不完整',
                'reading': self.generate_mock_reading(cards, spread)
            }
        
        # 如果Gemini可用，调用真实API
        if GEMINI_AVAILABLE:
            try:
                reading = self.generate_gemini_reading(question, spread, cards)
                return {
                    'success': True,
                    'reading': reading,
                    'model': 'gemini-2.0-flash-exp'
                }
            except Exception as e:
                print(f"Gemini API调用失败: {e}")
                # 降级到模拟数据
                return {
                    'success': False,
                    'error': str(e),
                    'reading': self.generate_mock_reading(cards, spread)
                }
        else:
            # 使用模拟数据
            return {
                'success': True,
                'reading': self.generate_mock_reading(cards, spread),
                'model': 'mock'
            }
    
    def generate_gemini_reading(
        self, 
        question: str, 
        spread: Dict[str, Any], 
        cards: List[Dict[str, Any]]
    ) -> List[Dict[str, str]]:
        """使用Gemini生成解读"""
        
        # 获取API Key
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY环境变量未设置")
        
        # 配置Gemini
        genai.configure(api_key=api_key)
        
        # 构建提示词
        cards_info = "\n".join([
            f"{i+1}. {card['positionName']}: {card['cardName']} ({card['orientation']})"
            for i, card in enumerate(cards)
        ])
        
        prompt = f"""你是一位专业的塔罗占卜师，请为用户提供详细且富有同理心的塔罗解读。

**用户问题：**
{question}

**使用牌阵：**
{spread['name']}

**抽到的牌：**
{cards_info}

**请按以下格式提供解读：**

1. 对每张牌进行单独解读（结合牌的位置、正逆位和象征意义）
2. 给出整体牌面的综合分析
3. 提供实用的建议和指引

**解读要求：**
- 语气温和、富有同理心
- 即使抽到负面的牌，也要积极引导
- 避免绝对化的表述
- 提供建设性的建议
- 每段解读控制在100-150字

请严格按照JSON格式返回，格式如下：
[
  {{"type": "card", "title": "位置名称 · 牌名", "content": "解读内容"}},
  {{"type": "summary", "title": "综合解读", "content": "综合分析"}},
  {{"type": "advice", "title": "给你的建议", "content": "建议内容"}}
]
"""
        
        # 调用Gemini API
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        response = model.generate_content(
            prompt,
            generation_config={
                'temperature': 0.8,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 2048,
            }
        )
        
        # 解析响应
        try:
            # 尝试解析JSON
            text = response.text.strip()
            
            # 移除可能的markdown代码块标记
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            
            reading = json.loads(text.strip())
            return reading
        except json.JSONDecodeError:
            # 如果无法解析JSON，使用文本内容生成默认格式
            return [{
                'type': 'summary',
                'title': '塔罗解读',
                'content': response.text
            }]
    
    def generate_mock_reading(
        self, 
        cards: List[Dict[str, Any]], 
        spread: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """生成模拟解读（用于演示或API不可用时）"""
        
        readings = []
        
        # 每张牌的解读
        for card in cards:
            title = f"{card['positionName']} · {card['cardName']} ({card['orientation']})"
            
            if card['orientation'] == '正位':
                content = f"{card['cardName']}在{card['positionName']}出现，{card['orientation']}代表着积极的能量和新的开始。这张牌提示你要保持乐观的心态，相信自己的能力。当前的状况虽然可能有挑战，但正是这些挑战让你成长。记住，每一步都是通向成功的必经之路。"
            else:
                content = f"{card['cardName']}在{card['positionName']}出现，{card['orientation']}提醒你需要注意某些阻碍或内心的犹豫。这并不意味着坏事，而是提示你要更加谨慎和深思。有时候放慢脚步，重新审视自己的选择，反而能找到更好的方向。"
            
            readings.append({
                'type': 'card',
                'title': title,
                'content': content
            })
        
        # 综合解读
        readings.append({
            'type': 'summary',
            'title': '综合解读',
            'content': f'从整体牌面来看，{spread["name"]}为你揭示了一个完整的发展脉络。这些牌共同描绘出你当前的处境和未来的可能性。虽然过程可能充满变数，但只要保持初心，勇敢前行，最终一定能够达成所愿。记住，塔罗牌只是一面镜子，真正的力量在于你自己。'
        })
        
        # 建议
        readings.append({
            'type': 'advice',
            'title': '给你的建议',
            'content': '建议你在面对当前的问题时，要相信自己的直觉和判断。不要让恐惧和焦虑主导你的决定，保持内心的平静很重要。同时，也要勇于尝试新的可能性，有时候突破常规反而能带来意想不到的收获。最重要的是，记住你拥有改变的力量，塔罗牌只是指引，选择权永远在你手中。'
        })
        
        return readings


# 用于本地测试
if __name__ == '__main__':
    # 模拟请求数据
    test_data = {
        'question': '我最近的财运如何？',
        'spread': {
            'id': 'three_card',
            'name': '三牌阵',
            'positions': [
                {'position': 1, 'name': '过去'},
                {'position': 2, 'name': '现在'},
                {'position': 3, 'name': '未来'}
            ]
        },
        'cards': [
            {'position': 1, 'positionName': '过去', 'cardName': '愚者', 'orientation': '正位'},
            {'position': 2, 'positionName': '现在', 'cardName': '魔术师', 'orientation': '正位'},
            {'position': 3, 'positionName': '未来', 'cardName': '女祭司', 'orientation': '逆位'}
        ]
    }
    
    # 创建处理器实例
    h = handler(None, None, None)
    result = h.generate_reading(test_data)
    
    print(json.dumps(result, ensure_ascii=False, indent=2))

