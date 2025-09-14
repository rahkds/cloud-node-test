import json
import base64
from datetime import datetime, timedelta, timezone
import rsa

# Path to your CloudFront private key
private_key_path = 'private-key.pem'

# Your CloudFront key pair ID
key_pair_id = 'key-pair-id'

# Your CloudFront distribution's domain name
distribution_domain = 'd3t8s5utz027dz.cloudfront.net'

# Function to sign the policy
def rsa_signer(message):
    with open(private_key_path, 'rb') as f:
        private_key = rsa.PrivateKey.load_pkcs1(f.read())
    return rsa.sign(message, private_key, 'SHA-1')

expire_time = int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp())
resource = f"https://{distribution_domain}/*"

policy = {
    "Statement": [
        {
            "Resource": resource,
            "Condition": {
                "DateLessThan": {"AWS:EpochTime": expire_time}
            }
        }
    ]
}

policy_json = json.dumps(policy, separators=(',', ':')).encode('utf-8')
policy_b64 = base64.b64encode(policy_json).decode('utf-8').replace('+', '-').replace('=', '_').replace('/', '~')
signature = rsa_signer(policy_json)
signature_b64 = base64.b64encode(signature).decode('utf-8').replace('+', '-').replace('=', '_').replace('/', '~')

cookies = {
    'CloudFront-Policy': policy_b64,
    'CloudFront-Signature': signature_b64,
    'CloudFront-Key-Pair-Id': key_pair_id
}

print("Cookies to be sent to the client:")
print(cookies)
