# rules/urls.py

from django.urls import path
from . import views

app_name = 'rules'

urlpatterns = [
    # API endpoints
    path('api/groups/', views.RuleGroupAPIView.as_view(), name='api_rule_groups'),

    # Rule Group URLs
    path('',
         views.RuleGroupListView.as_view(),
         name='rule_group_list'),
    path('group/create/',
         views.RuleGroupCreateView.as_view(),
         name='create_rule_group'),
    path('group/<int:pk>/',
         views.RuleGroupDetailView.as_view(),
         name='rule_group_detail'),
    path('group/<int:pk>/edit/',
         views.RuleGroupUpdateView.as_view(),
         name='edit_rule_group'),
    path('group/<int:pk>/delete/',
         views.RuleGroupDeleteView.as_view(),
         name='delete_rule_group'),

    # Basic Rule URLs
    path('group/<int:group_id>/rule/create/',
         views.RuleCreateView.as_view(),
         name='create_rule'),
    path('rule/<int:pk>/edit/',
         views.RuleUpdateView.as_view(),
         name='edit_rule'),
    path('rule/<int:pk>/delete/',
         views.RuleDeleteView.as_view(),
         name='delete_rule'),

    # Advanced Rule URLs
    path('group/<int:group_id>/advanced-rule/create/',
         views.AdvancedRuleCreateView.as_view(),
         name='create_advanced_rule'),
    path('advanced-rule/<int:pk>/edit/',
         views.AdvancedRuleUpdateView.as_view(),
         name='edit_advanced_rule'),
    path('advanced-rule/<int:pk>/delete/',
         views.AdvancedRuleDeleteView.as_view(),
         name='delete_advanced_rule'),
    path('group/<int:group_id>/skus/', views.get_customer_skus, name='get_customer_skus'),
]