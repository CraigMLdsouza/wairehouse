import firebase_admin
from firebase_admin import credentials, firestore
import json

# Path to your Firebase service account key file
# Replace 'path/to/serviceAccountKey.json' with the actual path to your service account key
cred = credentials.Certificate('./wairehouse-4a655-firebase-adminsdk-romg2-49ecdd38a2.json')

# Initialize Firebase Admin SDK with your service account credentials
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

# Path to your JSON data file
json_file_path = './ai_tool_results.json'

# Read JSON data
with open(json_file_path, 'r') as json_file:
    tool_data = json.load(json_file)

# Populate Firestore
for category, tools in tool_data.items():
    for tool in tools:
        # Add tool document to Firestore
        doc_ref = db.collection('tools').document(category).collection('urls').add(tool)
        print(f"Added {tool['url']} to {category} in Firestore.")

print('Firestore population complete!')
