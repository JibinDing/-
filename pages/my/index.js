import request from '~/api/request';
import useToastBehavior from '~/behaviors/useToast';

Page({
  behaviors: [useToastBehavior],

  data: {
    isLoad: false,
    service: [],
    personalInfo: {},
    emailDialogVisible: false,
    email: '',
    code: '',
    sendDisabled: false,
    sendText: '发送验证码',
    gridList: [
      {
        name: '全部发布',
        icon: 'root-list',
        type: 'all',
        url: '',
      },
      {
        name: '审核中',
        icon: 'search',
        type: 'progress',
        url: '',
      },
      {
        name: '已发布',
        icon: 'upload',
        type: 'published',
        url: '',
      },
      {
        name: '草稿箱',
        icon: 'file-copy',
        type: 'draft',
        url: '',
      },
    ],

    settingList: [
      { name: '联系客服', icon: 'service', type: 'service' },
      { name: '设置', icon: 'setting', type: 'setting', url: '/pages/setting/index' },
    ],
  },

  onLoad() {
    this.getServiceList();
  },

  async onShow() {
    const Token = wx.getStorageSync('access_token');
    const personalInfo = await this.getPersonalInfo();

    if (Token) {
      this.setData({
        isLoad: true,
        personalInfo,
      });
    }
  },

  getServiceList() {
    request('/api/getServiceList').then((res) => {
      const { service } = res.data.data;
      this.setData({ service });
    });
  },

  async getPersonalInfo() {
    const info = await request('/api/genPersonalInfo').then((res) => res.data.data);
    return info;
  },

  onLogin() {
    wx.getUserProfile({
      desc: '用于完善用户信息',
      success: async (res) => {
        const { userInfo } = res;
        this.setData({
          isLoad: true,
          personalInfo: {
            name: userInfo.nickName,
            image: userInfo.avatarUrl,
            city: userInfo.city || '未设置',
            star: '普通用户',
          },
        });
  
        // ⚠️ 发送到后端换取 access_token
        const result = await request('/api/login', {
          method: 'POST',
          data: {
            nickname: userInfo.nickName,
            avatar: userInfo.avatarUrl,
          },
        });
  
        if (result.data.success) {
          wx.setStorageSync('access_token', result.data.token);
          this.showToast('登录成功');
        } else {
          this.showToast('登录失败');
        }
      },
      fail: () => {
        this.showToast('用户拒绝授权');
      },
    });
  },
  

  onNavigateTo() {
    wx.navigateTo({ url: `/pages/my/info-edit/index` });
  },

  onEleClick(e) {
    const { name, url } = e.currentTarget.dataset.data;
    if (url) return;
    this.onShowToast('#t-toast', name);
  },
//以下为邮箱验证模块
  onVerifyEmail() {
    this.setData({
      emailDialogVisible: true,
    });
  },
  
  onCancelEmail() {
    this.setData({
      emailDialogVisible: false,
      email: '',
      code: '',
    });
  },
  
  onInputEmail(e) {
    this.setData({
      email: e.detail.value,
    });
  },
  
  onInputCode(e) {
    this.setData({
      code: e.detail.value,
    });
  },
  
  onSendCode() {
    const email = this.data.email.trim();
    const ukPattern = /^[a-zA-Z0-9._%+-]+@.+\.ac\.uk$/;
    const usPattern = /^[a-zA-Z0-9._%+-]+@.+\.edu$/;
    const caPattern = /^[a-zA-Z0-9._%+-]+@.+(\.edu|\.ca)$/;
    const auPattern = /^[a-zA-Z0-9._%+-]+@.+\.edu\.au$/;
  
    if (!(ukPattern.test(email) || usPattern.test(email) || caPattern.test(email) || auPattern.test(email))) {
      this.showToast('邮箱后缀不符合高校认证规则');
      return;
    }
  
    this.setData({ sendDisabled: true, sendText: '已发送' });
  
    // TODO: 调用后端发送验证码接口
    request('/api/sendCode', { method: 'POST', data: { email } }).then(() => {
      this.showToast('验证码已发送');
      setTimeout(() => {
        this.setData({ sendDisabled: false, sendText: '重新发送' });
      }, 60000); // 60秒冷却
    });
  },
  
  onSubmitEmail() {
    const { email, code } = this.data;
    if (!email || !code) {
      this.showToast('请填写完整信息');
      return;
    }
  
    // TODO: 调用后端验证接口
    request('/api/verifyCode', { method: 'POST', data: { email, code } }).then((res) => {
      if (res.data.success) {
        this.showToast('认证成功');
        this.setData({
          emailDialogVisible: false,
          personalInfo: { ...this.data.personalInfo, verified: true, email },
        });
      } else {
        this.showToast('验证码错误');
      }
    });
  },
  
  showToast(msg) {
    this.selectComponent('#t-toast').show({
      duration: 2000,
      message: msg,
    });
  }
  
});
