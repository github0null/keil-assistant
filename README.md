# Keil Assistant

[![](https://vsmarketplacebadge.apphb.com/version/CL.keil-assistant.svg)](https://marketplace.visualstudio.com/items?itemName=CL.keil-assistant)      [![](https://vsmarketplacebadge.apphb.com/installs/CL.keil-assistant.svg)](https://marketplace.visualstudio.com/items?itemName=CL.keil-assistant)     [![](https://vsmarketplacebadge.apphb.com/downloads/CL.keil-assistant.svg)](https://marketplace.visualstudio.com/items?itemName=CL.keil-assistant)     [![](https://vsmarketplacebadge.apphb.com/rating/CL.keil-assistant.svg)](https://marketplace.visualstudio.com/items?itemName=CL.keil-assistant)

## [English](./README_EN.md)

## 简述 📑

vscode 上的 Keil 辅助工具，与 c/c++ 插件配合使用.

能够为 Keil 项目提供 语法高亮、代码片段 的功能，并支持对 keil 项目进行 编译、下载。

**仅支持 Keil uVison 5 及以上版本**  

**仅支持 Windows 平台**

![preview](./res/preview/preview.png)

***

## 功能特性🎉

- 加载 Keil C51/ARM 项目，并以 Keil 项目资源管理器的展示方式显示项目视图
- 自动感知 keil 项目文件的变化，及时更新项目视图
- 通过调用 Keil 命令行接口实现 编译，重新编译，烧录 keil 项目
- 自动生成 c_cpp_properties.json 文件，使 C/C++ 插件的语法分析能正常进行

***

## 用法 📖

### 准备工作

1. 安装 C/C++ 插件
>
2. 进入 Keil-Assistant 插件设置，设置好 keil 可执行文件 UV4.exe 的绝对路径
 ![setting](./res/preview/setting.png)

***

### 开始 🏃‍♀️

1. 在 Keil 上创建好项目，添加好文件，头文件路径等
> 
2. 点击 **打开项目** 图标 或者 **使用 vscode 直接打开 keil 项目文件(.uvproj) 所在的目录**，插件会自动加载 keil 项目；
 ![load](./res/preview/load.png)

3. 点击源文件开始你的代码编辑，点击 build/rebuild 按钮完成项目的编译/重新编译
 ![rebuild](./res/preview/rebuild.png)

4. 点击目标名称在多个 c/c++ 配置中切换
 ![cpp_config](./res/preview/cpp_config.png)

5. 点击项目的切换按钮，可以在多个 Keil Target 之间切换
 ![active_target](./res/preview/active_target.png)

6. 在编译完成后，可以点击源文件项的箭头图标展开其引用（仅支持 MDK 项目）
 ![show_referance](./res/preview/ref_show.png)

***

### 其他设置

- 插件设置：项目排除列表(`KeilAssistant.Project.ExcludeList`)
 当某个目录下存在多个 keil 项目时，使用插件打开该目录，插件会加载所有的 keil 项目，通过此选项，可以指定需要排除哪些 keil 项目，防止在打开该工作区时自动加载该项目
 **默认的排除列表**：
  ```json
  [
      "template.uvproj",
      "template.uvprojx"
  ]
  ```