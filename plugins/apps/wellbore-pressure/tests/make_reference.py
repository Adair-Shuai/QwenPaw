# -*- coding: utf-8 -*-
"""Generate fixtures from the reviewed original pressure model."""

import hashlib
import json
import sys
import types
import zipfile
from pathlib import Path

archive = Path(sys.argv[1])
with zipfile.ZipFile(archive) as z:
    source = z.read("代码/models/pressure_model.py")
namespace = types.ModuleType("original_pressure_model")
exec(compile(source, "original_pressure_model.py", "exec"), namespace.__dict__)
cases = [
    {
        "pressure": 8,
        "temperature": 300,
        "depth": 1000,
        "diameter": 0.08,
        "rate": 50000,
        "roughness": 1e-5,
        "angle": 90,
        "z": 0.9,
    },
    {
        "pressure": 8,
        "temperature": 300,
        "depth": 1000,
        "diameter": 0.076,
        "rate": 50000,
        "roughness": 1e-5,
        "angle": 90,
        "z": 0.9,
    },
    {
        "pressure": 12,
        "temperature": 315,
        "depth": 2357,
        "diameter": 0.1,
        "rate": 120000,
        "roughness": 2e-5,
        "angle": 60,
        "z": 0.85,
    },
    {
        "pressure": 4,
        "temperature": 280,
        "depth": 150,
        "diameter": 0.12,
        "rate": 100,
        "roughness": 1e-6,
        "angle": 0,
        "z": 0.95,
    },
    {
        "pressure": 2,
        "temperature": 300,
        "depth": 1,
        "diameter": 0.08,
        "rate": 1,
        "roughness": 1e-5,
        "angle": 90,
        "z": 1,
    },
    {
        "pressure": 20,
        "temperature": 330,
        "depth": 300.5,
        "diameter": 0.08,
        "rate": 50000,
        "roughness": 1e-5,
        "angle": 30,
        "z": 0.9,
    },
    {
        "pressure": 30,
        "temperature": 350,
        "depth": 10000,
        "diameter": 0.15,
        "rate": 800000,
        "roughness": 1e-5,
        "angle": 90,
        "z": 1.1,
    },
]
fixtures = []
for p in cases:
    for model in ["Orkiszewski", "Beggs-Brill"]:
        n = max(300, round(p["depth"]))
        df = namespace.calculate_pressure_profile(
            model,
            P_wh=p["pressure"] * 1e6,
            T_wh=p["temperature"],
            depth=p["depth"],
            D=p["diameter"],
            q_std=p["rate"],
            eps=p["roughness"],
            angle=p["angle"],
            Z=p["z"],
            n=n,
        )
        samples = namespace.sample_pressure_profile(df)
        fixtures.append(
            {
                "params": p,
                "model": model,
                "steps": n,
                "rows": df.iloc[:, :7].values.tolist(),
                "samples": samples.iloc[:, :7].values.tolist(),
            },
        )
target = Path(__file__).with_name("reference.json")
target.write_text(
    json.dumps(
        {
            "source_sha256": hashlib.sha256(source).hexdigest(),
            "cases": fixtures,
        },
        ensure_ascii=False,
        separators=(",", ":"),
    ),
    encoding="utf-8",
)
print(
    json.dumps(
        {
            "cases": len(fixtures),
            "numeric_values": sum(len(c["rows"]) * 7 for c in fixtures),
            "source_sha256": hashlib.sha256(source).hexdigest(),
        },
    ),
)
