from .models import IssueTracking,User,Project,IssueComment
from rest_framework import serializers

class IssueTrackingSerializers(serializers.ModelSerializer):
    reported_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    class Meta:
        model = IssueTracking
        fields = [
            "id",
            "project",
            "title",
            "description",
            "issue_type",
            "priority",
            "status",

            "reported_by",
            "reported_by_name",

            "assigned_to",
            "assigned_to_name",

        ]

        read_only_fields = [
            "reported_by",
            "reported_by_name",
            "assigned_to_name",
        ]


    def get_reported_by_name(self, obj):
        if obj.reported_by:
            return (f"{obj.reported_by.first_name} "f"{obj.reported_by.last_name}").strip()
        
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return (f"{obj.assigned_to.first_name} " f"{obj.assigned_to.last_name}").strip()
        return "Not Assigned"
    
class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model=User
        fields="__all__"
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class ProjectSerializers(serializers.ModelSerializer):
    class Meta:
        model=Project
        fields="__all__"

class IssueCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    class Meta:
        model = IssueComment
        fields = [
            "id",
            "issue",
            "user",
            "user_name",
            "comment",
            "timestamp",
        ]

        read_only_fields = [
            "user",
            "user_name",
            "timestamp",
        ]

    def get_user_name(self, obj):
        if obj.user:
            return (f"{obj.user.first_name} "f"{obj.user.last_name}").strip()