from datetime import datetime, timedelta, timezone
from botocore.signers import CloudFrontSigner
import rsa

# Path to your CloudFront private key
private_key_path = 'private-key.pem'

# Your CloudFront distribution's key pair ID
key_pair_id = 'key-pair-id'

# CloudFront URL (your content's CloudFront URL)
url = 'https://d3t8s5utz027dz.cloudfront.net/beach.jpg'

# Function to sign the URL
def rsa_signer(message):
    with open(private_key_path, 'rb') as f:
        private_key = rsa.PrivateKey.load_pkcs1(f.read())
    return rsa.sign(message, private_key, 'SHA-1')

# Set expiration time (e.g., 1 hour)
expire_time = datetime.now(timezone.utc) + timedelta(hours=1)

# Initialize the CloudFrontSigner instance
signer = CloudFrontSigner(key_pair_id, rsa_signer)

# Generate the presigned URL
signed_url = signer.generate_presigned_url(url, date_less_than=expire_time)

print(f"Presigned URL: {signed_url}")
