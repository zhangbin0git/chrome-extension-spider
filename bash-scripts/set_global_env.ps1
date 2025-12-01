# [功能] 设置全局环境变量的 PowerShell 脚本
# [说明] 此脚本用于管理 .env 文件中的 CLI 参数（通过命令行设置的参数）

# ===== 1. 默认值设置 =====
# [知识点: $变量名] PowerShell 中变量以 $ 开头，无需声明类型
$CLI_CEB_DEV = "false"       # [功能] 是否为开发模式
$CLI_CEB_FIREFOX = "false"   # [功能] 是否为 Firefox 浏览器
$cliValues = @()             # [知识点: @()] 创建一个空数组

# ===== 2. 辅助函数：验证布尔值 =====
function Validate-Boolean {
    param([string]$value, [string]$name)  # [参数] $value 是要验证的值，$name 是参数名
    
    # [知识点: -ne] "not equal" 不等于运算符
    if ($value -ne "true" -and $value -ne "false") {
        Write-Host "Invalid value for <$name>. Please use 'true' or 'false'." -ForegroundColor Red
        exit 1  # [功能] 退出脚本，返回错误代码 1
    }
}

# ===== 3. 辅助函数：验证键名格式 =====
function Validate-Key {
    param(
        [string]$key,                      # [参数] 要验证的键名
        [bool]$isEditableSection = $false  # [参数] 是否在可编辑区域
    )
    
    # [功能] 跳过空行和注释行
    if ([string]::IsNullOrWhiteSpace($key) -or $key.StartsWith("#")) {
        return
    }
    
    # [知识点: -notmatch] 正则表达式不匹配运算符
    if ($isEditableSection -and $key -notmatch "^CEB_") {
        Write-Host "Invalid key: <$key>. All keys in the editable section must start with 'CEB_'." -ForegroundColor Red
        exit 1
    }
    elseif (-not $isEditableSection -and $key -notmatch "^CLI_CEB_") {
        Write-Host "Invalid key: <$key>. All CLI keys must start with 'CLI_CEB_'." -ForegroundColor Red
        exit 1
    }
}

# ===== 4. 解析命令行参数 =====
# [知识点: $args] PowerShell 内置变量，包含所有命令行参数
foreach ($arg in $args) {
    # [功能] 分割 "key=value" 格式的参数
    # [知识点: -split] 字符串分割运算符
    if ($arg -match "^(.+?)=(.+)$") {
        $key = $Matches[1]    # [功能] 正则匹配的第一个捕获组（键名）
        $value = $Matches[2]  # [功能] 正则匹配的第二个捕获组（值）
        
        Validate-Key -key $key  # [功能] 验证键名格式
        
        # [知识点: switch] 类似其他语言的 switch/case 语句
        switch ($key) {
            "CLI_CEB_DEV" {
                $CLI_CEB_DEV = $value
                Validate-Boolean -value $CLI_CEB_DEV -name "CLI_CEB_DEV"
            }
            "CLI_CEB_FIREFOX" {
                $CLI_CEB_FIREFOX = $value
                Validate-Boolean -value $CLI_CEB_FIREFOX -name "CLI_CEB_FIREFOX"
            }
            default {
                # [知识点: +=] 数组添加元素运算符
                $cliValues += "$key=$value"
            }
        }
    }
}

# ===== 5. 验证现有 .env 文件中的键 =====
if (Test-Path ".env") {
    $editableSectionStarts = $false  # [功能] 标记是否进入可编辑区域
    $lines = Get-Content ".env"      # [功能] 读取 .env 文件的所有行
    
    foreach ($line in $lines) {
        # [功能] 提取等号前的键名
        if ($line -match "^([^=]+)=") {
            $key = $Matches[1].Trim()  # [知识点: Trim()] 去除首尾空白字符
            
            # [功能] 检测是否进入可编辑区域（CLI_CEB_ 开头的是非可编辑区域）
            if ($key -match "^CLI_CEB_") {
                $editableSectionStarts = $true
            }
            elseif ($editableSectionStarts) {
                Validate-Key -key $key -isEditableSection $true
            }
        }
    }
}

# ===== 6. 创建新的 .env 文件 =====
# [知识点: @()] 创建数组来存储新文件的所有行
$newEnvContent = @()

# [功能] 添加 CLI 参数区域的注释和值
$newEnvContent += "# THOSE VALUES ARE EDITABLE ONLY VIA CLI"
$newEnvContent += "CLI_CEB_DEV=$CLI_CEB_DEV"
$newEnvContent += "CLI_CEB_FIREFOX=$CLI_CEB_FIREFOX"

# [功能] 添加其他 CLI 参数
foreach ($value in $cliValues) {
    $newEnvContent += $value
}

$newEnvContent += ""  # [功能] 添加空行
$newEnvContent += "# THOSE VALUES ARE EDITABLE"

# [功能] 保留原有的 CEB_ 开头的环境变量
if (Test-Path ".env") {
    $existingCebValues = Get-Content ".env" | Where-Object { $_ -match "^CEB_" }
    $newEnvContent += $existingCebValues
}

# [功能] 将新内容写入 .env 文件
# [知识点: -join] 将数组元素用指定分隔符连接成字符串
$newEnvContent -join "`n" | Set-Content ".env" -NoNewline -Encoding UTF8

Write-Host "Environment variables updated successfully!" -ForegroundColor Green
