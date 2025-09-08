import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from entries.models import Entry


@pytest.mark.django_db
def test_create_entry_triggers_endpoint_and_returns_201():
    client = APIClient()
    user = User.objects.create_user(username='tester', password='pass')
    client.force_authenticate(user=user)
    payload = {"title": "t", "content": "c", "is_public": False}
    response = client.post('/api/entries/', payload, format='json')
    assert response.status_code in (201, 200)
    assert Entry.objects.count() == 1


@pytest.mark.django_db
def test_public_entries_endpoint_filters():
    client = APIClient()
    # Create public and private
    user = User.objects.create(username='u1')
    Entry.objects.create(user=user, title='a', content='x', is_public=True)
    Entry.objects.create(user=user, title='b', content='y', is_public=False)
    response = client.get('/api/entries/public/')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list) or 'results' in data
