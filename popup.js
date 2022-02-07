//Preloader
let loader = document.getElementById("preloader");
let loadergif = document.getElementById("loadgif");
const problemsAPI_url =
  "https://problemoftheday-server.herokuapp.com/problemoftheday?key=";
const contestAPI_url = "https://problemoftheday-server.herokuapp.com/contests/";

let myStorage = window.localStorage;
let ui_elements = {
  problem_id: "",
  problem_statement: "",
  topic: "",
  url: "",
  key: 0,
};

const generateKey = () => {
  let date = new Date();
  return String(date.getDate()) + String(date.getMonth() + 1);
};

window.addEventListener("load", async function () {
  // Flickity Carousel
  let elem = document.querySelector(".main-carousel");
  let flkty = new Flickity(elem, {
    autoPlay: false,
    cellAlign: "center",
    cellSelector: undefined,
    draggable: ">1",
    freeScroll: false,
    friction: 0.214,
    initialIndex: 1,
    prevNextButtons: false,
    pageDots: false,
    resize: false,
  });

  document
    .getElementById("main-to-liked")
    .addEventListener("click", function () {
      flkty.next();
    });

  document
    .getElementById("main-to-contests")
    .addEventListener("click", function () {
      flkty.previous();
    });

  document
    .getElementById("liked-to-main")
    .addEventListener("click", function () {
      flkty.previous();
    });

  document
    .getElementById("contests-to-main")
    .addEventListener("click", function () {
      flkty.next();
    });

  startTime();
  let datestring = generateKey();

  // Connection to Backend:
  try {
    // Prevent Network request to the server by caching the POTD onto browser storage.
    let key = myStorage.getItem("key");
    if (key !== null && key === datestring) {
      console.info("Extension Cache Hit.");
      ui_elements.problem_id = myStorage.getItem("problem_id");
      ui_elements.topic = myStorage.getItem("topic");
      ui_elements.url = myStorage.getItem("url");
      ui_elements.problem_statement = myStorage.getItem("problem_statement");
    } else {
      console.info("Network Request made to POTD Servers. Data Cached.");
      const temp = await fetch(problemsAPI_url + datestring);
      const data = await temp.json();

      ui_elements.problem_id = data.response.problem_id;
      ui_elements.topic = data.response.topic;
      ui_elements.url = data.response.link;
      ui_elements.problem_statement = data.response.problem;

      // remove previous problem:
      myStorage.removeItem("problem_id");
      myStorage.removeItem("topic");
      myStorage.removeItem("url");
      myStorage.removeItem("problem_statement");
      //save to localStorage:
      myStorage.setItem("problem_id", ui_elements.problem_id);
      myStorage.setItem("topic", ui_elements.topic);
      myStorage.setItem("url", ui_elements.url);
      myStorage.setItem("problem_statement", ui_elements.problem_statement);
      myStorage.setItem("key", datestring);
    }
    // ==============================================================================
    // Update UI:
    updateUI();
    // Update Contest details:
    await getContestDetails();
    //Update Bookmarked Problems:
    fetchBookmarks();
    // ==============================================================================
  } catch (e) {
    console.warn(e);
  }

  document
    .getElementById("tooltip-button")
    .addEventListener("mouseover", function checkHover() {
      document.getElementById("question-tooltip").classList.add("show-tooltip");
    });

  document
    .getElementById("tooltip-button")
    .addEventListener("mouseout", function checkHover() {
      document
        .getElementById("question-tooltip")
        .classList.remove("show-tooltip");
    });

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
  let seconds = date.getSeconds();

  let timerhour = 23 - hours;
  let timermin = 59 - minutes;
  let timersec = 59 - seconds;

  timersec = timersec < 10 ? "0" + timersec : timersec;

  //Timer color control
  if (timerhour == 0) document.getElementById("timer").style.color = "#ff5570";
  else document.getElementById("timer").style.color = "rgb(190, 190, 190)";

  let strTimeLeft = timerhour + "hr " + timermin + "m " + timersec + "s left";

  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes + " " + ampm;

  document.getElementById("time").innerHTML = strTime;
  document.getElementById("timer").innerHTML = strTimeLeft;

  setTimeout(startTime, 1000);
}

const updateUI = () => {
  question = ui_elements.problem_statement;
  let topic = ui_elements.topic;

  // Question description tooltip
  let tooltip = document.getElementById("q-tooltip");

  tooltip.classList.add("tooltip");

  question =
    question.length > 100 ? question.substring(0, 100) + "..." : question;

  let tooltiptext = question.length > 50 ? question + "<br/><br/>" : "";

  document.getElementById("question-tooltip").innerHTML =
    tooltiptext + '<span id="question-topic">Topic - ' + topic + "</span>";

  // Question description
  if (question.length > 50) {
    question = question.substring(0, 50) + "... ";
  }

  document.getElementById("question").innerHTML = question;

  // Question link
  let link = ui_elements.url;
  document.getElementById("solve-btn").addEventListener("click", function () {
    window.open(link, "_blank");
  });
};

//Contest Platform Selector
document
  .getElementById("contests-list")
  .addEventListener("change", function () {
    getContestDetails(this.value);
  });

// Fetch module
async function getContestDetails(platform) {
  try {
    const response = await fetch(contestAPI_url + platform);
    const data = await response.json();

    // Update Contests UI
    updateContestList(data.contests);
  } catch (error) {
    console.warn(error.message);
  }
}

let container = document.getElementById("Contests");

function updateContestList(data) {
  container.innerHTML = "";
  for (let i in data) {
    let li = document.createElement("li");
    let atag = document.createElement("a");
    atag.setAttribute("href", data[i].url);
    atag.setAttribute("target", "_blank");
    atag.textContent = data[i].name;

    li.appendChild(atag);
    container.appendChild(li);
  }
}

// Bookmark Feature:
document.addEventListener("DOMContentLoaded", function () {
  let bookmarkIcon = document.getElementById("bookmark");
  let bookmarkList = document.getElementById("main-to-liked");
  bookmarkIcon.addEventListener("click", generateBookmark);
  bookmarkIcon.addEventListener("click", bookmarkList);
});

let question = document.getElementById("question");
// console.log(question.innerText);

function generateBookmark() {
  myStorage.setItem("Bookmark" + generateKey(), question);
  console.info(`Problem Of The Day Bookmarked.`);
}

let bookmarkContainer = document.getElementById("Bookmarks");
function fetchBookmarks() {
  let list = [];
  for (let element in myStorage) {
    let result = element.includes("Bookmark");
    if (result) {
      list.push(myStorage.getItem(element));
    }
  }
  // for(let x in list)
  //   console.log(list[x]);

  for (let x in list) {
    let li = document.createElement("li");
    let atag = document.createElement("a");
    atag.setAttribute("target", "_blank");
    atag.textContent = list[x];

    li.append(atag);
    bookmarkContainer.appendChild(li);
  }
  console.info("Bookmarks updated.");
}
