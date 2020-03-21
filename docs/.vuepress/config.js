const sidebar = require('../../utils/makeSidebar.js').makeSidebar();

module.exports = {
  base: '/vuepress-work/',
  title: '倪一德的学习小站',
  description: '一个用来记录个人学习和工作经验的小站',
  plugins: ['@vuepress/back-to-top'],
  themeConfig: {
    nav: [
      { text: '前端知识', link: '/frontend/' },
      { text: '工作经验', link: '/experience/' },
      { text: '面试题', link: '/interview/' },
      {
        text: '外部网站',
        items: [
          { text: 'Vue.js', link: 'https://cn.vuejs.org/v2/guide/' },
        ]
      },
    ],
    sidebar:sidebar,
    smoothScroll: true
  }
}