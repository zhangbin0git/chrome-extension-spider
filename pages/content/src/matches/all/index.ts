// [知识点: import语句] 从其他模块导入函数或变量,这里暂时保留原有导入
import { sampleFunction } from '@src/sample-function';

// [功能] 在浏览器控制台打印日志,表明内容脚本已加载
console.log('[CEB] All content script with copy button loaded');

// [功能] 调用示例函数(可选,保留原有功能)
void sampleFunction();

/**
 * [函数说明] 创建悬浮按钮
 * @returns {HTMLButtonElement} 返回创建的按钮元素
 *
 * [Algorithm思路]
 * 1. 创建一个按钮元素
 * 2. 设置按钮的文字、样式和位置
 * 3. 添加点击事件监听器
 */
const createFloatingButton = (): HTMLButtonElement => {
  // [语法: const] 声明一个常量变量,值不可改变
  // [功能] 创建一个button元素
  const button = document.createElement('button');

  // [语法: innerHTML] 设置元素的HTML内容
  // [功能] 设置按钮显示的文字
  button.innerHTML = '复制答案';

  // [语法: setAttribute] 为元素设置属性
  // [功能] 设置按钮的ID,方便后续识别和操作
  button.setAttribute('id', 'copy-answer-btn');

  // [语法: style属性] 直接通过JavaScript设置CSS样式
  // [功能] 设置按钮的视觉样式和位置
  button.style.position = 'fixed'; // [CSS: fixed] 固定定位,不随页面滚动
  button.style.bottom = '30px'; // [CSS: bottom] 距离浏览器窗口底部30像素
  button.style.right = '30px'; // [CSS: right] 距离浏览器窗口右侧30像素
  button.style.zIndex = '9999'; // [CSS: z-index] 层级设为9999,确保在最上层显示
  button.style.padding = '12px 24px'; // [CSS: padding] 内边距,上下12px,左右24px
  button.style.backgroundColor = '#1890ff'; // [CSS: background] 背景颜色为蓝色
  button.style.color = '#ffffff'; // [CSS: color] 文字颜色为白色
  button.style.border = 'none'; // [CSS: border] 无边框
  button.style.borderRadius = '6px'; // [CSS: border-radius] 圆角6像素
  button.style.fontSize = '14px'; // [CSS: font-size] 字体大小14像素
  button.style.fontWeight = 'bold'; // [CSS: font-weight] 字体加粗
  button.style.cursor = 'pointer'; // [CSS: cursor] 鼠标悬停时显示手型光标
  button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'; // [CSS: box-shadow] 添加阴影效果
  button.style.transition = 'all 0.3s ease'; // [CSS: transition] 所有样式变化都有0.3秒的平滑过渡

  // [语法: addEventListener] 为元素添加事件监听器
  // [功能] 监听鼠标进入事件,实现悬停效果
  button.addEventListener('mouseenter', () => {
    // [语法: 箭头函数 =>] ES6的函数简写语法
    button.style.backgroundColor = '#40a9ff'; // [功能] 鼠标悬停时背景色变亮
    button.style.transform = 'scale(1.05)'; // [CSS: transform scale] 放大到1.05倍
  });

  // [功能] 监听鼠标离开事件,恢复默认样式
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#1890ff'; // [功能] 恢复原背景色
    button.style.transform = 'scale(1)'; // [功能] 恢复原大小
  });

  // [功能] 监听按钮点击事件
  button.addEventListener('click', handleCopyClick);

  // [语法: return] 返回创建好的按钮元素
  return button;
};

/**
 * [函数说明] 处理复制按钮点击事件
 * @returns {Promise<void>} 异步函数,返回一个Promise
 *
 * [Algorithm思路]
 * 1. 获取页面所有class="List-item"的元素
 * 2. 提取每个元素的文本内容
 * 3. 合并所有文本
 * 4. 复制到剪贴板
 * 5. 显示提示消息
 */
