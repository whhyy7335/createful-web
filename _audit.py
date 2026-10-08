"""扫描：令牌定义是否齐全、还有哪些硬编码颜色、是否有 var() 引用了未定义的令牌。"""
import re, io, sys, glob
sys.stdout.reconfigure(encoding='utf-8')

css = {f: io.open(f, encoding='utf-8').read() for f in sorted(glob.glob('css/*.css'))}

# 1) 收集所有已定义令牌
defined = set()
for src in css.values():
    defined |= set(re.findall(r'^\s*(--[a-z0-9-]+)\s*:', src, re.M))

# 2) 收集所有被引用的令牌
used = set()
for f, src in css.items():
    used |= set(re.findall(r'var\((--[a-z0-9-]+)', src))

missing = sorted(used - defined)
print('== 引用了但未定义的令牌 ==')
print(missing or '  （无）')

# 3) --daylight 相关
print('\n== --daylight 定义与出现次数 ==')
for f, src in css.items():
    n = len(re.findall(r'--daylight', src))
    d = re.findall(r'^\s*--daylight\s*:[^;]+;', src, re.M)
    if n:
        print(f'  {f}: 出现 {n} 次，定义 {d or "无"}')

# 4) 剩余硬编码十六进制色（排除 :root 里的令牌定义本身）
print('\n== 剩余硬编码颜色（非令牌定义行）==')
for f, src in css.items():
    for i, line in enumerate(src.splitlines(), 1):
        s = line.strip()
        if not s or s.startswith('/*') or s.startswith('*'):
            continue
        if re.match(r'^--[a-z0-9-]+\s*:', s):
            continue
        hexes = re.findall(r'#[0-9a-fA-F]{3,8}\b', s)
        if hexes:
            print(f'  {f}:{i}  {s[:100]}')

print('\n== 剩余 rgba()/rgb() 字面量（非令牌定义行）==')
for f, src in css.items():
    for i, line in enumerate(src.splitlines(), 1):
        s = line.strip()
        if not s or s.startswith('/*') or s.startswith('*'):
            continue
        if re.match(r'^--[a-z0-9-]+\s*:', s):
            continue
        if re.search(r'\brgba?\(', s):
            print(f'  {f}:{i}  {s[:100]}')
