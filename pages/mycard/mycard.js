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
    isEmpty: false,            // 判断是否是第一次进入，是否有‘我的’信息
    isBtnClicked: false,       // 判断按钮是否点击
    isLick: false,             // 是否点赞
    noMore: false,             // 是否有更多的动态
    curr_id: null,             // 当前点击的视频的id
    isShow: false,             // 是否是从onshow页面显示图片
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
      collect: null,

    },
    dynamicList:[]             // 所有的动态信息
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

  // 确保页面不重复跳转
  isClick: function (url) {
    var that = this;
    if(!that.data.isBtnClicked) {
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

  // 跳转到创建名片页面或编辑名片页面
  createCard: function (e) {
    var that = this;
    var isnew = e.currentTarget.dataset.isnew;
    var url = '../edit/edit?isnew=' + isnew;     //0：是创建名片 1：是编辑个人信息
    that.isClick(url);
  },

  // 跳转到发动态的页面
  shareWith: function () {
    var that = this;
    var url = '../sharestatus/sharestatus?cardId=' + that.data.cardInfo.id;
    that.isClick(url);
  },

  // 点赞和取消点赞
  lick: function () {
    var that = this;
    var status = 1;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.CLICK_LICK,
      data: {
        cardId: that.data.cardInfo.id,
        userId: app.globalData.userInfo.id,
        status: status
      },
      success: function (res) {
        console.log(res)
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

  // 获取设备信息
  getWindowInfo: function () {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        })
      }
    })
  },

  // 获取我的名片信息
  getMyCardInfo: function () {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.MY_CARD_INFO,
      data: {
        userId: app.globalData.userInfo.id         // 名片ID
      },
      success: function (res) {
        // res[0] = that.bindJobIcon(res[0]);
        that.setData({
          cardInfo: res[0]
        })
        if(!that.data.isShow){
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

  // 点击电话号码，拨号
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

  //预览图片
  previewImg: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.img,           // 当前显示图片的http链接
      urls: e.currentTarget.dataset.imglist.picList               // 需要预览的图片http链接列表
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
          for(var i=0; i< res.length; i++) {
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
        }else {
          pageNo--;
          that.setData({
            noMore: true
          })
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
        if(that.data.dynamicList[i].is_click == 1){
          that.data.dynamicList[i].is_click = 0;
          that.data.dynamicList[i].lick = that.data.dynamicList[i].lick-1;
          that.data.cardInfo.lick--;
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
    console.log('[点赞请求的状态]:',status)
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

  // 确认是否删除动态
  IsDelectDynamic: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除?',
      success: function(res) {
        if (res.confirm) {
          that.delectDynamic(e);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 删除动态
  delectDynamic: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.dynamic;
    var index;
    for(var i=0; i < that.data.dynamicList.length; i++) {
      if(that.data.dynamicList[i].id == id) {
        index = i;
      }
    }
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.DELDYNAMIC,
      data:{
        dynamicId: parseInt(id),
      },
      success: function (res) {
        that.data.dynamicList.splice(index, 1);
        that.setData({
          dynamicList: that.data.dynamicList,
        })
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

  //获取该名片的二维码
  getQRCode: function () {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.GET_QRCODE,
      data: {
        cardId: that.data.cardInfo.id,
      },
      success: function (res) {
        that.saveCodePic(res.url);
      },
      fail: function (err) {
        wx.showToast({
          title: err.msg,
          icon: 'none',
          duration: 1500
        })
      }
    })
  },

  // 保存用户名片二维码
  saveCodePic: function (url) {
    var img_url = url;   //url
    var img_list=[]
    img_list.push(img_url);
    // console.log('[QRCode]:'+url);
    wx.previewImage({            // 在点击二维码时先展示并保存到手机相册
      current: img_url,          // 当前显示图片的http链接
      urls: img_list             // 需要预览的图片http链接列表
    })

    wx.downloadFile({
      url: img_url,
      success: function (res) {
        console.log(res);
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            wx.showToast({
              title: '保存到本地相册',
              icon: 'none',
              duration: 1500
            })
          },
          fail: function (res) {
            wx.showToast({
              title: err.msg,
              icon: 'none',
              duration: 1500
            })
          }
        })
      },
      fail: function (err) {
        console.log(err);
      }
    })
  },

  // 页面初始化
  pageInit: function () {
    this.getWindowInfo();                   // 初始化:获取设备信息
    this.getMyCardInfo();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    pageNo = 1;
    // this.getWindowInfo();
    if (login.isLogin(this.pageInit)) {     // 判断是否登录，若没有登录，登录完成后调用pageInit
      this.pageInit();                      // 如果已经登录，页面直接初始化
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getMyCardInfo();
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
      pageNo ++;
      this.getDynamicList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我是婚礼人 : ' + this.data.cardInfo.name,
      path: '/pages/cardholder/cardholder?cardId=' + this.data.cardInfo.id + '&isShare=true',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        console.log(res)
      }
    }
  }
})