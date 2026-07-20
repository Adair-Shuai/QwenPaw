#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试优化后的COMSOL检测功能"""

import sys
import os

sys.path.insert(0, os.path.abspath("."))

from plugins.bundle.ugsci.software_detector import (  # noqa: E402
    detect_software,
    _get_comsol_from_registry,
    _get_comsol_version_dirs,
)


def test_comsol_detection():
    """测试COMSOL检测功能"""
    print("=== COMSOL检测策略优化测试 ===")
    print()

    # 1. 测试注册表检测
    print("1. 注册表检测测试:")
    comsol_path = _get_comsol_from_registry()
    if comsol_path:
        print(f"   ✅ 从注册表找到COMSOL: {comsol_path}")
    else:
        print("   ❌ 注册表中未找到COMSOL")
    print()

    # 2. 测试版本目录检测
    print("2. 版本目录检测测试:")
    if comsol_path:
        version_dirs = _get_comsol_version_dirs(comsol_path)
        if version_dirs:
            print(f"   ✅ 找到版本目录: {version_dirs}")
        else:
            print("   ⚠️  未找到版本目录")
    print()

    # 3. 完整软件检测
    print("3. 完整软件检测测试:")
    result = detect_software()

    # 查找COMSOL结果
    comsol_found = None
    for sw in result.software_list:
        if sw.id == "comsol":
            comsol_found = sw
            break

    if comsol_found:
        print("   ✅ 找到COMSOL:")
        print(f"      名称: {comsol_found.name}")
        print(f"      版本: " f"{comsol_found.version or '未检测到'}")
        print(f"      路径: " f"{comsol_found.executable_path or '未找到'}")
        print(f"      安装目录: " f"{comsol_found.install_dir or '未找到'}")
        print(f"      状态: {comsol_found.status}")
        print(f"      使用提示: {comsol_found.invocation_hint}")
    else:
        print("   ❌ COMSOL未在检测列表中")

    print()
    print(f"总计检测软件数: {len(result.software_list)}")
    found_count = sum(1 for sw in result.software_list if sw.status == "found")
    print(f"找到软件数: {found_count}")

    return comsol_found


if __name__ == "__main__":
    test_comsol_detection()
