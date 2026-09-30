from django.db import models
from django.contrib.auth.models import AbstractUser

class Project(models.Model):
    project_name = models.CharField(max_length=100)

class User(AbstractUser):
    Role_CHOICES = [
        ("USER", "User"),
        ("DEVELOPER", "Developer"),
        ("ADMIN", "Admin"),]
    mobile = models.CharField(max_length=10, unique=True)
    role = models.CharField(max_length=20,choices=Role_CHOICES)


class IssueTracking(models.Model):
    ISSUETYPE_CHOICES = [
        ("BUG", "Bug"),
        ("FEATURE", "Feature"),
        ("TASK", "Task"),
        ("IMPROVEMENT", "Improvement"),]
    PRIORITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critical"),]
    STATUS_CHOICES = [
        ("SUBMITTED", "Submitted"),
        ("IN_PROGRESS", "In Progress"),
        ("UNDER_REVIEW", "Under Review"),
        ("CLOSED", "Closed"),]

    project = models.ForeignKey( Project, on_delete=models.CASCADE, related_name="issues", null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    issue_type = models.CharField( max_length=20, choices=ISSUETYPE_CHOICES)
    priority = models.CharField( max_length=20, choices=PRIORITY_CHOICES,default="MEDIUM")
    assigned_to = models.ForeignKey(User,on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_issues")
    reported_by = models.ForeignKey(User,on_delete=models.CASCADE,)
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default="SUBMITTED")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class IssueComment(models.Model):

    issue = models.ForeignKey(IssueTracking,on_delete=models.CASCADE,related_name='comments')
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name='issue_comments')
    comment = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)