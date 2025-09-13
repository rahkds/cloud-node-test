import datetime
import base64
import urllib.parse
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding

# === CONFIGURATION ===
key_pair_id = 'K3B45XA5ZNKKM6'  # Replace with your CloudFront Key Pair ID
private_key_path = 'private.pem'
cloudfront_url = 'https://d2fepkel96vivf.cloudfront.net/beach.jpg'
expire_date = datetime.datetime.utcnow() + datetime.timedelta(hours=1)

# === LOAD PRIVATE KEY ===
with open(private_key_path, 'rb') as f:
    private_key = serialization.load_pem_private_key(f.read(), password=None)

# === CREATE POLICY ===
epoch_expire_time = int(expire_date.timestamp())

policy = f'''{{
    "Statement": [
        {{
            "Resource": "{cloudfront_url}",
            "Condition": {{
                "DateLessThan": {{
                    "AWS:EpochTime": {epoch_expire_time}
                }}
            }}
        }}
    ]
}}'''

# === SIGN POLICY ===
signature = private_key.sign(
    policy.encode('utf-8'),
    padding.PKCS1v15(),
    hashes.SHA1()
)

# === ENCODE TO URL-SAFE BASE64 ===
def url_safe_base64(data):
    return base64.b64encode(data).decode('utf-8').replace('+', '-').replace('=', '_').replace('/', '~')

encoded_signature = url_safe_base64(signature)
encoded_policy = url_safe_base64(policy.encode('utf-8'))

# === BUILD SIGNED URL ===
signed_url = (
    f"{cloudfront_url}"
    f"?Policy={encoded_policy}"
    f"&Signature={encoded_signature}"
    f"&Key-Pair-Id={key_pair_id}"
)

print("🔐 Signed URL:")
print(signed_url)


