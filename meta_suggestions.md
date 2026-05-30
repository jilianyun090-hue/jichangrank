受影响页面（使用重复站点级 description）及建议修复

以下文件检测到与站点默认描述重复或使用通用描述，建议在主题 front-matter 或对应页面源文件中添加单独的 `description` 字段：

- public/index.html
  建议: 2026年权威机场推荐与评测，精选稳定高速 VPN 机场与客户端下载与配置指南，帮助用户在复杂网络环境下稳定访问海外服务与流媒体。

- public/categories/index.html
  建议: 分类总览：汇集本站所有专题与分类（机场推荐、科普、AI教程等），便于按主题快速查找评测、教程与下载资源。

- public/categories/科普/index.html
  建议: 科普指南：从科学上网基础、协议与节点类型到实战配置与常见故障排查，帮助新手快速理解并安全使用科学上网工具。

- public/categories/AI教程/index.html
  建议: AI 教程集合：包含 ChatGPT、Gemini、Grok 等模型的国内访问指南、Prompt 技巧与结合科学上网环境的实践教程，适合开发者与爱好者。

- public/categories/机场介绍/index.html
  建议: 机场介绍分类：解释不同类型的 VPN/机场、适用场景、收费方案和选择建议，帮助用户依据需求快速筛选合适服务。

- 其他受影响页面（建议逐页优化，优先热门页面和流量页）:
  - public/archives/index.html
  - public/archives/page/2/index.html
  - public/archives/page/3/index.html
  - public/archives/page/4/index.html
  - public/categories/科普/page/2/index.html
  - public/categories/AI教程/index.html
  - public/categories/机场介绍/page/2/index.html
  - public/tags/* （多个标签页）

建议步骤：
1. 在源文件（source/ 或文章 front-matter）添加 `description` 字段以保证下次生成生效。
2. 保持每个页面 description 独一无二，长度 110-160 字符为最佳。
3. 对分页（page >1）在模板中追加页码后缀（已修改 `themes/fluid/layout/_partials/head.ejs`）。

我已把最优先的 5 个页面直接更新到 `public/`，下一步可：
- 将这些描述写入源文件（`source/` 或 `_posts`），使构建后不会被覆盖；或
- 我可以继续为更多页面自动生成并应用描述（例如前 50 个流量页面）。
