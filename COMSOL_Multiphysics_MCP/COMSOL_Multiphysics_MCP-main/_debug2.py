# -*- coding: utf-8 -*-
import sys
import io
import inspect
import mph


sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")


sig = inspect.signature(mph.Client.__init__)
print("Client.__init__:", sig)
