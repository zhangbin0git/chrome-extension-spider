import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';

// [功能] 定义错误通知的配置选项
// [语法: const] 声明一个只读的常量变量
// [语法: as const] TypeScript断言，将对象属性标记为只读字面量类型
const notificationOptions = {
  type: 'basic', // [属性] 通知的类型，basic表示基础通知
  iconUrl: chrome.runtime.getURL('icon-34.png'), // [API] 获取扩展程序内部图片的完整URL
  title: 'Injecting content script error', // [属性] 通知的标题
  message: 'You cannot inject script here!', // [属性] 通知的具体内容
} as const;

// [组件功能] 弹窗主组件，负责显示Logo和操作按钮
// [返回值] JSX.Element - 返回React组件渲染的界面
const Popup = () => {
  // [语法: useStorage] 自定义Hook，用于从Chrome存储中获取状态
  // [语法: 解构赋值] 从返回对象中直接提取 isLight 属性
  // [功能] 获取当前的主题设置（true为亮色模式，false为暗色模式）
  const { isLight } = useStorage(exampleThemeStorage);

  // [API: chrome.runtime.getURL] Chrome扩展API
  // [功能] 获取 public 目录下 icon-128.png 图片的完整路径
  const logoUrl = chrome.runtime.getURL('icon-128.png');

  // [函数功能] 点击按钮时触发，向当前页面注入代码以修改样式
  // [语法: async] 声明这是一个异步函数，内部可以使用 await
  const handleModifyStyle = async () => {
    // [API: chrome.tabs.query] 查询浏览器标签页
    // [参数] currentWindow: true (当前窗口), active: true (当前激活的标签)
    // [语法: await] 等待异步查询结果返回
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    // [语法: if] 条件判断语句
    // [语法: !] 非空断言，告诉TypeScript tab.url 一定存在
    // [功能] 检查当前页面是否为浏览器内置页面（如设置页），这些页面不允许注入脚本
    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      // [API] 创建一个系统通知告知用户错误
      chrome.notifications.create('inject-error', notificationOptions);
      return; // [语法: return] 结束函数执行
    }

    // [语法: try-catch] 错误捕获结构，防止程序因错误而崩溃
    try {
      // [API: chrome.scripting.executeScript] 核心API，向目标标签页注入并执行脚本
      await chrome.scripting.executeScript({
        target: { tabId: tab.id! }, // [参数] 指定要注入脚本的标签页ID
        // [参数] func: 要在目标页面上下文中执行的函数
        func: () => {
          // --- 以下代码将在目标网页中运行 ---

          // [语法: document.documentElement] 获取网页的根元素 (<html>)
          // [API: style.setProperty] 设置CSS变量
          // [功能] 将知乎的全局背景色变量修改为黑色
          document.documentElement.style.setProperty('--GBL01A', 'black');

          // [API: document.querySelector] 查找页面元素
          // [功能] 查找知乎顶部的Logo SVG元素
          const zhihuLogo = document.querySelector('#root > div > div.css-s8xum0 > header > div > a > svg');

          // [语法: if] 只有当找到了Logo元素时才执行替换
          if (zhihuLogo) {
            // [API: outerHTML] 获取或设置描述该元素及其后代的序列化HTML片段
            // [功能] 将原有的知乎Logo替换为飞书的Logo SVG代码
            zhihuLogo.outerHTML =
              '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-icon="LarkLogoColorful"><path d="m12.924 12.803.056-.054c.038-.034.076-.072.11-.11l.077-.076.23-.227 1.334-1.319.335-.331c.063-.063.13-.123.195-.183a7.777 7.777 0 0 1 1.823-1.24 7.607 7.607 0 0 1 1.014-.4 13.177 13.177 0 0 0-2.5-5.013 1.203 1.203 0 0 0-.94-.448h-9.65c-.173 0-.246.224-.107.325a28.23 28.23 0 0 1 8 9.098c.007-.006.016-.013.023-.022Z" fill="#00D6B9"></path><path d="M9.097 21.299a13.258 13.258 0 0 0 11.82-7.247 5.576 5.576 0 0 1-.731 1.076 5.315 5.315 0 0 1-.745.7 5.117 5.117 0 0 1-.615.404 4.626 4.626 0 0 1-.726.331 5.312 5.312 0 0 1-1.883.312 5.892 5.892 0 0 1-.524-.031 6.509 6.509 0 0 1-.729-.126c-.06-.016-.12-.029-.18-.044-.166-.044-.33-.092-.494-.14-.082-.024-.164-.046-.246-.072-.123-.038-.247-.072-.366-.11l-.3-.095-.284-.094-.192-.067c-.08-.025-.155-.053-.234-.082a3.49 3.49 0 0 1-.167-.06c-.11-.04-.221-.079-.328-.12-.063-.025-.126-.047-.19-.072l-.252-.098c-.088-.035-.18-.07-.268-.107l-.174-.07c-.072-.028-.141-.06-.214-.088l-.164-.07c-.057-.024-.114-.05-.17-.075l-.149-.066-.135-.06-.14-.063a90.183 90.183 0 0 1-.141-.066 4.808 4.808 0 0 0-.18-.083c-.063-.028-.123-.06-.186-.088a5.697 5.697 0 0 1-.199-.098 27.762 27.762 0 0 1-8.067-5.969.18.18 0 0 0-.312.123l.006 9.21c0 .4.199.779.533 1a13.177 13.177 0 0 0 7.326 2.205Z" fill="#3370FF"></path><path d="M23.732 9.295a7.55 7.55 0 0 0-3.35-.776 7.521 7.521 0 0 0-2.284.35c-.054.016-.107.035-.158.05a8.297 8.297 0 0 0-.855.35 7.14 7.14 0 0 0-.552.297 6.716 6.716 0 0 0-.533.347c-.123.089-.243.18-.363.275-.13.104-.252.211-.375.321-.067.06-.13.123-.196.184l-.334.328-1.338 1.321-.23.228-.076.075c-.038.038-.076.073-.11.11l-.057.054a1.914 1.914 0 0 1-.085.08c-.032.028-.063.06-.095.088a13.286 13.286 0 0 1-2.748 1.946c.06.028.12.057.18.082l.142.066c.044.022.091.041.139.063l.135.06.149.067.17.075.164.07c.073.031.142.06.215.088.056.025.116.047.173.07.088.034.177.072.268.107.085.031.168.066.253.098l.189.072c.11.041.218.082.328.12.057.019.11.041.167.06.08.028.155.053.234.082l.192.066.284.095.3.095c.123.037.243.075.366.11l.246.072c.164.048.331.095.495.14.06.015.12.03.18.043.114.029.227.05.34.07.13.022.26.04.389.057a5.815 5.815 0 0 0 .994.019 5.172 5.172 0 0 0 1.413-.3 5.405 5.405 0 0 0 .726-.334c.06-.035.122-.07.182-.108a7.96 7.96 0 0 0 .432-.297 5.362 5.362 0 0 0 .577-.517 5.285 5.285 0 0 0 .37-.429 5.797 5.797 0 0 0 .527-.827l.13-.258 1.166-2.325-.003.006a7.391 7.391 0 0 1 1.527-2.186Z" fill="#133C9A"></path></svg>';

            // [API] 查找Logo的父级链接元素
            const logoParent = document.querySelector('#root > div > div.css-s8xum0 > header > div > a');
            if (logoParent) {
              // [API: createElement] 创建新的span元素用于显示文字
              const textSpan = document.createElement('span');
              textSpan.textContent = '飞书云文档'; // [属性] 设置文字内容
              textSpan.style.marginLeft = '8px'; // [样式] 设置左边距
              textSpan.style.fontSize = '16px'; // [样式] 设置字号
              textSpan.style.fontWeight = 'bold'; // [样式] 设置加粗
              // [API: insertAdjacentElement] 在Logo链接后插入文字
              logoParent.insertAdjacentElement('afterend', textSpan);
            }
          }

          // [API: querySelectorAll] 查找所有问题标题元素
          const questionTitles = document.querySelectorAll('.QuestionHeader-title');
          // [语法: forEach] 遍历所有找到的元素
          questionTitles.forEach(element => {
            element.textContent = '###项目文件'; // [功能] 修改标题文字
          });

          // [API] 查找并移除侧边栏元素，净化页面
          const questionHeaderSide = document.querySelector(
            '#root > div > div.css-s8xum0 > header > div > div.css-51utkw > div.css-14iuq0r > div > div > div > div.QuestionHeader-side.css-1wbq3dx',
          );
          questionHeaderSide?.remove(); // [语法: ?.] 可选链，如果元素存在则移除

          // [API] 查找并移除主内容区的侧边栏
          const questionSideColumn = document.querySelector(
            '#root > div > main > div > div > div.Question-main > div.Question-sideColumn.Question-sideColumn--sticky.css-1qyytj7',
          );
          questionSideColumn?.remove();

          // [API] 查找主内容列
          const mainColumns = document.querySelectorAll('.Question-mainColumn');
          mainColumns.forEach(column => {
            // [语法: as HTMLElement] 类型断言，确保可以访问style属性
            // [功能] 将主内容列宽度设为100%，占满屏幕
            (column as HTMLElement).style.width = '100%';
          });
        },
      });
    } catch (err) {
      // [API: console.error] 打印错误日志
      console.error('修改样式失败:', err);
    }
  };

  // [功能] 渲染组件的UI结构
  return (
    // [组件] 最外层容器
    // [语法: cn()] 工具函数，用于动态合并CSS类名
    // [样式] 根据 isLight 状态切换背景色
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      {/* [组件] 头部容器，包含Logo和按钮 */}
      <header className={cn('App-header', isLight ? 'text-gray-900' : 'text-gray-100')}>
        {/* [组件] 显示Logo图片 */}
        <img
          src={logoUrl} // [属性] 图片源地址
          className="App-logo" // [样式] 使用CSS类名
          alt="logo" // [属性] 图片描述，用于无障碍访问
          style={{ height: '60px', width: '60px', marginBottom: '16px' }} // [样式] 内联样式：设置大小和下边距
        />

        {/* [组件] "修改样式"按钮 */}
        <button
          // [样式] 使用Tailwind CSS类名进行美化
          // mt-4: 顶部边距; px-6 py-2: 内边距; rounded-full: 全圆角; font-bold: 粗体; shadow-lg: 大阴影
          // hover:scale-105: 悬停时放大; active:scale-95: 点击时缩小
          className={cn(
            'mt-3 transform rounded-full px-4 py-1.5 text-sm font-bold shadow-md transition-all hover:scale-105 active:scale-95',
            // [语法: 三元运算符] 根据主题切换按钮颜色
            isLight
              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:shadow-blue-300/50' // 亮色模式样式
              : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-blue-900/50', // 暗色模式样式
          )}
          onClick={handleModifyStyle}>
          {/* [事件] 绑定点击事件 */}
          修改样式
        </button>
      </header>
    </div>
  );
};

// [功能] 导出组件，并包裹错误边界和Suspense加载状态
// [语法: export default] 默认导出
export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
