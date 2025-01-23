# users/services/tournament_service.py

import requests

def create_tournament_for_user(user_id):
    # Tournament Microservice URL
    url = 'https://tournament:8001/create/'
    data = {
        'user_id': user_id
    }
    
    # Send POST request to the tournament microservice
    response = requests.post(url, json=data)
    
    # Check the response and return the data or an error
    if response.status_code == 201:
        return response.json()
    else:
        return {'error': 'Failed to create tournament'}
