var login = require('../../framework/login/login.js');
var eg = require('../../framework/communication/engine.js');
var constants = require('../../framework/communication/constants.js');
var app = getApp();
var pageNo = 1;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    winWidth: null,            // 设备可用宽度
    winHeight: null,           // 设备可用高度
    isLick: false,             // 是否点赞
    cardId: null,              // 点击的婚礼的cardId
    noMore: false,             // 是否有更多的动态
    curr_id:null,              // 当前点击的视频的id
    isShow: false,              // 当第一次进入页面获取玩动态列表信息后，就不通过cardinfo方法调用
    cardInfo:{                 // 该名片的基本信息
      id:null,
      name: '',
      pic:'',
      phone: '',
      professional: '',
      accessment: '',
      year: '',
      company: '',
      site: '',
      fame: null,
      lick: null,
      collect: null
    },
    dynamicList:[]               // 所有的动态信息
  },

  // 点击视频
  videoPlay: function (e) {
    var that = this;
    that.setData({
      curr_id: e.currentTarget.dataset.id
    })
    that.videoContext.play();
  },

  // 播放到末尾
  videoEnd: function (e) {
    var that = this;
    that.setData({
      curr_id: null
    })
  },

  // 点击电话，拨号
  callPhone: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },

  // 打开地图查看
  openMap: function () {
    var that = this;
    if(!that.data.cardInfo.latitude && !that.data.cardInfo.longitude){
      wx.showToast({
        title: '暂时没有地址',
        icon: 'none',
        duration: 1500
      })
    } else {
      wx.openLocation({
        latitude: that.data.cardInfo.latitude,
        longitude: that.data.cardInfo.longitude,
        name: that.data.cardInfo.site,
        scale: 28
      })
    }
  },

  // 获取设备信息
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

  // 获取他人的名片信息
  getCardInfo: function() {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.GET_CARD_INFO,
      data: {
        cardId: parseInt(that.data.cardId),     // 从列表页面获取到的当前婚礼人信息的id
        userId: app.globalData.userInfo.id
      },
      success: function (res) {
        // res = that.bindJobIcon(res);
        that.setData({
          cardInfo: res,
        });
        if(!that.data.isShow) {
          that.getDynamicList();
          that.data.isShow = true;
        }
      },
      fail: function (err) {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 1500
        })
      }
    })
  },

  // 点赞和取消点赞
  lick: function (e) {
    var that = this;
    var value = e.currentTarget.dataset.islick;
    var status = 1;
    if (value == 1) {
      status = 2;
    } else {
      status = 1;
    }
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.CLICK_LICK,
      data: {
        cardId: that.data.cardInfo.id,
        userId: app.globalData.userInfo.id,
        status: status
      },
      success: function (res) {
        if(status == 2) {
          that.data.cardInfo.is_lick = 0;
          that.data.cardInfo.lick --;
          that.setData({
            cardInfo: that.data.cardInfo
          })
        } else {
          that.data.cardInfo.is_lick = 1;
          that.data.cardInfo.lick ++;
          that.setData({
            cardInfo: that.data.cardInfo
          })
        }
      },
      fail: function (err) {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 1500,
        })
      }
    })
  },

  // 获取动态列表
  getDynamicList: function () {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.GET_DYNAMIC_LIST,
      data: {
        cardId: that.data.cardInfo.id,
        userId: app.globalData.userInfo.id,
        pageNo: pageNo,
        pageSize: 10
      },
      success: function (res) {
        if(res.length > 0) {
          for(var i = 0; i < res.length; i++) {
            res[i].pic = JSON.parse(res[i].pic);
            res[i].create_at = that.convert_time(res[i].create_at);
            that.data.dynamicList.push(res[i]);
          }
          that.setData({
            dynamicList: that.data.dynamicList
          })
        } else if (res.length == 0 && pageNo == 1) {
          pageNo = 1;
          that.setData({
            noMore: true
          })
        } else {
          pageNo--;
          that.setData({
            noMore: true
          })
        }
      },
      fail: function (err){
        wx.showToast({
          title:err.message,
          icon:'none',
          duration: 1500
        })
      }
    })
  },

  // 时间戳转换为时间
  convert_time: function (t) {
    var time;
    var timeL = {
      month: null,
      day: null,
      time: null
    }
    var date = new Date(t*1000);
    var year = date.getFullYear();
    timeL.month = this.addZero(date.getMonth() + 1);
    timeL.day = this.addZero(date.getDate());
    var hour = this.addZero(date.getHours());
    var minute = this.addZero(date.getMinutes());
    timeL.time = hour+ ':' + minute;

    return timeL;
  },

  // 将一位的数字转换成前面加0
  addZero: function (temp) {
    if(temp < 10) {
      return '0' + temp;
    } else {
      return temp;
    }
  },

  // 动态信息点赞(无关请求)
  lickDynamic: function (e) {
    var that = this;
    var value = e.currentTarget.dataset;
    for (var i = 0; i< that.data.dynamicList.length; i++) {
      if(that.data.dynamicList[i].id == value.dynamicid) {
        if(that.data.dynamicList[i].is_click == 1){      // 判断是否有点赞
          that.data.dynamicList[i].is_click = 0;
          that.data.dynamicList[i].lick = that.data.dynamicList[i].lick-1;   //更具点赞修改点赞数
          that.data.cardInfo.lick--;       // 该名片总的点赞数更具点赞修改点赞数
          that.setData({
            cardInfo: that.data.cardInfo
          })
        } else {
          that.data.dynamicList[i].is_click = 1;
          that.data.dynamicList[i].lick = that.data.dynamicList[i].lick+1;
          that.data.cardInfo.lick++;
          that.setData({
            cardInfo: that.data.cardInfo
          })
        }
        that.setData({
          dynamicList: that.data.dynamicList
        })
      }
    }
  },

  // 动态信息点赞（有请求）
  reqLickDynamic: function (e) {
    var that = this;
    var dynamicV = e.currentTarget.dataset;
    var status;
    if(dynamicV.islick == 1){
      status = 2;
    } else {
      status = 1;
    }
    console.log('[动态请求状态]:',status);
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.CLICK_LICK_DYNAMIC,
      data: {
        dynamicId: parseInt(dynamicV.dynamicid),
        userId: app.globalData.userInfo.id,
        cardId: that.data.cardInfo.id,
        status: status
      },
      success: function (res) {
        that.lickDynamic(e);
      },
      fail: function (err) {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 1500
        })
      }
    })
  },

  //预览图片
  previewImg: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.img,           // 当前显示图片的http链接
      urls: e.currentTarget.dataset.imglist.picList               // 需要预览的图片http链接列表
    })
  },

  // 跳转到婚礼宝小程序
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

  // 判断职位的icon是哪个
  bindJobIcon: function (e) {
    var that = this;
    var inp = e.professional;
    switch(inp){
      case '婚庆':
        e.icon="https://oss.ririyuedu.com/hunqing.png";
        break;
      case '司仪':
        e.icon="https://oss.ririyuedu.com/siyi.png";
        break;
      case '摄影':
        e.icon="https://oss.ririyuedu.com/shexiang.png";
        break;
      case '摄像':
        e.icon="https://oss.ririyuedu.com/paizhao.png";
        break;
      case '跟妆':
        e.icon="https://oss.ririyuedu.com/meizhuang.png";
        break;
      case '婚纱':
        e.icon="https://oss.ririyuedu.com/hunsha.png";
        break;
      case '婚宴':
        e.icon="https://oss.ririyuedu.com/hunyan.png";
        break;
      case '婚车':
        e.icon="https://oss.ririyuedu.com/hunche.png";
        break;
      case '甜点':
        e.icon="https://oss.ririyuedu.com/tiandian.png";
        break;
      case '鲜花':
        e.icon="https://oss.ririyuedu.com/xianhua.png";
        break;
      case '策划':
        e.icon="https://oss.ririyuedu.com/cehua.png";
        break;
      default:
        e.icon="https://oss.ririyuedu.com/hunqing.png";
        break;
    }
    return e;
  },

  //页面初始化
  pageInit: function () {
    this.getwindowinfo();
    this.getCardInfo();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cardId: options.cardId
    })
    if (login.isLogin(this.pageInit)) {
      this.pageInit();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
      pageNo++;
      this.getDynamicList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      //俩字页面内转发按钮
      console.log(res.target);
    }
    return {
      title: '我是婚礼人 : ' + this.data.cardInfo.name,
      path: '/pages/cardholder/cardholder?cardId=' + this.data.cardInfo.id + '&isShare=true' ,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})