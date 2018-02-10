var qiniu = require('../../static/qiniu_upload.js'); 
var login = require('../../framework/login/login.js');
var eg = require('../../framework/communication/engine.js');
var constants = require('../../framework/communication/constants.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    len:null,
    picOrVideo:[],                    // 发送的动态的图片或者视频
    fileType: 'image',                // 要发表的文件类型， 'image' ， 'video'
    chooseMethod: ['图片', '视频'],    // 选择要发布的文件是图片还是文字
    cardId: null,
    content: '',                      // 发送的动态的文字内容
    isBtnClicked: false,              // 判断按钮是否点击                      
  },

  // 确保页面不重复跳转
  isClick: function (url) {
    var that = this;
    if (!that.data.isBtnClicked) {
      wx.navigateTo({
        url: url
      })
      that.setData({
        isBtnClicked: false
      })
      let t = setTimeout(function () {
        that.setData({
          isBtnClicked: false
        })
        clearTimeout(t);
      }, 500);
    }
  },

  // 选择上传图片还是视频
  bindPickerChange: function (e) {
    var that = this;
    var value = e.detail.value;
    if (value == 0) {
      that.addImage();
      that.setData({
        fileType:'image'
      })
    } else {
      that.addVideo();
      that.setData({
        fileType: 'video'
      })
    }
  },

  // 添加图片
  addImage: function () {
    var that = this;
    that.setData({
      chooseMethod: ['图片']
    })
    wx.chooseImage({
      sizeType: ["original","compressed"],
      sourceType: ["album","camera"],
      success: function (res){
        qiniu.upLoad({
          type: 'image',
          filePaths: res.tempFilePaths,
          success: function (res) {
            console.log(res.imageURL);
            that.data.picOrVideo.push(res.imageURL);
            that.data.len = that.data.picOrVideo.length;
            that.setData({
              picOrVideo: that.data.picOrVideo,
              len: that.data.len
            })
          },
          failure: function (err) {
            console.log(err)
          }
        })
      },
      fail: function (err) {
        that.checkAdd();
      }
    })
  },

  //添加视频
  addVideo: function () {
    var that = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        qiniu.upLoad({
          type: 'video',
          filePaths: res.tempFilePath,
          success: function (res) {
            // console.log(res);
            that.data.picOrVideo.push(res.imageURL);
            that.setData({
              picOrVideo: that.data.picOrVideo,
              len: that.data.picOrVideo.length
            })
          }
        })
      },
      fail: function (res) {
        that.setData({
          len: 0,
          fileType: 'image'
        })
      }
    })
  },

  //当已经选择了图片时，在选择增加按钮只能选择添加图片
  checkAdd: function (e) {
    var that = this;
    if(that.data.fileType == 'image' && that.data.picOrVideo.length != 0) {
      that.setData({
        chooseMethod: ['图片']
      })
    } else{
      that.setData({
        chooseMethod: ['图片','视频']
      })
    }
    that.bindPickerChange(e)
  },

  // 删除添加图片或者是视频
  delPic: function (e) {
    var that = this;
    that.data.picOrVideo.splice(e.target.dataset.index,1);
    if(that.data.fileType == 'image') {
      that.setData({
        picOrVideo: that.data.picOrVideo,
        len: that.data.picOrVideo.length
      })
    } else {
      that.setData({
        fileType: 'image',
        picOrVideo: that.data.picOrVideo,
        len: that.data.picOrVideo.length
      })
    }
    if(that.data.picOrVideo.length == 0) {
      that.setData({
        chooseMethod: ['图片', '视频']
      })
    }

  },

  // 获取输入的数据
  getInputData: function (e) {
    var that = this;
    that.data.content = e.detail.value;
  },

  //判断发送的内容
  JudgeContent: function () {
    var that = this;
    if(!that.data.content && that.data.picOrVideo.length == 0) {
      wx.showToast({
        title: '请输入要发表的内容',
        icon: 'none',
        duration: 1500
      })
    } else {
      that.Publication();
    } 
  },

  // 发表动态
  Publication: function () {
    var that = this;
    var pic={picList: that.data.picOrVideo, type: that.data.fileType}
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.NEW_DYNAMIC,
      data: {
        cardId: that.data.cardId,
        content: that.data.content,
        pic: JSON.stringify(pic)
      },
      success: function (res) {
        // wx.showToast({
        //   title: '发表成功',
        //   icon: 'none',
        //   duration: 1500
        // })
        that.toDesc();
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

  //发表成功后跳转到回原来页面
  toDesc: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  // 页面初始化
  pageInit: function () {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options.cardId);
    that.setData({
      cardId: parseInt(options.cardId)
    })
    if(login.isLogin(that.pageInit)) {
      that.pageInit();
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})