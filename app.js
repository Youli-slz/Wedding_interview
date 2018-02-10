var login = require('./framework/login/login.js');
var eg = require('./framework/communication/engine.js');

App({
  onLaunch: function (options) {
    console.log("[onLaunch] 场景值:", options.scene)
    var that = this;
    //用户登录
    login.login({
      success: function (res) {
        that.globalData.userInfo = res;  //获取全局user info
        console.log(res);
        eg.init();   //框架初始化
        eg.setTimeoutInterval(6000);   //设置框架超时时间
      }
    });
  },

  onHide: function (options) {
    eg.clear();   // 清理(关闭 web socket 链接等)
  },

  onShow: function (options) {
    eg.init();     // 重新初始化
  },

  globalData: {
    userInfo: null,
    version: '1.0.5',
    icons:[
      {name:"策划",icon:'https://oss.ririyuedu.com/cehua.png'},       // 策划
      {name:"婚车",icon:'https://oss.ririyuedu.com/hunche.png'},      // 婚车
      {name:"婚庆",icon:'https://oss.ririyuedu.com/hunqing.png'},     // 婚庆
      {name:"婚纱",icon:'https://oss.ririyuedu.com/hunsha.png'},      // 婚纱
      {name:"婚宴",icon:'https://oss.ririyuedu.com/hunyan.png'},      // 婚宴
      {name:"跟妆",icon:'https://oss.ririyuedu.com/meizhuang.png'},   // 跟妆
      {name:"摄像",icon:'https://oss.ririyuedu.com/paizhao.png'},     // 摄像
      {name:"摄影",icon:'https://oss.ririyuedu.com/shexiang.png'},    // 摄影
      {name:"司仪",icon:'https://oss.ririyuedu.com/siyi.png'},        // 司仪
      {name:"甜点",icon:'https://oss.ririyuedu.com/tiandian.png'},    // 甜点
      {name:"鲜花",icon:'https://oss.ririyuedu.com/xianhua.png'},     // 鲜花
    ]
  }
})