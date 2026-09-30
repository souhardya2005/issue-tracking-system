from django.db.models import Q

from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework import permissions
from rest_framework.response import Response
from .models import (IssueTracking,User,Project,IssueComment)
from .serializers import (IssueTrackingSerializers,UserSerializers,ProjectSerializers,IssueCommentSerializer)

#(Only ADMIN can create/Update/Delete a project)
class ProjectViewSet(ModelViewSet):
     queryset = Project.objects.all()
     serializer_class = ProjectSerializers
     permission_classes = [permissions.IsAuthenticated]
     # CREATE PROJECT
     def create(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response(
                {"error": "Only admin can create projects"},
                status=403)
        return super().create(request,*args,**kwargs)
 # UPDATE PROJECT
     def update(self, request, *args, **kwargs):
         if request.user.role != "ADMIN":
             return Response(
                {"error": "Only admin can update projects"},
                 status=403)
         return super().update(request,*args,**kwargs)
 # DELETE PROJECT
     def destroy(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
         return Response(
             {"error": "Only admin can delete projects"},
             status=403)
        return super().destroy(request,*args,**kwargs)

class UserViewset(ModelViewSet):
    serializer_class = UserSerializers
    queryset = User.objects.all()


class IssueListCreateView(ModelViewSet):

    queryset = IssueTracking.objects.select_related( 
        "project",
        "reported_by",
        "assigned_to")#Conceptually perform Join Operation
    serializer_class = IssueTrackingSerializers
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):#Set reported_by automatically
        serializer.save(reported_by=self.request.user)

class IssueDetailView(ModelViewSet):
    queryset = IssueTracking.objects.select_related(
        "project",
        "reported_by",
        "assigned_to")
    serializer_class = IssueTrackingSerializers
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self,request,*args,**kwargs):
        issue = self.get_object()
        user = request.user
        fields = set(request.data.keys())
        if user.role == "ADMIN":
            allowed_fields = {
                "status",
                "assigned_to"
            }
            if not fields.issubset(allowed_fields):
                return Response(
                    {
                        "detail":
                        "Admin can only update status and assigned developer."
                    },
                    status=403
                )
            return super().update(request,*args,**kwargs)

        if user.role == "DEVELOPER":
            if issue.assigned_to != user:
                return Response(
                    {
                        "detail":
                        "You can only access issues assigned to you."
                    },
                    status=403
                )
            return Response(
                {
                    "detail":
                    "Developers cannot update issue fields. Use the comment API to add comments."
                },
                status=403
            )
        if user.role == "USER":
            if issue.reported_by != user:
                return Response(
                    {
                        "detail":
                        "You can only update your own issues."
                    },
                    status=403
                )
            allowed_fields = {
                "title",
                "description"
            }
            if not fields.issubset(allowed_fields):
                return Response(
                    {
                        "detail":
                        "You can only update title and description."
                    },
                    status=403
                )
            return super().update(request,*args,**kwargs)
        return Response(
            {
                "detail": "Invalid user role."
            },
            status=403
        )

class DeveloperListView(ReadOnlyModelViewSet):
    serializer_class = UserSerializers
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(role="DEVELOPER")
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                |
                Q(last_name__icontains=search)
                |
                Q(username__icontains=search)
            )
        return queryset


class AssignDeveloperView(ModelViewSet):

    queryset = IssueTracking.objects.select_related(
        "project",
        "reported_by",
        "assigned_to"
    )

    serializer_class = IssueTrackingSerializers
    permission_classes = [permissions.IsAuthenticated]

    def update(self,request,*args,**kwargs):

        if request.user.role != "ADMIN":
            return Response(
                {
                    "detail":
                    "Only admin can assign developers."
                },
                status=403
            )
        issue = self.get_object()
        developer_id = request.data.get("assigned_to")

        if not developer_id:
            return Response(
                {
                    "detail":
                    "assigned_to is required."
                },
                status=400
            )

        try:
            developer = User.objects.get(
                id=developer_id,
                role="DEVELOPER"
            )
        except User.DoesNotExist:
            return Response(
                {
                    "detail":
                    "Developer not found."
                },
                status=404
            )
        issue.assigned_to = developer
        issue.save()
        return Response(
            IssueTrackingSerializers(
                issue
            ).data
        )



class ChangeIssueStatusView(ModelViewSet):
    queryset = IssueTracking.objects.select_related(
        "project",
        "reported_by",
        "assigned_to"
    )
    serializer_class = IssueTrackingSerializers
    permission_classes = [permissions.IsAuthenticated]
    def update(self, request, *args, **kwargs):
        user = request.user
        issue = self.get_object()
        if user.role == "ADMIN":
            pass
        elif user.role == "DEVELOPER":
            if issue.assigned_to != user:
                return Response(
                    {
                        "detail":
                        "You can only change the status of issues assigned to you."
                    },
                    status=403
                )
        else:
            return Response(
                {
                    "detail":
                    "Only admin or the assigned developer can change issue status."
                },
                status=403
            )
        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {
                    "detail":
                    "status is required."
                },
                status=400
            )
        valid_statuses = [
            choice[0]
            for choice in IssueTracking.STATUS_CHOICES
        ]

        if new_status not in valid_statuses:
            return Response(
                {
                    "detail":
                    "Invalid status."
                },
                status=400
            )
        issue.status = new_status
        issue.save()
        return Response(
            IssueTrackingSerializers(issue).data
        )


class IssueCommentViewSet(ModelViewSet): 
 
    serializer_class = IssueCommentSerializer 
    permission_classes = [permissions.IsAuthenticated] 
    def get_queryset(self): 
        issue_id = self.request.query_params.get("issue") 
 
        queryset = IssueComment.objects.select_related( "user", "issue" ).all() 
        if issue_id: 
            queryset = queryset.filter( issue_id=issue_id ) 
        return queryset.order_by("timestamp") 
 
    def create(self, request, *args, **kwargs): 
        if request.user.role not in ["ADMIN", "DEVELOPER"]: 
            return Response( 
                { 
                    "detail": 
                    "Only admin and developers can comment." 
                }, 
                status=403 
            ) 
 
        return super().create(request,*args,**kwargs) 
    def perform_create(self, serializer): 
        serializer.save(user=self.request.user)