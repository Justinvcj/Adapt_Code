import os
import glob
import re

for filepath in glob.glob('backend/app/routers/*.py'):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to find functions that use supabase. but don't have supabase = get_supabase()
    # Let's just insert it at the top of every endpoint function that uses supabase
    
    lines = content.split('\n')
    new_lines = []
    in_function = False
    has_supabase_init = False
    func_start_idx = 0
    
    for i, line in enumerate(lines):
        if line.strip().startswith('async def ') or line.strip().startswith('def '):
            in_function = True
            has_supabase_init = False
            func_start_idx = i
            new_lines.append(line)
            continue
            
        if in_function:
            if 'supabase = get_supabase()' in line:
                has_supabase_init = True
            elif 'supabase.' in line and not has_supabase_init:
                indent = len(line) - len(line.lstrip())
                new_lines.append(' ' * indent + 'supabase = get_supabase()')
                has_supabase_init = True
                
        new_lines.append(line)
        
    with open(filepath, 'w') as f:
        f.write('\n'.join(new_lines))
