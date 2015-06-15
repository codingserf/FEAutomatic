module.exports = {
    "version": "v0.0.1", //项目版本号
    "paths": { //各种路径
        "lib": { //库路径，你可以在CatfishFE/FE.lib下找到大部分你需要的库
            "css": [ //CSS库路径
                "../FE.lib/bootstrap/3.3.4/css/bootstrap.css",
                "../FE.lib/bootstrap/plugins/timepicker/css/bootstrap-timepicker.css"
                /*"src/css/common/common.css" //可把公用样式统一打包为lib.css*/
            ],
            "js": [ //JS库路径
                "../FE.lib/jquery/1.11.1/jquery.min.js",
                "../FE.lib/bootstrap/3.3.4/js/bootstrap.js",
                "../FE.lib/bootstrap/plugins/timepicker/js/bootstrap-timepicker.js",
                "../FE.lib/angular/1.3.9/angular.min.js",
                "../FE.lib/angular/1.3.9/angular-route.min.js",
                "../FE.lib/angular/1.3.9/angular-touch.min.js",
                "../FE.lib/angular/plugins/w5c-validator/w5cValidator.js",
                /*"src/js/common/app.js" //可把公用js统一打包为lib.js*/
            ]
        },
        "release": { //发布路径
            "dir": "./build/", //!不要忘记最后的斜杠
            "ver": false, //是否要在发布目录下创建版本目录
            "rev": true /*
                            是否创建rev文件版本。我们会在静态资源文件名后追加version和随机rev的信息，
                            静态资源包括压缩后的公共js和css以及独立页面的js和css，还有存放视图模板html文件的views文件夹
                            追加rev信息如：lib-v0.0.1.569089.js 或/views-v0.0.1.569089/
                            rev的目的是灰度发布和清除客户端浏览器缓存
                        */
        },
        "api": { //接口路径
            "reg": /test\/json\/([A-Za-z0-9]+)_?.*\.json/g, //测试接口匹配正则
            "rep": "/POSTask/$1" //正式接口替换字符串
        },
        "debug": { //debug服务器路径
            "baseDir": "../", //相对根目录，即http://localhost指向的目录
            "proxy": "" //代理uri
        }
    }
}