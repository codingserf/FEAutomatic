# 前端模板种子项目

## 1. 项目简介
此项目为前端种子项目(FETemplate)，自动化配置基本完成，目前模块化粒度以页面为单位，后期会考虑升级加入更小的模块化开发粒度（如组件）的配置。我们使用了[gulp.js][1](简称gulp)作为前端自动化工具，gulp是构建在[node.js][2]平台上的一整套前端自动化工具平台，有大量的插件可供我们使用。因此，第一次启动此项目前我们需要搭建好自动化环境。

## 2. gulp环境搭建
gulp是node.js平台上的一款工具，因此我们要先安装node.js才能使用它。
### 2.1. 安装node.js
你可以[下载node.js][2]的最新版本，直接安装。
### 2.2. 安装gulp.js
在gulp的github主页查看[详细安装步骤][4]。你不需要关心gulpfile.js的写法，因为我们的种子项目里已经提供了。
这里需要注意的是，我们应该把gulp安装在所有项目的根目录，这样就不用在每个不同的项目创建的时候都安装一遍开发依赖。例如，我有个*projects*的目录，里面放着A、B、C等项目，此时，我就可以进入`cd projects` 然后再执行`install --save-dev gulp`来安装gulp。安装好后，在projects文件夹下会有一个node_modules文件夹。
### 2.3. 安装gulp插件
gulp是插件机制的，一个插件只做一件事，我们需要组合很多插件的功能才能让这个工具强大。下面是我们需要的插件列表：（后面可能写个脚本一键安装）

- **gulp-jshint**  //校验js语法规范
- **gulp-concat**  //连接文件
- **gulp-uglify**  //压缩js
- **gulp-less**  //less 2 css
- **gulp-sass**  //scss 2 css
- **gulp-minify-css**  //压缩css
- **gulp-minify-html**  //压缩html
- **gulp-sourcemaps**  //添加sourcemap
- **gulp-imagemin**  //压缩图片
- **gulp-cache**  //缓存图片，防止重复压缩
- **gulp-plumber**  //防止less编译报错阻断watch
- **gulp-inject**  //替换html里的内容 和inject相似
- **browser-sync**  //mobile debug liveload
- **gulp-replace**  //替换文件内容

你可以通过像`npm install --save-dev gulp-jshint`这样的命令来安装一个插件。由于在第二步我们把gulp安装在了项目根目录，因此以后无论你在任何子目录执行插件安装的语句，插件都会安装到*projects/node_modules*下，供各个项目共用。

## 3. 项目结构
项目结构的管理基于一个基本的前提，即我们在源代码开发环境下可以直接启动页面，要求各资源文件都能正常访问调用，方便我们做本地调试。同时，项目在发布时，也要保证资源文件及接口uri替换为生产环境地址。此处并不建议开发人员进入生产环境，但是线上调试也并非完全不允许。因此我们使用了一些技术和约定来满足上诉要求。
### 3.1. 根目录
项目根目录如下：

![项目根目录][i_projectRoot]

- **[src][git_src]**
  src里放的是我们在开发环境的源代码。

- **[config.js][git_config.js]**
  congig.js是我们的配置文件，里面的的字段可供开发人员根据当前项目的不同自行修改。每个字段都在后面标注了功能说明方便清晰定义。具体请查看[config.js][git_config.js]。
  **注：**大部分公用的库文件都可以在CatfishFE/FE.lib下找到，我们为每个常用的库创建了目录，并在每个目录下按版本创建了目录。如果今后你有新的库，或是新的版本要添到CatfishFE/FE.lib中，也请你遵循这样的目录结构。尽量不要在FE.lib下添加无用的demo和doc文件。

- **[gulpfile.js][git_gulpfile.js]**
  gulpfile.js是gulp工具默认要使用的文件，gulpfile.js中我们预设了多个gulp任务。我们可以在终端里输入相应的命令来执行不同的gulp任务，任何gulp任务的执行都要进入到gulpfile.js所在目录才可生效，gulp工具会自动去寻找当前目录下的gulpfile.js中定义的任务去执行。使用此种子项目的过程中不到万不得已是不需要修改此文件的(如果你对gulp配置感兴趣就另当别论了)，我们的修改接口都开放在config.js文件中。

### 3.2. src目录
src目录结构如下：

![src目录][i_projectSrc]

