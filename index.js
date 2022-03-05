//import Activity from "./model/Activity";

const axios = require("axios");

class Activity {
  constructor(id, userId, answeredAt, firstSeenAt) {
    this.id = id;
    this.userId = userId;
    this.answeredAt = new Date(answeredAt);
    this.firstSeenAt = new Date(firstSeenAt);
  }
}

class Session {
  constructor() {
    this.startedAt = null;
    this.endedAt = null;
    this.activityIds = [];
    this.durationSeconds = 0;
  }
}

const getActivitiesData = () => {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.slangapp.com/challenges/v1/activities", {
        headers: {
          Authorization:
            "Basic NDA6VTNlcFpQS1AzSmUrd01JOTJJWTA5OTVnVFRjQWZ3R1ByazMvTk9LVVhsdz0=",
        },
      })
      .then(function (response) {
        const activities = new Map();

        for (activity of response.data.activities) {
          const act = new Activity(
            activity.id,
            activity.user_id,
            activity.answered_at,
            activity.first_seen_at
          );

          if (
            activities.get(act.userId) == null ||
            activities.get(act.userId) == undefined
          ) {
            let userActivities = [];
            userActivities.push(activity);
            activities.set(act.userId, userActivities);
          } else {
            activities.get(act.userId).push(act);
          }
        }
        resolve(activities);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

// this function complexity is O(N^2), given that I iterate for every
// user, and for each user, I iterate its own list of activities in order to calculate
// all of the sessions data for that user
function getUserSessions(activities) {
  var sessionsMap = new Map();

  for (const [userId, acts] of activities) {
    console.log(userId, acts);

    var sessions = [];
    sessionsMap.set(userId, sessions);

    if (acts.length > 1) {
      const sortedActivities = acts.sort(
        (a, b) => a.firstSeenAt - b.firstSeenAt
      );

      var prevAct = sortedActivities[0];

      var session = new Session();

      session.activityIds.push(prevAct.id);
      session.startedAt = prevAct.firstSeenAt;

      for (i = 1; i < sortedActivities.length; i++) {
        let diffMs = sortedActivities[i].firstSeenAt - prevAct.answeredAt;

        if (Math.round(((diffMs % 86400000) % 3600000) / 60000) <= 5) {
          session.activityIds.push(sortedActivities[i].id);
        } else {
          session.endedAt = prevAct.answeredAt;
          var diffSession = session.endedAt - session.startedAt;
          session.durationSeconds =
            Math.round(((diffSession % 86400000) % 3600000) / 60000) * 60;
          sessions.push(session);
          // Create a new session
          session = new Session();
          session.activityIds.push(sortedActivities[i].id);
          session.startedAt = sortedActivities[i].firstSeenAt;
        }
        prevAct = sortedActivities[i];
      }
    }
  }

  console.log(sessionsMap);
  return sessionsMap;
}

const activities = getActivitiesData();

activities.then((res) => {
  var response = {
    user_sessions: getUserSessions(res),
  };

  console.log(response);
});
