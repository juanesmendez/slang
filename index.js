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

        const activities = [];

        for (activity of response.data.activities) {
          const act = new Activity(
            activity.id,
            activity.user_id,
            activity.answered_at,
            activity.first_seen_at
          );

          activities.push(act);
        }
        resolve(activities);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

function getUserSessions(activities) => {

}

const activities = getActivitiesData();

activities.then((res) => {
  console.log(res);
});