const handleCopyClick = async (): Promise<void> => {
  // [语法: async] 声明异步函数,可以使用await关键字
  // [语法: Promise<void>] TypeScript类型注解,表示函数返回一个不包含值的Promise

  try {
    // [语法: try-catch] 异常处理结构,捕获可能出现的错误

    // [语法: document.querySelectorAll] 查询所有匹配CSS选择器的元素
    // [功能] 获取页面中所有class="List-item"的元素
    const listItems = document.querySelectorAll('.List-item');

    // [语法: Array.from] 将类数组对象转换为真正的数组
    // [语法: .map()] 数组方法,遍历数组每个元素并返回新数组
    // [功能] 提取每个元素的文本内容,并去除首尾空格
    // [语法: textContent] 获取元素及其子元素的所有文本内容
    // [语法: ?.trim()] 可选链操作符+trim方法,去除文本首尾空格
    // [语法: || ''] 逻辑或运算符,如果左侧为空则使用空字符串
    // [语法: 箭头函数简化] 当函数体只有return语句时,可以省略{}和return关键字
    const texts = Array.from(listItems).map(item => item.textContent?.trim() || '');

    // [语法: .filter()] 数组方法,过滤掉不符合条件的元素
    // [语法: Boolean] 将值转换为布尔值,空字符串会被过滤掉
    // [功能] 过滤掉空字符串
    const validTexts = texts.filter(Boolean);

    // [语法: if语句] 条件判断
    // [功能] 检查是否找到了有效的内容
    if (validTexts.length === 0) {
      showNotification('未找到任何List-item元素!', 'warning');
      return; // [语法: return] 提前结束函数执行
    }

    // [语法: .join()] 数组方法,将数组元素用指定分隔符连接成字符串
    // [功能] 用两个换行符分隔每个List-item的内容
    const combinedText = validTexts.join('\n\n');

    // [语法: await] 等待异步操作完成
    // [语法: navigator.clipboard.writeText()] 现代浏览器的剪贴板API
    // [功能] 将文本复制到剪贴板
    await navigator.clipboard.writeText(combinedText);

    // [语法: chrome.runtime.sendMessage] Chrome扩展消息传递API
    // [功能] 发送消息到侧边栏,让侧边栏显示复制的答案列表
    // [知识点: 消息传递] Chrome扩展的不同部分(content script/side panel/popup)通过消息传递进行通信
    chrome.runtime.sendMessage({
      type: 'COPY_ANSWERS', // [功能] 消息类型,用于识别这是复制答案的消息
      data: {
        answers: validTexts, // [功能] 将答案数组发送给侧边栏
        timestamp: Date.now(), // [功能] 添加时间戳,记录复制时间
      },
    });

    // [功能] 显示成功提示
    showNotification(`成功复制${validTexts.length}条答案到剪贴板!`, 'success');
  } catch (error) {
    // [语法: catch块] 捕获try块中抛出的异常
    // [功能] 如果复制失败,在控制台输出错误信息
    console.error('复制失败:', error);

    // [功能] 显示错误提示
    showNotification('复制失败,请检查浏览器权限!', 'error');
  }
};

/**
 * [函数说明] 显示通知消息
 * @param {string} message - 要显示的消息文本
 * @param {string} type - 消息类型: 'success' | 'warning' | 'error'
 *
 * [Algorithm思路]
 * 1. 创建一个通知元素
 * 2. 设置消息内容和样式
 * 3. 添加到页面
 * 4. 3秒后自动移除
 */
const showNotification = (message: string, type: 'success' | 'warning' | 'error' = 'success'): void => {
  // [语法: function参数] message和type是函数的输入参数
  // [语法: type: string] TypeScript类型注解,指定参数类型
  // [语法: = 'success'] 默认参数值,如果不传type参数则默认为'success'

  // [功能] 创建一个div元素作为通知容器
  const notification = document.createElement('div');

  // [功能] 设置通知的文本内容
  notification.textContent = message;

  // [语法: 对象字面量] 用{}定义一个包含键值对的对象
  // [功能] 根据消息类型定义不同的背景颜色
  const colors = {
    success: '#52c41a', // 绿色表示成功
    warning: '#faad14', // 橙色表示警告
    error: '#f5222d', // 红色表示错误
  };

  // [功能] 设置通知的样式
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '10000'; // [功能] 比按钮层级更高,确保显示在最上层
  notification.style.padding = '16px 24px';
  notification.style.backgroundColor = colors[type]; // [语法: 对象属性访问] 用方括号访问对象属性
  notification.style.color = '#ffffff';
  notification.style.borderRadius = '6px';
  notification.style.fontSize = '14px';
  notification.style.fontWeight = 'bold';
  notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  notification.style.transition = 'all 0.3s ease';
  notification.style.opacity = '0'; // [功能] 初始透明度为0,用于淡入动画

  // [语法: document.body.appendChild] 将元素添加到body的末尾
  // [功能] 将通知添加到页面
  document.body.appendChild(notification);

  // [语法: setTimeout] 延迟执行函数
  // [功能] 10毫秒后显示通知(淡入效果)
  setTimeout(() => {
    notification.style.opacity = '1'; // [功能] 设置透明度为1,配合transition实现淡入
  }, 10);

  // [功能] 3秒后开始淡出通知
  setTimeout(() => {
    notification.style.opacity = '0'; // [功能] 设置透明度为0,淡出效果

    // [功能] 再等300毫秒(等待淡出动画完成)后从DOM中移除元素
    setTimeout(() => {
      // [语法: element.remove()] 从DOM中移除元素
      notification.remove();
    }, 300);
  }, 3000); // [语法: 数字参数] 3000毫秒 = 3秒
};

/**
 * [函数说明] 初始化函数,当页面加载完成后执行
 *
 * [Algorithm思路]
 * 1. 检查按钮是否已存在
 * 2. 如果不存在则创建并添加到页面
 */
const init = (): void => {
  // [语法: document.getElementById] 通过ID获取元素
  // [功能] 检查页面中是否已经存在复制按钮(避免重复创建)
  const existingButton = document.getElementById('copy-answer-btn');

  // [语法: if(!condition)] 如果条件为假则执行
  // [功能] 如果按钮不存在,则创建并添加
  if (!existingButton) {
    // [功能] 调用创建按钮的函数
    const button = createFloatingButton();

    // [功能] 将按钮添加到页面body中
    document.body.appendChild(button);

    // [功能] 在控制台输出日志
    console.log('[复制答案] 悬浮按钮已创建');
  }
};

// [语法: if条件判断] 检查文档加载状态
// [功能] 确保在DOM完全加载后再初始化按钮
if (document.readyState === 'loading') {
  // [知识点: DOMContentLoaded事件] 当HTML文档被完全加载和解析后触发
  // [功能] 如果页面还在加载中,等待加载完成
  document.addEventListener('DOMContentLoaded', init);
} else {
  // [功能] 如果页面已经加载完成,直接初始化
  init();
}
