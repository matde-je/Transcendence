#!/bin/bash

# Login and save cookies
curl -k -c cookies.txt -X POST https://localhost:8443/users/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"user1", "password":"123"}'

# Extract session ID from cookies file
session_id=$(grep sessionid cookies.txt | cut -f7)

# Function to test an endpoint
test_endpoint() {
    local url=$1
    local method=$2
    local data=$3
    local auth_type=$4

    echo "Testing $method $url ($auth_type):"

    if [ "$auth_type" = "authenticated" ] && [ "$method" != "GET" ]; then
        session_id=$(cat session_id.txt)
        curl -k -X "$method" "$url" \
             -H "Content-Type: application/json" \
             -H "Cookie: sessionid=$session_id" \
             -H "Referer: https://localhost:8443/" \
             ${data:+-d "$data"}
    else
        curl -k -X "$method" "$url" \
             -H "Content-Type: application/json" \
             -H "Referer: https://localhost:8443/" \
             ${data:+-d "$data"}
    fi

    echo -e "\n"
}

# Usage:
endpoint="https://localhost:8443/tournament/list/"
test_endpoint "$endpoint" "GET" "" "authenticated"

# Test endpoints
endpoint="https://localhost:8443/pong/register_pong_history/"
data='{"opponent": "opponent1", "result": "win", "score": "21-15"}'

test_endpoint "$endpoint" "POST" "$data" "unauthenticated"
test_endpoint "$endpoint" "POST" "$data" "authenticated"

endpoint="https://localhost:8443/rps/get_waiting_list/"
data='{}'  # No data required for this endpoint

test_endpoint "$endpoint" "POST" "$data" "unauthenticated"
test_endpoint "$endpoint" "POST" "$data" "authenticated"

endpoint="https://localhost:8443/rps/register_match/"
data='{"opponent": "opponent1", "result": "win"}'

test_endpoint "$endpoint" "POST" "$data" "unauthenticated"
test_endpoint "$endpoint" "POST" "$data" "authenticated"

endpoint="https://localhost:8443/rps/add-to-waiting-list/"
data='{}'  # No data required for this endpoint

test_endpoint "$endpoint" "POST" "$data" "unauthenticated"
test_endpoint "$endpoint" "POST" "$data" "authenticated"

endpoint="https://localhost:8443/rps/remove_from_waiting_list/"
data='{}'  # No data required for this endpoint

test_endpoint "$endpoint" "POST" "$data" "authenticated"

endpoint="https://localhost:8443/rps/find_match/"
data='{}'  # No data required for this endpoint

test_endpoint "$endpoint" "POST" "$data" "authenticated"

endpoint="https://localhost:8443/rps/get_rps_results/"
data='{}'  # No data required for this endpoint

test_endpoint "$endpoint" "GET" "$data" "authenticated"

endpoint="https://localhost:8443/rps/is_user_in_waiting_list/"
data='{}'  # No data required for this endpoint

test_endpoint "$endpoint" "GET" "$data" "authenticated"

endpoint="https://localhost:8443/tournament/create/"
data='{"name": "Test Tournament", "description": "A test tournament", "game": "Chess"}'
test_endpoint "$endpoint" "POST" "$data" "authenticated"  

# 3. Tournament Results (GET)
endpoint="https://localhost:8443/tournament/results/"
data=''
test_endpoint "$endpoint" "GET" "$data" "authenticated"  

# 4. Join Tournament (POST, requires tournament_id)
tournament_id=1  # Replace with a valid tournament ID
endpoint="https://localhost:8443/tournament/${tournament_id}/join/"
data='{"is_accepted": true}'
test_endpoint "$endpoint" "POST" "$data" "authenticated"  

# 5. Leave Tournament (POST, requires tournament_id)
endpoint="https://localhost:8443/tournament/${tournament_id}/leave/"
data='{}'
test_endpoint "$endpoint" "POST" "$data" "authenticated"  

# 6. Delete Tournament (POST, requires tournament_id)
#  IMPORTANT:  This test is destructive.  Uncomment and use with extreme caution.
endpoint="https://localhost:8443/tournament/${tournament_id}/delete/"
data='{}'
test_endpoint "$endpoint" "POST" "$data" "authenticated"  

# 7. Tournament Participants (GET, requires tournament_id)
endpoint="https://localhost:8443/tournament/${tournament_id}/participants/"
data=''
test_endpoint "$endpoint" "GET" "$data" "authenticated"  

