# Blaze Bounty online rooms — Firebase setup

This free-plan setup uses Firebase Anonymous Authentication and Realtime Database. Firebase hosts the room service; there is no server to install or maintain. Both phones need internet, and the Android wrapper must allow online access.

## One-time Firebase setup
1. Open https://console.firebase.google.com/ and create a project.
2. In Authentication → Sign-in method, enable **Anonymous**.
3. Create a **Realtime Database** in a nearby region.
4. In Project settings → General → Your apps, register a Web app. Copy its `apiKey`, `authDomain`, `databaseURL`, `projectId`, and `appId` values into `src/firebase-config.js`, replacing the placeholders.
5. In Realtime Database → Rules, paste and publish:

```json
{
  "rules": {
    "rooms": {
      "$room": {
        ".read": "auth != null",
        ".write": "auth != null && ((!data.exists() && newData.child('host').val() === auth.uid) || data.child('host').val() === auth.uid)",
        "players": {
          "$player": {
            ".write": "auth != null && auth.uid === $player && (data.exists() || root.child('rooms').child($room).child('status').val() === 'waiting')",
            "hits": {
              "$hit": {
                ".write": "auth != null && root.child('rooms').child($room).child('players').child(auth.uid).exists() && root.child('rooms').child($room).child('status').val() === 'playing'"
              }
            }
          }
        },
        "startRequests": {
          "$requester": {
            ".write": "auth != null && auth.uid === $requester && root.child('rooms').child($room).child('players').child(auth.uid).exists() && root.child('rooms').child($room).child('status').val() === 'waiting'"
          }
        }
      }
    }
  }
}
```

6. Repackage the full project, keeping `src/firebase-config.js` and `src/online.js`. Open **ÇEVRİMİÇİ VS** on phone 1 and choose **ODA KUR**. Enter its six-character code on phone 2 and choose **KODA KATIL**. Only the room host starts the match. The VS match has five rounds: each round gives each player 2,000 credits and a 15-second equipment period; movement and firing start when the countdown ends. The room host keeps the round clock and scoreboard in sync. Keep the `hits` rule above so damage can reach the other player.

The browser Firebase config is not a secret; the database rules restrict access. Anonymous sign-in requires internet. The app downloads Firebase's official browser SDK when the online panel is used. This is a free-plan prototype; Firebase quotas apply. Movement, weapon damage, round state and scores synchronize through the room. A dedicated server would be needed for cheat-resistant competitive play.
