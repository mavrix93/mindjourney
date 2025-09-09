import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from faces.models import Face
from entries.models import Entry


@pytest.mark.django_db
def test_faces_suggest_endpoint_heuristics_match():
    client = APIClient()
    # Pre-create a face to ensure ID is returned when names match
    Face.objects.create(name="Gardener", icon="🌱")

    resp = client.get('/api/faces/suggest/', {"title": "Planting potatoes", "text": "Best in March."})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    names = {d["name"].lower() for d in data}
    assert "gardener" in names
    gardener = next(d for d in data if d["name"].lower() == "gardener")
    # Should include icon and possibly id
    assert gardener.get("icon")


@pytest.mark.django_db
def test_create_entry_with_faces_and_retrieve():
    client = APIClient()
    user = User.objects.create_user(username='alice', password='x')
    # Pre-create multiple faces
    f1 = Face.objects.create(name="Programmer", icon="💻")
    f2 = Face.objects.create(name="Pythonist", icon="🐍")

    payload = {
        "title": "Python 3.14 performance",
        "content": "Python 3.14 will be a huge step forward.",
        "is_public": True,
        "face_ids": [f1.id, f2.id],
    }
    # Unauthenticated should still work in demo mode according to app logic
    resp = client.post('/api/entries/', payload, format='json')
    assert resp.status_code in (201, 200)
    entry_id = resp.json()["id"]

    # Retrieve entry and verify faces are attached
    resp_get = client.get(f'/api/entries/{entry_id}/')
    assert resp_get.status_code == 200
    entry_data = resp_get.json()
    returned_faces = {f["name"] for f in entry_data.get("faces", [])}
    assert {"Programmer", "Pythonist"}.issubset(returned_faces)


@pytest.mark.django_db
def test_public_entries_filter_by_face_ids():
    client = APIClient()
    user = User.objects.create(username='bob')
    face_photographer = Face.objects.create(name="Photographer", icon="📷")
    face_adventurer = Face.objects.create(name="Adventurer", icon="🥾")

    e1 = Entry.objects.create(user=user, title='Wild shot', content='Canon 5000 in the wild', is_public=True)
    e1.faces.add(face_photographer)
    e2 = Entry.objects.create(user=user, title='Trail walk', content='Hiking the ridge', is_public=True)
    e2.faces.add(face_adventurer)
    Entry.objects.create(user=user, title='Private', content='secret', is_public=False)

    # Filter by photographer
    resp = client.get('/api/entries/public/', {"face_ids": str(face_photographer.id)})
    assert resp.status_code == 200
    data = resp.json()
    results = data if isinstance(data, list) else data.get('results', [])
    titles = {e['title'] for e in results}
    assert 'Wild shot' in titles and 'Trail walk' not in titles

    # Filter by both
    both = f"{face_photographer.id},{face_adventurer.id}"
    resp_both = client.get('/api/entries/public/', {"face_ids": both})
    assert resp_both.status_code == 200
    data_both = resp_both.json()
    results_both = data_both if isinstance(data_both, list) else data_both.get('results', [])
    titles_both = {e['title'] for e in results_both}
    assert 'Wild shot' in titles_both and 'Trail walk' in titles_both

