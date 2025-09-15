from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("entries", "0003_entry_faces_m2m"),
    ]

    operations = [
        migrations.AddField(
            model_name="entrydocument",
            name="content_type",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="entrydocument",
            name="extracted_text",
            field=models.TextField(blank=True),
        ),
    ]

