var eg = require('../framework/communication/engine.js');
var constants = require('../framework/communication/constants.js');
var qiniu = require('./qiniu-sdk/sdk/qiniuUploader.js')

// 获取token值
function getUpToken(options) {
    if(typeof(options.failure) != "function" ){
        options.failure = function noop() { };
    } else if ( !options.type) {
        options.type = 'image'
    }
    eg.rpc({
        serverName: constants.QINIU_SERVER_NAME,
        methodName: '1',                              // 上传图片没有methodName 但必须要有，所以随便写一个
        data:{
            action_name: 'upload_token',
            data:'upload_token'
        },
        success: function (data) {
           var uptoken = data.token;
           if(options.type == 'image'){
              upLoadImg(options.type, uptoken, options.filePaths, options.success, options.failure);
           } else {
              upLoadVideo(options.type, uptoken, options.filePaths, options.success, options.failure);
           }
        },
        failure: function (err) {
            console.log(err);
        }
    })
}

// 上传图片到七牛
function upLoadImg(
    type,                 // 上传文件类型
    uptoken,              // token值
    filePaths,            // 文件路径
    success,              // 上传成功后方法
    failure               // 上传失败后方法
) {
    var that = this;
    for (var i = 0; i < filePaths.length; i++) {
        var filePath = filePaths[i];
        qiniu.upload(type,filePath, (res) => {
            if (typeof (success) == "function") {
                success(res);
            }
        }, (error) => {
            failure('error' + error);
        }, {
            region: 'ECN',
            domain: 'https://oss.ririyuedu.com',
            key: '',
            uptoken: uptoken,
        });
    }
}

function upLoadVideo (
    type,
    uptoken,
    filePath,
    success,
    failure
) {
    var that = this;
        qiniu.upload(type,filePath, (res) => {
            if (typeof (success) == "function") {
                success(res);
            }
        }, (error) => {
            failure('error' + error);
        }, {
                region: 'ECN',
                domain: 'https://oss.ririyuedu.com',                              // bucket域名， 下载资源时用到
                key: '',                                 // key自定义文件，【非必须】如果不设置，默认为使用微信小程序API的临时文件名，
                //一下方法三选一， 优先级为 utoken > uptokenURL > uptokenFunc  
                uptoken: uptoken,                    // 由其他程序生成七牛
                // uptokenURL: 'url',                               // 从指定url通过HTTP GET获取uptoken, 返回的格式必须是json 且包含uptoken字段， 例如： {"uptoken": "[yourTokenString]"}
                // uptokenFunc: function() {return '[yourtokenString]';}
            });
}

module.exports = {
    upLoad: getUpToken,
}