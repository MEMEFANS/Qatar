def calculate_mint_data():
    # 常量定义
    INITIAL_PRICE = 0.000158  # 初始价格
    BNB_MILESTONE = 10  # 每10 BNB触发一次价格上涨
    TOTAL_SUPPLY = 1000000  # 总代币量
    
    # 初始化状态
    total_bnb_received = 0
    total_tokens_minted = 0
    current_price = INITIAL_PRICE
    
    print(f"初始价格: {current_price} BNB")
    
    # 记录价格变化
    price_changes = []
    
    # 模拟铸造过程
    while total_tokens_minted < TOTAL_SUPPLY:
        # 假设一次铸造1个代币
        bnb_needed = current_price
        
        # 检查是否超过总量
        if total_tokens_minted + 1 > TOTAL_SUPPLY:
            break
        
        # 更新状态
        total_bnb_received += bnb_needed
        total_tokens_minted += 1
        
        # 计算新的里程碑和价格
        milestone_count = int(total_bnb_received / BNB_MILESTONE)
        new_price = INITIAL_PRICE + (INITIAL_PRICE * 0.2 * milestone_count)
        
        # 如果价格变化，记录下来
        if new_price != current_price:
            price_changes.append({
                "milestone": milestone_count,
                "old_price": current_price,
                "new_price": new_price,
                "total_bnb": total_bnb_received,
                "total_minted": total_tokens_minted
            })
            current_price = new_price
        
        # 每铸造10万代币输出一次状态
        if total_tokens_minted % 100000 == 0 and total_tokens_minted > 0:
            print(f"已铸造 {total_tokens_minted} 代币，消耗 {total_bnb_received:.2f} BNB，当前价格 {current_price:.6f} BNB")
    
    # 输出最终结果
    print("\n最终统计:")
    print(f"总铸造: {total_tokens_minted} 代币")
    print(f"总消耗: {total_bnb_received:.2f} BNB")
    print(f"最终价格: {current_price:.6f} BNB")
    print(f"价格上涨次数: {len(price_changes)} 次")
    print(f"价格上涨倍数: {current_price/INITIAL_PRICE:.2f} 倍")
    
    # 输出价格变化历史
    print("\n价格变化历史:")
    for i, change in enumerate(price_changes):
        print(f"第{i+1}次上涨 (里程碑 {change['milestone']}): {change['old_price']:.6f} -> {change['new_price']:.6f} BNB (总BNB: {change['total_bnb']:.2f}, 已铸造: {change['total_minted']})")

calculate_mint_data()
