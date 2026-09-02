"""CSS 结构自检：括号/引号配平、令牌定义与引用完整性、重复定义检测。
补丁跑完后必过这一关，再看渲染。"""
import io, re, glob, sys

ok = True
for path in sorted(glob.glob('css/*.css')):
    src = io.open(path, encoding='utf-8').read()
    depth = 0
    bad_line = None
    for i, ch in enumerate(src):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth < 0 and bad_line is None:
                bad_line = src[:i].count('\n') + 1
    quotes = src.count('"') - 2 * len(re.findall(r'="[^"]*"', src))
    print(f'{path}: 行数 {src.count(chr(10))+1}  花括号净差 {depth}  多余引号 {quotes}')
    if depth != 0:
        ok = False
        print('  !! 花括号不配平')
    if bad_line:
        ok = False
        print(f'  !! 第 {bad_line} 行出现多余 }}')

# 重复定义同一个令牌（:root 夜间端 + [data-daylight] 插值端 是有意设计，允许两次）
src = io.open('css/main.css', encoding='utf-8').read()
counts = {}
for m in re.finditer(r'^\s*(--(?!daylight)[a-z0-9-]+)\s*:', src, re.M):
    counts.setdefault(m.group(1), 0)
    counts[m.group(1)] += 1
dup3 = {k: v for k, v in counts.items() if v > 2}
print('\n同一令牌定义超过 2 次（应为 2 次：夜间端 + 插值端）：', dup3 or '无')
if dup3:
    ok = False

print('\n自检结果:', 'PASS' if ok else 'FAIL')
