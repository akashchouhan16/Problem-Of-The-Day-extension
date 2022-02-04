//Preloader
let loader = document.getElementById("preloader");
let loadergif = document.getElementById("loadgif");
const url = "https://problemoftheday-server.herokuapp.com/problemoftheday?key=";
let ui_elements = {
  problem_id: "",
  problem_statement: "",
  topic: "",
  link: "",
};

window.addEventListener("load", async function () {
  startTime();

  let date = new Date();
  let month = date.getMonth();
  let day = date.getDate();
  let datestring = String(day) + String(month + 1);
  console.log(datestring);

  // Connection to Backend:
  try {
    const temp = await fetch(url + datestring);
    const data = await temp.json();

    ui_elements.problem_id = data.response.problem_id;
    ui_elements.topic = data.response.topic;
    ui_elements.link = data.response.link;
    ui_elements.problem_statement = data.response.problem;

    // Update UI:
    updateUI();
  } catch (e) {
    console.log(e.message);
  }

  loadergif.classList.add("fade-out-fast");
  loader.classList.add("fade-out");
});

//Date Display
let dt = new Date();

const options = {
  month: "short",
  day: "numeric",
};

dt = dt.toLocaleString("en-US", options);
document.getElementById("date").innerHTML = dt;

//Time Display
function startTime() {
  const date = new Date();

  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes + " " + ampm;

  document.getElementById("time").innerHTML = strTime;
  setTimeout(startTime, 1000);
}

const updateUI = () => {
  // Question description
  let question = ui_elements.problem_statement;
  if (question.length > 55) {
    // Question description tooltip
    let tooltip = document.getElementById("q-tooltip");
    tooltip.classList.add("tooltip");
    document.getElementById("question-tooltip").innerHTML = question;

    question = question.substring(0, 55) + "... ";
  }
  document.getElementById("question").innerHTML = question;

  // Question topic
  let topic = ui_elements.topic;
  document.getElementById("topic").innerHTML = topic;

  // Question link
  let link = ui_elements.link;
  document.getElementById("solve-btn").addEventListener("click", function () {
    window.open(link, "_blank");
  });
};