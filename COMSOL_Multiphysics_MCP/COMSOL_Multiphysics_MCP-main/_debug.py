# -*- coding: utf-8 -*-
import sys
import io
import mph


sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")


client = mph.Client(version="6.1")
model = client.create("test")
jm = model.java
comp_list = jm.component()
print("create signatures:", dir(comp_list))
