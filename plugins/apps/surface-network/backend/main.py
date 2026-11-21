from qwenpaw.pawapp import PawApp

from .backend.ezwalker import router

app = PawApp(name="地面管网", app_id="surface-network")
app.include_router(router)
plugin = app