# 8. Start Tournament (POST, requires tournament_id)
endpoint="https://localhost:8443/tournament/${tournament_id}/start/"
data='{}'
test_endpoint "$endpoint" "POST" "$data" "authenticated" 
test_endpoint "$endpoint" "POST" "$data" "unauthenticated"  

# 9. Manage Matches (GET, requires tournament_id)
endpoint="https://localhost:8443/tournament/${tournament_id}/matches/"
data=''
test_endpoint "$endpoint" "GET" "$data" "authenticated"  

# 10. Manage Matches - Create (POST, requires tournament_id)
endpoint="https://localhost:8443/tournament/${tournament_id}/matches/"
data='{"player1": 1, "player2": 2, "round": 1}'  # Example data, adjust as needed
test_endpoint "$endpoint" "POST" "$data" "authenticated" 
test_endpoint "$endpoint" "POST" "$data" "unauthenticated"  

# 11. Update Match (GET and PATCH, requires tournament_id and match_id)
match_id=1  # Replace with a valid match ID
endpoint="https://localhost:8443/tournament/${tournament_id}/matches/${match_id}/"

# 11a.  Get Match
data=''
test_endpoint "$endpoint" "GET" "$data" "authenticated"  

# 11b. Patch Match
data='{"winner": 1, "completed": true}'  # Example data, adjust as needed
test_endpoint "$endpoint" "PATCH" "$data" "authenticated" 

# 12. Select Winners and Matchmake (POST, requires tournament_id)
endpoint="https://localhost:8443/tournament/${tournament_id}/select_winners/"
data='{"round_number": 2}'  # Example data
test_endpoint "$endpoint" "POST" "$data" "authenticated"  
test_endpoint "$endpoint" "POST" "$data" "unauthenticated"  

# 13. Finish Tournament (PATCH, requires tournament_id)
endpoint="https://localhost:8443/tournament/${tournament_id}/finish/"
data='{"winner_id": 1}'  # Example data
test_endpoint "$endpoint" "PATCH" "$data" "authenticated"  
test_endpoint "$endpoint" "PATCH" "$data" "unauthenticated"  

# 14. User Tournament Results (GET)
endpoint="https://localhost:8443/tournament/user/results/"
data=''
test_endpoint "$endpoint" "GET" "$data" "authenticated"  

# Register user
endpoint="https://localhost:8443/users/register/"
data='{"username": "newuser", "password": "newpassword", "email": "newuser@example.com"}'
test_endpoint "$endpoint" "POST" "$data" "unauthenticated"

# Login user
endpoint="https://localhost:8443/users/login/"
data='{"username": "user1", "password": "password123"}'
test_endpoint "$endpoint" "POST" "$data" "unauthenticated"

# Check authentication
endpoint="https://localhost:8443/users/check-auth/"
test_endpoint "$endpoint" "GET" "" "authenticated"

# Logout user
endpoint="https://localhost:8443/users/logout/"
test_endpoint "$endpoint" "POST" "" "authenticated"

# Get user data
endpoint="https://localhost:8443/user/"
test_endpoint "$endpoint" "GET" "" "authenticated"

# Update user data
endpoint="https://localhost:8443/user/update/"
data='{"email": "updated@example.com"}'
test_endpoint "$endpoint" "PUT" "$data" "authenticated"

# Get friend list
endpoint="https://localhost:8443/friends/"
test_endpoint "$endpoint" "GET" "" "authenticated"

# Get received friend requests
endpoint="https://localhost:8443/friend_requests/received/"
test_endpoint "$endpoint" "GET" "" "authenticated"

# Get sent friend requests
endpoint="https://localhost:8443/friend_requests/sent/"
test_endpoint "$endpoint" "GET" "" "authenticated"

# Remove friend
endpoint="https://localhost:8443/friends/2/remove/"  # Assuming friend's user_id is 2
test_endpoint "$endpoint" "DELETE" "" "authenticated"

# Create tournament
endpoint="https://localhost:8443/tournaments/create/"
data='{"name": "New Tournament", "description": "Test tournament"}'
test_endpoint "$endpoint" "POST" "$data" "authenticated"

# Get user by ID
endpoint="https://localhost:8443/user/1/"  # Assuming user_id is 1
test_endpoint "$endpoint" "GET" "" "authenticated"

# Get user results
endpoint="https://localhost:8443/users/results/"
test_endpoint "$endpoint" "GET" "" "authenticated"
