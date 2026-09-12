import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SignInView from '@/views/SignInView.vue'
import SignUpView from '@/views/SignUpView.vue'
import DashboardView from '@/views/DashboardView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import PrivacyView from "@/views/PrivacyView.vue"
import TermsView from "@/views/TermsView.vue"
import ContactView from "@/views/ContactView.vue"
import api from '@/services/api'
import HomeActiveProjectView from '@/components/activeProject/views/HomeActiveProjectView.vue'
import ProjectBoardView from '@/components/activeProject/views/ProjectBoardView.vue'
import ProjectTasksView from '@/components/activeProject/views/ProjectTasksView.vue'
import ProjectCalendarView from '@/components/activeProject/views/ProjectCalendarView.vue'
import ProjectLayoutView from '@/components/activeProject/ProjectLayoutView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignInView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        requiresAuth: true,
      },

      children: [

        // /dashboard
        {
          path: '',
          name: 'dashboard-summary',
          component: () =>
            import('@/components/dashboard/views/DashboardSummaryView.vue'),
        },


        // /dashboard/projects/active
        {
          path: 'projects/active',
          name: 'active-project',
          component: () =>
            import('@/components/dashboard/views/projectViews/ActiveProjectView.vue'),
        },


        // /dashboard/projects/done
        {
          path: 'projects/done',
          name: 'project-done',
          component: () =>
            import('@/components/dashboard/views/projectViews/ProjectDoneView.vue'),
        },


        // /dashboard/projects/on-hold
        {
          path: 'projects/on-hold',
          name: 'project-on-hold',
          component: () =>
            import('@/components/dashboard/views/projectViews/ProjectOnHoldView.vue'),
        },


        // /dashboard/teams
        {
          path: 'teams',
          name: 'teams',
          component: () =>
            import('@/components/dashboard/views/TeamsView.vue'),
        },


        // /dashboard/notifications
        {
          path: 'notifications',
          name: 'notifications',
          component: () =>
            import('@/components/dashboard/views/NotificationsView.vue'),
        },

        // /dashboard/search
        {
          path: 'search',
          name: 'search',
          component: () =>
            import('@/components/dashboard/views/SearchView.vue'),
        },



        // /dashboard/help
        {
          path: 'help',
          name: 'help',
          component: () =>
            import('@/components/dashboard/views/HelpView.vue'),
        },


        // /dashboard/profile
        {
          path: 'profile',
          name: 'profile',
          component: () =>
            import('@/components/dashboard/views/ProfileView.vue'),
        },


        // /dashboard/settings
        {
          path: 'settings',
          name: 'settings',
          component: () =>
            import('@/components/dashboard/views/SettingsView.vue'),
        },

        // /dashboard/workspace-members
        {
          path: 'workspace-members',
          name: 'workspace-members',
          component: () =>
            import('@/components/dashboard/views/WorkspaceMembersView.vue'),
        },

      ],
    },

    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyView
    },

    {
      path: '/project/:projectId',
      component: ProjectLayoutView,
      props: true,

      meta: {
        requiresAuth: true,
      },

      children: [
        {
          path: '',
          name: 'project-home',
          component: HomeActiveProjectView,
          props: true,
        },

        {
          path: 'board',
          name: 'project-board',
          component: ProjectBoardView,
          props: true,
        },

        {
          path: 'tasks',
          name: 'project-tasks',
          component: ProjectTasksView,
          props: true,
        },

        {
          path: 'calendar',
          name: 'project-calendar',
          component: ProjectCalendarView,
          props: true,
        },
      ],
    },

    {
      path: '/terms',
      name: 'terms',
      component: TermsView
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView
    },
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: NotFoundView
    },

  ],
})

router.beforeEach(async (to) => {

  if (!to.meta.requiresAuth) {
    return true;
  }

  try {

    await api.get("/auth/status");

    return true;

  } catch {

    return "/signin";

  }

});

export default router