- **[css][git_src]**
  此目录下存放css预编译文件，如 \*.less或\*.scss，及编译后的css文件，方便开发环境直接调用，release的时候会将此目录下的*.css自动打包压缩。
  值得注意的是：
  1. 我们需要把各个页面专属的css文件直接放在css目录下，并和页面同名，方便后面单独注入到页面。
  2. 此外，任何不想单独注入页面的公用样式文件应该放在css目录下的common文件夹里。并可在[congif.js][git_config.js]中的paths.lib.css中引入。
  3. css目录下的img目录是用来存放css文件中用到的背景图片和Sprite图片的。
  4. maps目录是预编译文件被编译后自动生成的，用来存放[sourcemaps](http://blog.teamtreehouse.com/introduction-source-maps)。

- **[fonts][git_fonts]**
  fonts目录是用来存放页面中用到的字体文件的。我们会在发布时自动检测config.js中的paths.lib.css中是否引用了bootstrap.css并把相应bootsrap目录下的字体文件拷贝到发布目录的fonts文件夹下。而src/fonts文件夹下的字体也会一并发布。

- **[img][git_img]**
  此目录存放html页面代码中直接通过img元素的src引用的图片文件。

- **[js][git_js]**
  此目录下存放页面引用的js文件。和css目录一样，我们也有要注意几点：
  1. 我们需要把各个页面专属的js文件直接放在js目录下，并和页面同名，方便后面单独注入到页面。
  2. 此外，任何不想单独注入页面的公用js文件应该放在js目录下的common文件夹里。并可在[config.js][git_config.js]中的paths.lib.js中引入。

- **[test][git_test]**
  test目录下存放测试中用到的资源。主要二级目录是json。我们会在后端接口还没有完成的情况下，先把约定好的接口数据以json文件的方式放在test/json目录下供测试使用。（未来我们会提供本地的api faker服务器，专做本地测试）
  有以下几点要注意：
  1. json文件的命名应该按约定好的接口名来命名，比如：数据请求接口叫/PosTask/GetArea/ 那么json文件名应该是GetArea.json。如果需要跟不同的参数可以用下划线作为key值，如：GetArea_city.json。
  2. json文件名会在发布的时候自动替换成生产环境的uri。替换规则会根据我们在[config.js][git_config.js]中的设置来，把paths.api.reg匹配的替换成paths.api.rep。

- **[tpl][git_tpl]**
  tpl目前做为预留目录，存放模板文件。

- **[views][git_views]**
  此目录存放视图的html文件。项目使用angularjs时，视图文件存放在此目录中。目录下的结构不做约束，可根据自身项目需要定义。

- **\*.html**
  页面html文件直接放在src目录下，页面文件的命名会关联到它自身单独引用的同名css和js文件。我们的自动注入是依赖于页面html文件的文件名的。

## 4. gulp 命令
我们在gulpfile.js中预设了常用的任务来帮助你减轻从开发到发布的工作。与源代码相关的任务，都会用`src:`作为前缀，与发布相关的，都会用`release:`作为前缀。任何gulp命令在执行时都会依赖你在config.js中的配置。以下是在使用此种子项目时最常用到的命令：

- ####`gulp src:setup`
  此命令会执行两个任务：
  1. 编译css目录下的\*.less和\*.scss，输出\*.css文件。
  2. 注入这些文件和config.js里paths.lib定义的文件列表到页面html相应的位置。
  针对注入，我们需要首先在html文件中标记注入节点，（详细可查看[page1.html][git_page1.html]），代码如下：
  ```
    <!-- inject:lib:css -->
    <!-- endinject -->

    <!-- inject:page:css -->
    <!-- endinject -->

    ....

    <!-- inject:lib:js -->
    <!-- endinject -->

    <!-- inject:page:js -->
    <!-- endinject -->
  ```
  从上面代码的注入节点标记我们应该就能明白相应会注入些什么内容，拿`inject:lib:css`为例，当运行`gulp src:setup`后，此处代码会变为：
  ```
  <!-- inject:lib:css -->
  <link rel="stylesheet" href="../../FE.lib/bootstrap/3.3.4/css/bootstrap.css">
  <link rel="stylesheet" href="../../FE.lib/bootstrap/plugins/timepicker/css/bootstrap-timepicker.css">
  <!-- endinject -->
  ```
  我们可以看到它把config.js里的paths.lib.css中定义的库样式引用注入了。同理，`inject:lib:js`会把paths.lib.js中的引用注入。
  对于`inject:page:css`和`inject:page:js`这两条，会注入相应页面同名的css和js文件，如下：
  ```
  <!-- inject:page:css -->
  <link rel="stylesheet" href="css/page1.css">
  <!-- endinject -->

  ....

  <!-- inject:page:js -->
  <script src="js/page1.js"></script>
  <!-- endinject -->
  ```

- ####`gulp src:watch`
  此命令执行后会监视css目录和js目录下文件的变化。一但css目录下的预编译文件发生变化，它们就会立即被编译；js目录下的代码发生变化后会对其进行jshint校验，错误和警告会打印在终端里。

- ####`gulp debug`
  执行此命令后会自动启动一个本地服务器并在浏览器中打开`http://localhost:3000`，定位到的目录就是我们在config.js中设置的paths.debug.baseDir。
  `gulp debug`命令其实是执行了一个[browsersync](http://www.browsersync.io/)的任务，你可以返回终端查看相应的外部（局域网）访问地址和browsersync的图形操作界面地址。我们可以在手机上通过访问这个debug服务器的外部地址并使用browsersync的*remote debug*功能来进行移动端调试。

- ####`gulp release`
  一键发布的总命令。此命令执行后会根据我们config.js里paths.release.dir中设置的路径在相应的目录下生成整个项目。下图是一个发布后的目录结构(假设我们把项目发布在当前项目的build目录下)：

  ![release目录结构][i_releaseDir]

  我们可以看到相对路径是基本不变的。
  如果你把paths.release.ver设置为true，发布时就会在paths.release.dir目录下生成以config.js中version字段命名的文件夹，相应的整个项目会发布在这个版本文件夹下。
  我们有必要了解下`gulp release`做了些什么事：
  1. 复制文件。包括src/fonts的字体文件，src/views和src/下的html等文件。
  2. 压缩文件。包括src/css，src/js的文本文件，以及src/css/img和src/img下的图片文件，同时为压缩的js代码生成maps，方便生产环境调试。
  3. 注入文件。把src/\*.html中的注入节点，替换成压缩和合并后的文件。

- ####`gulp release:+minhtml`
  它只比`gulp release`多做一件事情，就是在发布时压缩所有html文件，包括page和view。

## 扩展阅读
- [Gulp.js](http://gulpjs.com/)
- [Angular.js](http://docs.angularjs.cn/api)
- [BootStrap](http://v3.bootcss.com/)
- [BrowserSync移动端调试](http://www.codingserf.com/index.php/2015/03/browsersync/)



[1]: http://gulpjs.com/
[2]: https://nodejs.org/
[3]: https://nodejs.org/download/
[4]: https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md

[git_src]: https://github.com/David-CodingSerf/FEAutomatic/tree/master/FETemplate/src
[git_config.js]: https://github.com/David-CodingSerf/FEAutomatic/blob/master/FETemplate/config.js
[git_gulpfile.js]: https://github.com/David-CodingSerf/FEAutomatic/blob/master/FETemplate/gulpfile.js
[git_css]: https://github.com/David-CodingSerf/FEAutomatic/tree/master/FETemplate/src/css
[git_fonts]: https://github.com/David-CodingSerf/FEAutomatic/tree/master/FETemplate/src/fonts
[git_img]: https://github.com/David-CodingSerf/FEAutomatic/tree/master/FETemplate/src/img
[git_js]: https://github.com/David-CodingSerf/FEAutomatic/tree/master/FETemplate/src/js
[git_test]: https://github.com/David-CodingSerf/FEAutomatic/tree/master/FETemplate/src/test
[git_tpl]: https://github.com/David-CodingSerf/FEAutomatic/tree/master/FETemplate/src/tpl
[git_views]: https://github.com/David-CodingSerf/FEAutomatic/tree/master/FETemplate/src/views
[git_page1.html]: https://github.com/David-CodingSerf/FEAutomatic/tree/master/FETemplate/src/page1.html

[i_projectRoot]: https://github.com/David-CodingSerf/FEAutomatic/blob/master/FE.lib/temp/mdpics/projectRoot.png?raw=true
[i_projectSrc]: https://github.com/David-CodingSerf/FEAutomatic/blob/master/FE.lib/temp/mdpics/projectSrc.png?raw=true
[i_releaseDir]: https://github.com/David-CodingSerf/FEAutomatic/blob/master/FE.lib/temp/mdpics/projectRelease.png?raw=true





