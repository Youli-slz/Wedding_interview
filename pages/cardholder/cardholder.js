//var wxSortPickerView = require('../../components/wxSortPickerView/wxSortPickerView.js');
var login = require('../../framework/login/login.js');
var eg = require('../../framework/communication/engine.js');
var constants = require('../../framework/communication/constants.js');
var app = getApp();
var pageNo= 1;    // 获取列表的分页数初始值

Page({

  /**
   * 页面的初始数据
   */
  data: {
    version: app.globalData.version,
    launch: true,
    isBtnClicked: false,
    isCreateCard: false,     // 是否有创建自己的信息
    noMore: false,           // 下拉没有更多
    new_list:[],
    winWidth: null,
    winHeight: null,
    isFirst: false,           // 是否是第一次进入该页面
  },

  // 确保页面不重复跳转
  isClick: function (url) {
    var that = this;
    if (!that.data.isBtnClicked) {
      wx.navigateTo({
        url: url,
      });
      that.setData({
        isBtnClicked: true
      });
      let t = setTimeout(function () {
        that.setData({
          isBtnClicked: false
        });
        clearTimeout(t);
      },500);
    }
  },

  // 每个用户进入小程序都会在列表上显示有官方的一条数据,通过调用获取官方详情信息，保存浏览记录
  getExample: function () {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.GET_CARD_INFO,
      data: {
        cardId: 4,
        userId: app.globalData.userInfo.id
      },
      success: function (res) {
        // console.log(res);
      },
      fail: function (err) {
        console.log(err);
      }
    });
  },

  // 没有创建我的信息， 跳转到创建页面
  toCreate: function (e) {
    var that = this;
    var isnew = e.currentTarget.dataset.isnew
    var url = '../edit/edit?isnew=' + isnew;
    that.isClick(url);
  },

  // 已创建自己的信息，跳转到信息页面
  toMyCard: function () {
    var that = this;
    var url = '../mycard/mycard';
    that.isClick(url);
  },

  // 点击一个名片， 跳转到名片详细信息
  toDesc: function (e) {
    var that = this;
    var url = '../carddesc/carddesc?cardId='+ e.currentTarget.dataset.cardid;
    that.isClick(url);
  },

  // 获取我的信息
  getMyCard: function () {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.MY_CARD_INFO,
      data: {
        userId: app.globalData.userInfo.id     // 名片ID
      },
      success: function (res) {
        if(res.length > 0) {
          that.setData({
            isCreateCard: true
          });
        } else {
          that.setData({
            isCreateCard: false
          });
        }
      },
      fail: function (err) {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 1500
        });
      } 
    })
  },

  // 判断职位的icon是哪个
  bindJobIcon: function (e) {
    var that = this;
    var inp = e.professional;
    for(var i= 0; i< app.globalData.icons.length; i++){
      if(app.globalData.icons[i].name == inp){
        e.icon = app.globalData.icons[i].icon;
        return e;
      }
    }
    // switch(inp){
    //   case '婚庆':
    //     e.icon="https://oss.ririyuedu.com/hunqing.png";
    //     break;
    //   case '司仪':
    //     e.icon="https://oss.ririyuedu.com/siyi.png";
    //     break;
    //   case '摄影':
    //     e.icon="https://oss.ririyuedu.com/shexiang.png";
    //     break;
    //   case '摄像':
    //     e.icon="https://oss.ririyuedu.com/paizhao.png";
    //     break;
    //   case '跟妆':
    //     e.icon="https://oss.ririyuedu.com/meizhuang.png";
    //     break;
    //   case '婚纱':
    //     e.icon="https://oss.ririyuedu.com/hunsha.png";
    //     break;
    //   case '婚宴':
    //     e.icon="https://oss.ririyuedu.com/hunyan.png";
    //     break;
    //   case '婚车':
    //     e.icon="https://oss.ririyuedu.com/hunche.png";
    //     break;
    //   case '甜点':
    //     e.icon="https://oss.ririyuedu.com/tiandian.png";
    //     break;
    //   case '鲜花':
    //     e.icon="https://oss.ririyuedu.com/xianhua.png";
    //     break;
    //   case '策划':
    //     e.icon="https://oss.ririyuedu.com/cehua.png";
    //     break;
    //   default:
    //     e.icon="https://oss.ririyuedu.com/hunqing.png";
    //     break;
    // }
    // return e;
  },

  //获取婚礼人列表
  cardList: function () {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.GET_CARD_LIST,
      data: {
        userId: app.globalData.userInfo.id,
        pageNo: pageNo,                 // 分页数
        pageSize: 10               // 偏移量
      },
      success: function (res) {
        if (res.length == 0) {
          pageNo --;
          that.setData({
            noMore: true
          });
        } else if (res.length == 0 && pageNo == 1){
          pageNo = 1;
        } else {
          for(var i = 0; i < res.length; i++) {
            res[i]=that.bindJobIcon(res[i]);
            that.data.new_list.push(res[i]);
          }
          that.setData({
            new_list:  that.data.new_list 
          });
        }
      }, 
      fail: function(err) {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 1500
        })
      }
    })
  },

  // 点击分享跳转到详情页面
  shareToDesc: function (id) {
    var that = this;
    var url = '../carddesc/carddesc?cardId=' + id;
    that.isClick(url);
  },

  //获取设备基本信息
  getwindowinfo: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        })
      }
    })
  },

  // 跳转到婚礼包小程序
  toMini: function () {
    wx.navigateToMiniProgram({
      appId:'wx1e16505b46f55fc3',
      path: 'pages/index/index',
      extraData:{
        foo: 'bar'
      },
      envVersion: 'release',
      success(res) {
        console.log(res);
      }
    })
  },

  // 页面初始化
  pageInit: function () {
    this.getMyCard();
    if(!this.data.isFirst){
      this.cardList();
      console.log('pageInit 中获取的列表');
    }
    this.getwindowinfo();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    var that = this;
    that.getExample();
    if (login.isLogin(that.pageInit)) {
      that.pageInit();
    }
    if(options.isShare){     // 判断是否是从分享跳转过来的
      that.shareToDesc(options.cardId);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(this.data.winWidth);
    // if(app.globalData.userInfo != null) {
      // this.getMyCard();
      this.getwindowinfo();
      if(!this.data.isCreateCard) {
        this.getMyCard();
      }
      if(this.data.isFirst){
        // this.setData({
          this.data.new_list = [];
        // });
        this.cardList();
      }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
      this.data.isFirst = true;
      this.data.noMore = false;
      pageNo = 1;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(!this.data.noMore) {
      pageNo ++;
      this.cardList();
    }
    console.log()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  }
})