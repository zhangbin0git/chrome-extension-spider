import '@src/Popup.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const injectContentScript = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      chrome.notifications.create('inject-error', notificationOptions);
    }

    await chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        files: ['/content-runtime/example.iife.js', '/content-runtime/all.iife.js'],
      })
      .catch(err => {
        // Handling errors related to other paths
        if (err.message.includes('Cannot access a chrome:// URL')) {
          chrome.notifications.create('inject-error', notificationOptions);
        }
      });
  };

  // [函数功能] 修改知乎页面的logo为飞书logo，并添加"飞书云文档"文字
  // [参数] 无参数
  // [返回值] Promise<void> - 异步函数，不返回具体值
  const changeZhihuStyle = async () => {
    // [语法: const] 声明一个常量变量
    // [语法: await] 等待异步操作完成
    // [语法: 数组解构] 使用 [tab] 从查询结果中提取第一个标签页
    // [功能] 获取当前窗口中处于激活状态的标签页
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    // [语法: if条件判断] 检查标签页URL是否有效
    // [语法: !] 非空断言操作符，告诉TypeScript这个值不为null/undefined
    // [语法: .startsWith()] 字符串方法，检查是否以指定字符开头
    // [功能] 如果是chrome://或about://这类特殊页面，无法注入脚本，需要提示用户
    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      // [功能] 创建一个浏览器通知，告知用户无法在此页面执行脚本
      chrome.notifications.create('inject-error', notificationOptions);
      return; // [语法: return] 提前退出函数
    }

    // [语法: try-catch] 异常处理结构，捕获可能出现的错误
    try {
      // [API: chrome.scripting.executeScript] Chrome扩展API，用于在指定标签页中执行JavaScript代码
      // [功能] 向当前标签页注入代码，替换知乎logo为飞书logo
      await chrome.scripting.executeScript({
        // [配置: target] 指定要注入脚本的目标标签页
        target: { tabId: tab.id! }, // [语法: !] 非空断言，确保tab.id存在
        // [配置: func] 要执行的函数，这个函数会在目标页面的上下文中运行
        func: () => {
          // [语法: document.documentElement] DOM API，获取HTML根元素（即<html>标签）
          // [语法: .style.setProperty] CSS API，用于设置CSS自定义属性（变量）
          // [参数1: '--GBL01A'] CSS变量名称，必须以--开头
          // [参数2: 'black'] 要设置的新值，这里设置为黑色
          // [功能] 修改全局CSS变量--GBL01A的值为黑色，这会影响所有使用这个变量的元素
          document.documentElement.style.setProperty('--GBL01A', 'black');

          // [语法: document.querySelector] DOM API，使用CSS选择器查找页面元素
          // [功能] 找到知乎页面顶部导航栏中的logo SVG元素
          const zhihuLogo = document.querySelector('#root > div > div.css-s8xum0 > header > div > a > svg');

          // [语法: if判断] 检查是否成功找到了目标元素
          // [功能] 只有找到logo元素才执行替换操作，避免出错
          if (zhihuLogo) {
            // [语法: .outerHTML] 元素属性，可以读取或设置元素的完整HTML代码（包括标签本身）
            // [功能] 将知乎的SVG logo替换为飞书logo的SVG代码
            zhihuLogo.outerHTML =
              '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-icon="LarkLogoColorful"><path d="m12.924 12.803.056-.054c.038-.034.076-.072.11-.11l.077-.076.23-.227 1.334-1.319.335-.331c.063-.063.13-.123.195-.183a7.777 7.777 0 0 1 1.823-1.24 7.607 7.607 0 0 1 1.014-.4 13.177 13.177 0 0 0-2.5-5.013 1.203 1.203 0 0 0-.94-.448h-9.65c-.173 0-.246.224-.107.325a28.23 28.23 0 0 1 8 9.098c.007-.006.016-.013.023-.022Z" fill="#00D6B9"></path><path d="M9.097 21.299a13.258 13.258 0 0 0 11.82-7.247 5.576 5.576 0 0 1-.731 1.076 5.315 5.315 0 0 1-.745.7 5.117 5.117 0 0 1-.615.404 4.626 4.626 0 0 1-.726.331 5.312 5.312 0 0 1-1.883.312 5.892 5.892 0 0 1-.524-.031 6.509 6.509 0 0 1-.729-.126c-.06-.016-.12-.029-.18-.044-.166-.044-.33-.092-.494-.14-.082-.024-.164-.046-.246-.072-.123-.038-.247-.072-.366-.11l-.3-.095-.284-.094-.192-.067c-.08-.025-.155-.053-.234-.082a3.49 3.49 0 0 1-.167-.06c-.11-.04-.221-.079-.328-.12-.063-.025-.126-.047-.19-.072l-.252-.098c-.088-.035-.18-.07-.268-.107l-.174-.07c-.072-.028-.141-.06-.214-.088l-.164-.07c-.057-.024-.114-.05-.17-.075l-.149-.066-.135-.06-.14-.063a90.183 90.183 0 0 1-.141-.066 4.808 4.808 0 0 0-.18-.083c-.063-.028-.123-.06-.186-.088a5.697 5.697 0 0 1-.199-.098 27.762 27.762 0 0 1-8.067-5.969.18.18 0 0 0-.312.123l.006 9.21c0 .4.199.779.533 1a13.177 13.177 0 0 0 7.326 2.205Z" fill="#3370FF"></path><path d="M23.732 9.295a7.55 7.55 0 0 0-3.35-.776 7.521 7.521 0 0 0-2.284.35c-.054.016-.107.035-.158.05a8.297 8.297 0 0 0-.855.35 7.14 7.14 0 0 0-.552.297 6.716 6.716 0 0 0-.533.347c-.123.089-.243.18-.363.275-.13.104-.252.211-.375.321-.067.06-.13.123-.196.184l-.334.328-1.338 1.321-.23.228-.076.075c-.038.038-.076.073-.11.11l-.057.054a1.914 1.914 0 0 1-.085.08c-.032.028-.063.06-.095.088a13.286 13.286 0 0 1-2.748 1.946c.06.028.12.057.18.082l.142.066c.044.022.091.041.139.063l.135.06.149.067.17.075.164.07c.073.031.142.06.215.088.056.025.116.047.173.07.088.034.177.072.268.107.085.031.168.066.253.098l.189.072c.11.041.218.082.328.12.057.019.11.041.167.06.08.028.155.053.234.082l.192.066.284.095.3.095c.123.037.243.075.366.11l.246.072c.164.048.331.095.495.14.06.015.12.03.18.043.114.029.227.05.34.07.13.022.26.04.389.057a5.815 5.815 0 0 0 .994.019 5.172 5.172 0 0 0 1.413-.3 5.405 5.405 0 0 0 .726-.334c.06-.035.122-.07.182-.108a7.96 7.96 0 0 0 .432-.297 5.362 5.362 0 0 0 .577-.517 5.285 5.285 0 0 0 .37-.429 5.797 5.797 0 0 0 .527-.827l.13-.258 1.166-2.325-.003.006a7.391 7.391 0 0 1 1.527-2.186Z" fill="#133C9A"></path></svg>';

            // [语法: .parentElement] DOM属性，获取当前元素的父元素
            // [功能] 找到logo的父级<a>标签元素，以便在其后面添加文字
            const logoParent = document.querySelector('#root > div > div.css-s8xum0 > header > div > a');

            // [语法: if判断] 检查是否成功找到父元素
            if (logoParent) {
              // [语法: document.createElement] DOM API，创建一个新的HTML元素
              // [功能] 创建一个<span>标签用来包裹文字"飞书云文档"
              const textSpan = document.createElement('span');

              // [语法: .textContent] 元素属性，设置或获取元素的文本内容
              // [功能] 设置文字内容为"飞书云文档"
              textSpan.textContent = '飞书云文档';

              // [语法: .style] 元素属性，可以通过它设置元素的CSS样式
              // [功能] 设置文字的左边距，让它与logo保持一定距离
              textSpan.style.marginLeft = '8px';

              // [语法: .style] 设置字体大小
              textSpan.style.fontSize = '16px';

              // [语法: .style] 设置字体粗细为粗体
              textSpan.style.fontWeight = 'bold';

              // [语法: .insertAdjacentElement] DOM API，在指定位置插入元素
              // [参数: 'afterend'] 表示在目标元素的后面（外部）插入
              // [功能] 将创建的文字span元素插入到logo的<a>标签后面
              logoParent.insertAdjacentElement('afterend', textSpan);
            }
          }

          // [语法: document.querySelectorAll] DOM API，使用CSS选择器查找所有匹配的页面元素
          // [功能] 找到页面中所有class为"QuestionHeader-title"的元素（可能有多个）
          // [返回值] 返回一个NodeList（节点列表），包含所有匹配的元素
          const questionTitles = document.querySelectorAll('.QuestionHeader-title');

          // [语法: .forEach()] 数组方法，用于遍历集合中的每个元素
          // [参数: element] 是回调函数的参数，代表当前遍历到的元素
          // [功能] 遍历所有找到的标题元素，逐个修改它们的文本内容
          questionTitles.forEach(element => {
            // [语法: .textContent] 元素属性，设置或获取元素的文本内容
            // [功能] 将当前元素的文本内容修改为"###项目文件"
            element.textContent = '###项目文件';
          });

          // [语法: document.querySelector] DOM API，使用CSS选择器查找单个匹配元素
          // [功能] 找到问题页面右侧的QuestionHeader-side侧边栏元素
          const questionHeaderSide = document.querySelector(
            '#root > div > div.css-s8xum0 > header > div > div.css-51utkw > div.css-14iuq0r > div > div > div > div.QuestionHeader-side.css-1wbq3dx',
          );

          // [语法: ?.remove()] 可选链操作符 + DOM方法
          // [语法解释: ?.] 可选链，如果元素存在则调用remove()，不存在则不执行，避免报错
          // [功能] 安全地从页面中移除这个元素（如果它存在的话）
          questionHeaderSide?.remove();

          // [语法: document.querySelector] DOM API，使用CSS选择器查找单个匹配元素
          // [功能] 找到问题页面主内容区域的右侧栏元素
          const questionSideColumn = document.querySelector(
            '#root > div > main > div > div > div.Question-main > div.Question-sideColumn.Question-sideColumn--sticky.css-1qyytj7',
          );

          // [语法: ?.remove()] 可选链操作符 + DOM方法
          // [功能] 安全地从页面中移除这个侧边栏元素（如果它存在的话）
          questionSideColumn?.remove();

          // [语法: document.querySelectorAll] DOM API，使用CSS类选择器查找所有匹配元素
          // [功能] 找到页面中所有class为"Question-mainColumn"的元素（主内容栏）
          // [返回值] 返回NodeList，包含所有匹配的元素
          const mainColumns = document.querySelectorAll('.Question-mainColumn');

          // [语法: .forEach()] 遍历方法，对集合中的每个元素执行相同操作
          // [功能] 遍历所有主内容栏元素，将它们的宽度都设置为100%
          mainColumns.forEach(column => {
            // [语法: as HTMLElement] TypeScript类型断言，告诉编译器column是HTMLElement类型
            // [原因] querySelectorAll返回的是Element类型，需要转换为HTMLElement才能访问style属性
            // [语法: .style.width] CSS样式属性，控制元素的宽度
            // [功能] 将元素宽度设置为100%，占满整个容器宽度
            // [效果] 因为侧边栏已被移除，主内容栏可以扩展到全宽，提升阅读体验
            (column as HTMLElement).style.width = '100%';
          });
        },
      });
    } catch (err) {
      // [功能] 捕获并处理可能出现的错误
      console.error('修改样式失败:', err); // [API: console.error] 在控制台输出错误信息
    }
  };

  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('App-header', isLight ? 'text-gray-900' : 'text-gray-100')}>
        <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>
        <p>
          Edit <code>pages/popup/src/Popup.tsx</code>
        </p>
        <button
          className={cn(
            'mt-4 rounded px-4 py-1 font-bold shadow hover:scale-105',
            isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white',
          )}
          onClick={injectContentScript}>
          {t('injectButton')}
        </button>
        {/* [功能] 添加"修改知乎样式"按钮 */}
        <button
          className={cn(
            'mt-4 rounded px-4 py-1 font-bold shadow hover:scale-105', // [CSS: mt-4] margin-top: 1rem; [CSS: rounded] 圆角边框
            isLight ? 'bg-pink-200 text-black' : 'bg-pink-700 text-white', // [语法: 三元运算符] 条件 ? 值1 : 值2
          )}
          onClick={changeZhihuStyle}>
          {/* [事件: onClick] 点击事件处理器，点击时调用changeZhihuStyle函数 */}
          修改知乎样式
        </button>
        <ToggleButton>{t('toggleTheme')}</ToggleButton>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
