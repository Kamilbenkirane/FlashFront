"""Check source icons and, optionally, the signed IPA before TestFlight upload.
Usage: python3 scripts/check-ios-branding.py [path/to/app.ipa]
"""
import json
import plistlib
import struct
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
config = json.loads((ROOT / 'app.json').read_text())['expo']
assert config['name'] == 'Shuffle', 'Unexpected app display name'
for appearance in ('light', 'dark', 'tinted'):
    path = ROOT / config['ios']['icon'][appearance]
    png = path.read_bytes()
    assert png[:8] == b'\x89PNG\r\n\x1a\n', f'{path.name}: expected PNG'
    assert struct.unpack('>II', png[16:24]) == (1024, 1024), f'{path.name}: expected 1024 square'
    assert png[25] == 2, f'{path.name}: use opaque RGB, no alpha channel'
print('PASS: Shuffle name and opaque 1024px default, dark, and tinted icons')

if len(sys.argv) > 1:
    with zipfile.ZipFile(sys.argv[1]) as ipa:
        names = ipa.namelist()
        plists = [name for name in names if name.startswith('Payload/') and name.endswith('.app/Info.plist') and name.count('/') == 2]
        assert len(plists) == 1, 'Expected one main application bundle'
        info = plistlib.loads(ipa.read(plists[0]))
        assert info['CFBundleDisplayName'] == config['name'], 'IPA contains an old app name'
        assert info['CFBundleIdentifier'] == config['ios']['bundleIdentifier'], 'IPA bundle ID mismatch'
        primary = info['CFBundleIcons']['CFBundlePrimaryIcon']
        assert primary.get('CFBundleIconName') == 'AppIcon', 'Missing compiled AppIcon'
        bundle = plists[0].removesuffix('Info.plist')
        assert bundle + 'Assets.car' in names, 'Missing compiled asset catalog'
        for icon_name in primary['CFBundleIconFiles']:
            assert any(name.startswith(bundle + icon_name) and name.endswith('.png') for name in names), f'Missing bundled {icon_name}'
        print(f"PASS: signed {info['CFBundleDisplayName']} {info['CFBundleShortVersionString']} ({info['CFBundleVersion']}) contains the launcher icon and asset catalog")
