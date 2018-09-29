// templates/prompt/prompt.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
      type:{
          type: String,
          value: 'digit'
      },
    title: {
      type: String,
      value: '标题'
    },
    btn_cancel: {
      type: String,
      value: '取消'
    },
    btn_certain: {
      type: String,
      value: '确定'
    }
  },
  data: {
    isHidden: true,
    cost:''
  },
  methods: {
    hidePrompt: function () {
      this.setData({
        isHidden: true
      })
    },
    showPrompt() {
      this.setData({
        isHidden: false,
          cost:''
      })
    },
    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    _cancel() {
      //触发cancel事件，即在外部，在组件上绑定cancel事件即可，bind:cancel，像绑定tap一样
      this.triggerEvent("cancel")
    },
    _confirm() {
      this.triggerEvent("confirm");
    },
    _input(e) {
      //将参数传出去，这样在getInput函数中可以通过e去获得必要的参数
      this.triggerEvent("getInput", e.detail);
    }
  }
})
