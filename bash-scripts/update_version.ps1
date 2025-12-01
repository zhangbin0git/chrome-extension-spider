# [知识点: param] PowerShell 参数声明块，用于接收命令行参数
param(
    [string]$NewVersion  # [功能] 接收新版本号，例如 "1.2.3"
)

# [功能] 验证版本号格式是否为 0.0.0 格式
# [语法: -match] PowerShell 的正则表达式匹配运算符
# [语法: ^$] 正则表达式中 ^ 表示开始，$ 表示结束
if ($NewVersion -match '^\d+\.\d+\.\d+$') {
    # [知识点: Get-ChildItem] PowerShell 的文件查找命令（类似 Linux 的 find）
    # [参数: -Recurse] 递归搜索所有子目录
    # [参数: -Filter] 按文件名过滤
    $packageFiles = Get-ChildItem -Path . -Recurse -Filter "package.json" | 
    Where-Object { $_.FullName -notmatch "\\node_modules\\" }  # [功能] 排除 node_modules 目录
    
    # [知识点: foreach] 循环遍历每个找到的 package.json 文件
    foreach ($file in $packageFiles) {
        # [功能] 读取文件全部内容
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        # [知识点: -replace] PowerShell 的字符串替换运算符（支持正则表达式）
        # [功能] 匹配 "version": "任意版本号" 并替换为新版本
        $newContent = $content -replace '("version"\s*:\s*")[^"]*(")', "`$1$NewVersion`$2"
        
        # [功能] 将修改后的内容写回文件
        # [参数: -NoNewline] 不在文件末尾添加额外的换行符
        Set-Content -Path $file.FullName -Value $newContent -NoNewline -Encoding UTF8
    }
    
    # [功能] 输出成功信息
    Write-Host "Updated versions to $NewVersion" -ForegroundColor Green
}
else {
    # [功能] 输出错误信息
    Write-Host "Version format <$NewVersion> isn't correct, proper format is <0.0.0>" -ForegroundColor Red
}
