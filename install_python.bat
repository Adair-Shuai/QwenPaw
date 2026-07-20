@echo off
echo 正在检查Python 3.11安装程序...
if exist python-installer.exe (
    echo 找到Python安装程序，开始安装...
    python-installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    echo Python 3.11安装完成!
) else (
    echo 未找到Python安装程序，请先运行下载脚本
)
pause