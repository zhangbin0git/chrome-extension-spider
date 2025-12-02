// [知识点: import语句] 从React和其他模块导入所需的功能
import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
// [语法: React import] 导入React的useState和useEffect钩子
import { useState, useEffect } from 'react';

// [知识点: TypeScript接口] 定义答案项的数据结构
// [功能] 规范每条答案的数据格式
interface AnswerItem {
  id: number; // [功能] 唯一标识符,用于React列表渲染的key
  content: string; // [功能] 答案的文本内容
  timestamp: number; // [功能] 答案复制的时间戳
}

// [知识点: React函数组件] 使用箭头函数定义组件
const SidePanel = () => {
  // [语法: useStorage] 自定义Hook,用于获取主题状态
  // [功能] 获取当前是否为亮色主题
  const { isLight } = useStorage(exampleThemeStorage);

  // [语法: useState] React Hook,用于在函数组件中添加状态
  // [功能] 存储所有的答案列表
  // [语法: <AnswerItem[]>] TypeScript泛型,指定state的类型为AnswerItem数组
  const [answers, setAnswers] = useState<AnswerItem[]>([]);

  // [语法: useState] 创建显示动画索引的状态
  // [功能] 控制当前显示到第几条答案,实现逐条显示效果
  const [visibleCount, setVisibleCount] = useState<number>(0);

  // [语法: useEffect] React Hook,用于处理副作用(如事件监听、数据获取等)
  // [功能] 组件挂载时监听来自content script的消息
  useEffect(() => {
    // [知识点: 消息监听函数] 定义处理消息的回调函数
    // [语法: chrome.runtime.onMessage] Chrome扩展的消息监听API
    const messageListener = (message: { type: string; data?: { answers: string[]; timestamp: number } }) => {
      // [功能] 接收的消息对象
      // [语法: if条件判断] 检查消息类型
      // [功能] 只处理"COPY_ANSWERS"类型的消息
      if (message.type === 'COPY_ANSWERS' && message.data) {
        // [语法: 解构赋值] 从message.data中提取answers和timestamp
        const { answers: newAnswers, timestamp } = message.data;

        // [语法: map方法] 遍历数组并返回新数组
        // [功能] 将字符串数组转换为AnswerItem对象数组
        const answerItems: AnswerItem[] = newAnswers.map((content, index) => ({
          id: timestamp + index, // [功能] 用时间戳+索引生成唯一ID
          content, // [语法: 对象属性简写] 等同于 content: content
          timestamp,
        }));

        // [语法: setAnswers] 调用状态更新函数
        // [语法: prevAnswers => ...] 函数式更新,prevAnswers是当前状态值
        // [语法: 扩展运算符...] 展开数组元素
        // [功能] 将新答案添加到现有答案列表的前面(最新的在上面)
        setAnswers(prevAnswers => [...answerItems, ...prevAnswers]);

        // [功能] 重置可见计数,准备开始逐条显示动画
        setVisibleCount(0);
      }
      // [语法: return false] 表示不需要异步响应
      return false;
    };

    // [语法: addListener] 添加消息监听器
    // [功能] 注册消息监听函数
    chrome.runtime.onMessage.addListener(messageListener);

    // [语法: return cleanup函数] useEffect的清理函数
    // [功能] 组件卸载时移除监听器,避免内存泄漏
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []); // [语法: 空依赖数组[]] 表示这个effect只在组件挂载时运行一次

  // [语法: useEffect] 实现逐条显示的动画效果
  // [功能] 当answers改变时,逐条显示新添加的答案
  useEffect(() => {
    // [语法: if条件] 检查是否还有未显示的答案
    if (visibleCount < answers.length) {
      // [语法: setTimeout] 延迟执行
      // [功能] 每300毫秒显示下一条答案
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1); // [功能] 增加可见答案数量
      }, 300);

      // [功能] 清理定时器,避免内存泄漏
      return () => clearTimeout(timer);
    }
    // [语法: return undefined] 如果没有定时器,返回undefined(满足TypeScript类型要求)
    return undefined;
  }, [visibleCount, answers.length]); // [语法: 依赖数组] 当这些值变化时重新运行effect

  // [功能] 格式化时间戳为可读格式
  // [语法: Date对象] JavaScript的日期对象
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    // [语法: toLocaleTimeString] 将时间转换为本地时间字符串
    return date.toLocaleTimeString('zh-CN');
  };

  // [语法: JSX] JavaScript XML,React的模板语法
  // [功能] 返回组件的UI结构
  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      {/* JSX注释语法 */}
      {/* [功能] 答案列表容器 */}
      <div
        style={{
          padding: '20px',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
        {/* [语法: 三元表达式] condition ? true : false */}
        {/* [功能] 如果没有答案则显示提示信息 */}
        {answers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: isLight ? '#666' : '#aaa',
              fontSize: '16px',
            }}>
            <p>暂无复制的答案</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>点击页面上的"复制答案"按钮后,答案会在这里显示</p>
          </div>
        ) : (
          /* [语法: map方法] 遍历数组渲染列表 */
          /* [功能] 渲染答案列表 */
          answers.map((answer, index) => {
            // [功能] 判断当前答案是否应该显示(实现逐条显示动画)
            const isVisible = index < visibleCount;

            return (
              <div
                key={answer.id} // [语法: key属性] React列表渲染必须的唯一标识
                style={{
                  marginBottom: '16px',
                  padding: '16px',
                  backgroundColor: isLight ? '#fff' : '#374151',
                  borderRadius: '8px',
                  boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.3)',
                  // [CSS: transition] 平滑过渡效果
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  // [功能] 根据isVisible控制显示状态
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
                }}>
                {/* [功能] 答案序号和时间 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: `1px solid ${isLight ? '#e5e7eb' : '#4b5563'}`,
                  }}>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: isLight ? '#1890ff' : '#60a5fa',
                      fontSize: '14px',
                    }}>
                    第 {index + 1} 条答案
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: isLight ? '#999' : '#9ca3af',
                    }}>
                    {formatTime(answer.timestamp)}
                  </span>
                </div>

                {/* [功能] 答案内容 */}
                <div
                  style={{
                    color: isLight ? '#333' : '#e5e7eb',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap', // [CSS: pre-wrap] 保留换行符和空格
                    wordBreak: 'break-word', // [CSS: break-word] 长单词自动换行
                  }}>
                  {answer.content}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// [语法: HOC高阶组件] withErrorBoundary和withSuspense包装组件
// [功能] 添加错误边界和加载状态处理
export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
