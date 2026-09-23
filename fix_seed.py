import json
import re

with open('backend/seed_db.py', 'r') as f:
    content = f.read()

# We need to replace keys in the Python dictionaries in the PROBLEMS array.
# concept -> concept_tag
content = content.replace('"concept":', '"concept_tag":')
# difficulty -> difficulty_level
content = content.replace('"difficulty":', '"difficulty_level":')

# hints -> hint_text (and join array if it's an array).
# But doing this safely with regex might be hard. We can just evaluate the array and rewrite it!
# It's a python file. We can literally import it, rewrite the array, and dump it.

import ast

class RewriteKeys(ast.NodeTransformer):
    pass
# It's easier to just do regex or string replacements for `"hints": ["..."]` -> `"hint_text": "..."`
# Since each line is nicely formatted:
content = re.sub(r'"hints": \["([^"]*)"\]', r'"hint_text": "\1"', content)

with open('backend/seed_db.py', 'w') as f:
    f.write(content)
print("Done fixing seed_db.py")
