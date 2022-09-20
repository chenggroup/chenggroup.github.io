import re
from glob import glob

def sub_from_include(filename):
    filedata = ""
    with open(filename) as f:
        lines = f.readlines()
    for line in lines:
        if re.match("\{%\s+include\s+alert.html", line):
            new_template = """\
!!! {} {}
    {}
"""
            _type, _title, _content = None, None, None
            ss = re.split(r"\.html\s+|=\"|\"\s+", line)
            for i, s in enumerate(ss):
                if s == "type":
                    _type = ss[i+1]
                if s == "title":
                    _title = '"' + ss[i+1] + '"'
                if s =="content":
                    _content = ss[i+1]
            filedata += new_template.format(_type, _title, _content)
        else:
            filedata += line
    with open(filename, 'w') as f:
        f.write(filedata)

tasks = glob("docs/wiki/*/*/*.md")
for t in tasks:
    sub_from_include(t)
