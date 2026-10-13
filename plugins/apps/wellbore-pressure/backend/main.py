# -*- coding: utf-8 -*-
"""Register the local-only wellbore calculator with the UGSci app lifecycle."""

from qwenpaw.pawapp import PawApp

app = PawApp(name="井筒压力计算", app_id="wellbore-pressure")

plugin = app
