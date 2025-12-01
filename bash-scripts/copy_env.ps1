# [功能] 检查 .env 文件是否不存在，且 .example.env 文件存在
# [语法: Test-Path] 测试文件或目录是否存在，返回 True 或 False
if (-not (Test-Path ".env") -and (Test-Path ".example.env")) {
    # [功能] 将 .example.env 复制为 .env
    # [语法: Copy-Item] PowerShell 的文件复制命令
    Copy-Item ".example.env" ".env"
    
    # [功能] 输出成功信息到控制台
    Write-Host ".example.env has been copied to .env" -ForegroundColor Green
}
