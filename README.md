# 你的心愿我来圆 · 独立部署版

这是完整静态网站，可部署到 GitHub Pages、校内网站空间或其他支持 HTML/CSS/JavaScript 的静态托管服务。网站运行不依赖 ChatGPT 域名、登录或外部 CDN。

## GitHub Pages 发布

1. 建议使用一个新的活动专用仓库，例如 `wish-2026`。GitHub Free 的 Pages 需使用公开仓库。不要覆盖已有网站的首页。
2. 将此目录下的文件与文件夹全部放到仓库根目录，确保根目录直接包含 `index.html`、`app.js`、`cards.js`、`style.css`、`assets/`、`vendor/` 和 `.nojekyll`。
3. 提交并推送文件。素材文件较多，推荐 GitHub Desktop 或 Git 命令行；GitHub 网页上传每批最多 100 个文件，需要分批。不要只上传 ZIP，GitHub Pages 不会自动解压。
4. 仓库 Settings → Pages → Build and deployment，Source 选择 Deploy from a branch，Branch 选择 main，文件夹选择 /(root)，然后 Save。
5. 等待 GitHub Pages 部署完成，以 Pages 设置页给出的 Visit site 链接为准。项目站点地址通常为 `https://你的用户名.github.io/仓库名/`。
6. 在正式网址点击「分享心愿」，二维码和复制链接会自动使用当前站点地址，不再指向旧域名。
7. 发布后，用手机微信和校园网测试图片、放大、翻页及分享功能。GitHub Pages 在不同中国大陆网络下的访问稳定性不作保证。

官方参考：
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

## 内容维护

字段同步版本：2026-11-06。修改表单文字或图片后，应重新核对并更新卡片信息。正式编号的前三位零须保留（例如 `001`）。

两所学校各 60 份心愿。`cards.js` 中的 `number`、`name`、`grade`、`wish`、`formLabel` 来自官方 WPS 认领表单，页面上的编号为正式问卷编号。`id` 仅用于图片定位和网址 hash，不是问卷编号。照片通过旋转匹配、局部特征和人工复核与表单对应；表单补图存放于 `assets/form-labels/`。正式认领在 [WPS 心愿认领表单](https://f.wps.cn/g/WClEm3ZR/) 完成，网页不展示或推断实时余量与认领状态。

页面分享链接取当前完整网址并移除卡片 hash，因此既支持仓库子目录，也支持 `index.html` 入口。二维码在浏览器本地生成，不会向第三方二维码服务发送网址。直接双击本地 HTML 时不显示二维码；部署后再生成和使用正式分享二维码。当前二维码库适用于一般 ASCII 域名和路径；建议仓库名使用小写英文字母、数字、短横线。

本站不含原有托管平台的项目配置或凭证。二维码库 qrcode-generator 2.0.4 来自 npm，MIT 许可见 vendor/qrcode.LICENSE；保留了作者版权声明。
