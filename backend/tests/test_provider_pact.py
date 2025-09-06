import os
import json
from urllib.parse import urljoin

import pytest
from django.core.management import call_command
from django.test import LiveServerTestCase

try:
    from pactman.verifier.verify import ProviderStateMissing
    from pactman.verifier.verify import verify_pacts
except Exception:  # pragma: no cover
    verify_pacts = None


class TestPactProvider(LiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Ensure DB is migrated
        call_command('migrate', run_syncdb=True, verbosity=0)

    def test_verify_pacts(self):
        if verify_pacts is None:
            pytest.skip('pactman not available')

        pact_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'contracts', 'pacts'))
        if not os.path.isdir(pact_dir):
            pytest.skip('No pact files found')

        # Provider state endpoint
        provider_state_url = urljoin(self.live_server_url, '/_pact/provider_states')

        # Verify all pacts in directory
        verify_pacts(
            pact_dir=pact_dir,
            provider_url=self.live_server_url + '/api',
            provider_state_url=provider_state_url,
        )

