#!/usr/bin/env python3
"""
每日股票精选生成 + 推送脚本
每天早上9点自动运行
"""
import akshare as ak
import json
from datetime import datetime

def generate_daily_picks():
    """生成每日精选"""
    print(f"📊 开始生成 {datetime.now().strftime('%Y-%m-%d')} 精选...")
    
    try:
        # 获取全市场数据
        df = ak.stock_zh_a_spot_em()
        
        # 转换数据类型
        df['涨跌幅'] = pd.to_numeric(df['涨跌幅'], errors='coerce')
        df['总市值'] = pd.to_numeric(df['总市值'], errors='coerce')
        df['换手率'] = pd.to_numeric(df['换手率'], errors='coerce')
        
        # 筛选条件: 强者恒强
        df = df[df['名称'].notna()]
        df = df[~df['名称'].str.contains('ST', na=False)]  # 去掉ST
        df = df[df['总市值'] > 50 * 1e8]  # 市值>50亿
        df = df[df['总市值'] < 500 * 1e8]  # 市值<500亿
        df = df[df['涨跌幅'] > 3]  # 涨幅>3%
        df = df[df['换手率'] > 3]  # 换手率>3%
        
        # 按涨幅排序
        df = df.sort_values('涨跌幅', ascending=False)
        
        # 取前3只
        picks = []
        for i, (_, row) in enumerate(df.head(3).iterrows()):
            picks.append({
                'rank': i + 1,
                'code': str(row['代码']),
                'name': str(row['名称']),
                'change': float(row['涨跌幅']),
                'turnover': float(row['换手率']),
                'market': float(row['总市值']) / 1e8
            })
        
        result = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'picks': picks,
            'strategy': '强者恒强: 涨幅>3% + 换手率>3% + 市值50-500亿'
        }
        
        # 保存
        with open('/Users/gaodelong/.openclaw/workspace/stock-project/daily-picks.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        return result
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

import pandas as pd

if __name__ == '__main__':
    result = generate_daily_picks()
    if result:
        print(f"\n🏆 今日精选:")
        for p in result['picks']:
            print(f"  {p['rank']}. {p['code']} {p['name']}: +{p['change']:.2f}%")
        
        # 保存消息
        msg = f"""🎯 {result['date']} 股票精选

📈 策略: {result['strategy']}

🏆 今日推荐:
"""
        for p in result['picks']:
            msg += f"""
{p['rank']}. {p['code']} {p['name']}
   涨幅: +{p['change']:.2f}%
   换手: {p['turnover']:.1f}%
   市值: {p['market']:.0f}亿"""

        msg += """

⚠️ 风险提示: 涨幅已高,注意风险

#红熵AI #股票精选"""

        with open('/Users/gaodelong/.openclaw/workspace/stock-project/daily-message.txt', 'w', encoding='utf-8') as f:
            f.write(msg)
        
        print(f"\n✅ 已保存到 daily-message.txt")
    else:
        print("❌ 生成失败")
