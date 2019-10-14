import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/letter-soup',
      name: 'letter-soup',
      component: () => import('./components/LetterSoup.vue')
    },
    {
      path: '/word-soup',
      name: 'word-soup',
      component: () => import('./components/WordSoup.vue')
    },
    {
      path: '/sight-words',
      name: 'sight-words',
      component: () => import('./components/SightWords.vue')
    }
  ]
})
