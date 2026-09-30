from django.urls import path, include

from .views import (IssueListCreateView,UserViewset,ProjectViewSet,IssueDetailView,DeveloperListView,AssignDeveloperView,
                    ChangeIssueStatusView,IssueCommentViewSet,)

from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'issues',IssueListCreateView,basename='issues')
router.register(r'issue-detail',IssueDetailView,basename='issue-detail')
router.register(r'registration',UserViewset,basename='registration')
router.register(r'projects',ProjectViewSet,basename='projects')
router.register(r'developers',DeveloperListView,basename='developers')
router.register(r'comments',IssueCommentViewSet,basename='comments')
router.register(r'assign-developer',AssignDeveloperView,basename='assign-developer')
router.register(r'change-status',ChangeIssueStatusView,basename='change-status')
urlpatterns = [
    path('',include(router.urls)),  
    path('login/',TokenObtainPairView.as_view(),name='token_obtain_pair'),    
    path('login/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
]