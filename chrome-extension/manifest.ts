import { readFileSync } from 'node:fs';
import type { ManifestType } from '@extension/shared';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

/**
 * @prop default_locale
 * if you want to support multiple languages, you can use the following reference
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
 *
 * @prop browser_specific_settings
 * Must be unique to your extension to upload to addons.mozilla.org
 * (you can delete if you only want a chrome extension)
 *
 * @prop permissions
 * Firefox doesn't support sidePanel (It will be deleted in manifest parser)
 *
 * @prop content_scripts
 * css: ['content.css'], // public folder
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  name: '__MSG_extensionName__', // [语法: __MSG_] i18n占位符，实际名称在 messages.json 中定义 (key: extensionName)
  browser_specific_settings: {
    gecko: {
      id: 'example@example.com',
      strict_min_version: '109.0',
    },
  },
  version: packageJson.version,
  description: '__MSG_extensionDescription__', // [语法: __MSG_] i18n占位符，实际描述在 messages.json 中定义 (key: extensionDescription)
  host_permissions: ['https://www.zhihu.com/*'], // [修改] 限制主机权限，仅允许访问知乎域名
  permissions: ['storage', 'scripting', 'tabs', 'notifications', 'sidePanel'],
  options_page: 'options/index.html',
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_popup: 'popup/index.html',
    default_icon: 'icon-34.png',
  },
  // chrome_url_overrides: {
  //   newtab: 'new-tab/index.html',
  // },
  icons: {
    '128': 'icon-128.png',
  },
  content_scripts: [
    {
      matches: ['https://www.zhihu.com/question/*'], // [修改] 仅在知乎问答详情页注入脚本 (ID为通配符)
      js: ['content/all.iife.js'],
    },
    {
      matches: ['https://example.com/*'],
      js: ['content/example.iife.js'],
    },
    // {
    //   matches: ['https://www.zhihu.com/question/*'], // [修改] 仅在知乎问答详情页注入UI脚本
    //   js: ['content-ui/all.iife.js'],
    // },
    {
      matches: ['https://example.com/*'],
      js: ['content-ui/example.iife.js'],
    },
    {
      matches: ['https://www.zhihu.com/question/*'], // [修改] 仅在知乎问答详情页注入CSS样式
      css: ['content.css'],
    },
  ],
  devtools_page: 'devtools/index.html',
  web_accessible_resources: [
    {
      resources: ['*.js', '*.css', '*.svg', 'icon-128.png', 'icon-34.png'],
      matches: ['*://*/*'],
    },
  ],
  side_panel: {
    default_path: 'side-panel/index.html',
  },
  // [知识点: CSP 内容安全策略] Content Security Policy,用于控制扩展可以加载的资源
  // [功能] 允许开发环境下的HMR热更新功能通过WebSocket连接
  // [注意] 生产环境不需要此配置,可以根据环境动态添加
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'; connect-src 'self' ws://localhost:8081;",
  },
} satisfies ManifestType;

export default manifest;
