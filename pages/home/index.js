import Message from 'tdesign-miniprogram/message/index';
import request from '~/api/request';

// 获取应用实例
// const app = getApp()

Page({
  data: {
    enable: false,
    swiperList: [],
    secondHandList: [],
    subletList: [],
    activityList: [],
    cardInfo: [],
    currentCity: '伦敦', // 默认城市
    // 发布
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
  },
  // 生命周期
  async onReady() {
    const [cardRes, swiperRes] = await Promise.all([
      request('/home/cards').then((res) => res.data),
      request('/home/swipers').then((res) => res.data),
    ]);
  
    const allCards = cardRes.data;
  
    this.setData({
      cardInfo: cardRes.data,
      secondHandList: allCards.slice(1, 2),
      subletList: allCards.slice(2, 3),
      activityList: allCards.slice(3, 4),
      swiperList: swiperRes.data,
    });
  }  ,
  onLoad(option) {
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight;
  
    this.setData({
      statusBarHeight: statusBarHeight,
    });
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }
    if (option.oper) {
      let content = '';
      if (option.oper === 'release') {
        content = '发布成功';
      } else if (option.oper === 'save') {
        content = '保存成功';
      }
      this.showOperMsg(content);
    }
  },
  onRefresh() {
    this.refresh();
  },
  async refresh() {
    this.setData({
      enable: true,
    });
    const [cardRes, swiperRes] = await Promise.all([
      request('/home/cards').then((res) => res.data),
      request('/home/swipers').then((res) => res.data),
    ]);

    setTimeout(() => {
      this.setData({
        enable: false,
        cardInfo: cardRes.data,
        swiperList: swiperRes.data,
      });
    }, 1500);
  },
  showOperMsg(content) {
    Message.success({
      context: this,
      offset: [120, 32],
      duration: 4000,
      content,
    });
  },
  goRelease() {
    wx.navigateTo({
      url: '/pages/release/index',
    });
  },
  onSelectCity() {
    const that = this;
    wx.showActionSheet({
      itemList: ['伦敦', '纽约', '悉尼', '多伦多'],
      success(res) {
        const selected = ['伦敦', '纽约', '悉尼', '多伦多'][res.tapIndex];
        that.setData({
          currentCity: selected,
        });
        // TODO: 可以在这里触发内容重新加载
      },
      fail(res) {
        console.log(res.errMsg);
      },
    });
  },
  onTapSearch() {
    wx.navigateTo({
      url: '/pages/search/index',
    });
  }
  
});
