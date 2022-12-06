//Preloader
let loader = document.getElementById("preloader");
let loadergif = document.getElementById("loadgif");
const problemsAPI_url = "https://potd-node-service-1.vercel.app/problemoftheday?key=";
const contestAPI_url = "https://potd-node-service-1.vercel.app/contests/";

let POTDStorage = window.localStorage;
let ui_elements = {
  problem_id: "", problem_statement: "", topic: "", url: "", key: 0,
};

const generateKey = () => {
  let date = new Date();
  return String(date.getDate()) + String(date.getMonth() + 1);
};

window.addEventListener("load", async ()=> {
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
    .addEventListener("click", ()=>{
      flkty.next();
    });

  document
    .getElementById("main-to-contests")
    .addEventListener("click", ()=>{
      flkty.previous();
    });

  document
    .getElementById("liked-to-main")
    .addEventListener("click", ()=>{
      flkty.previous();
    });

  document
    .getElementById("contests-to-main")
    .addEventListener("click", ()=>{
      flkty.next();
    });

  startTime();
  let datestring = generateKey();

  // ====================== Connection to Backend ======================
  try {
    // Prevent Network request to the server if POTD is cached.
    let key = POTDStorage.getItem("key");
    if (key !== null && key === datestring) {

      console.info("Extension Cache Hit.");
      ui_elements.problem_id = POTDStorage.getItem("problem_id");
      ui_elements.topic = POTDStorage.getItem("topic");
      ui_elements.url = POTDStorage.getItem("url");
      ui_elements.problem_statement = POTDStorage.getItem("problem_statement");

    } else {
      console.info("Network Request made to POTD Servers. Data Cached.");
      const temp = await fetch(problemsAPI_url + datestring);
      const data = await temp.json();

      ui_elements.problem_id = data.response.problem_id;
      ui_elements.topic = data.response.topic;
      ui_elements.url = data.response.link;
      ui_elements.problem_statement = data.response.problem;

      // remove previous problem:
      POTDStorage.removeItem("problem_id");
      POTDStorage.removeItem("topic");
      POTDStorage.removeItem("url");
      POTDStorage.removeItem("problem_statement");
      //save to localStorage:
      POTDStorage.setItem("problem_id", ui_elements.problem_id);
      POTDStorage.setItem("topic", ui_elements.topic);
      POTDStorage.setItem("url", ui_elements.url);
      POTDStorage.setItem("problem_statement", ui_elements.problem_statement);
      POTDStorage.setItem("key", datestring);
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
    .addEventListener("mouseover", ()=>{
      document.getElementById("question-tooltip").classList.add("show-tooltip");
    });

  document
    .getElementById("tooltip-button")
    .addEventListener("mouseout", ()=>{
      document
        .getElementById("question-tooltip")
        .classList.remove("show-tooltip");
    });

  loadergif.classList.add("fade-out-fast");
  loader.classList.add("fade-out");
});


let dt = new Date();
const options = {
  month: "short",
  day: "numeric",
};

dt = dt.toLocaleString("en-US", options);
document.getElementById("date").innerHTML = dt;

//Time Display
const startTime = ()=> {
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

// ====================== POTD UI ====================== 
const updateUI = () => {
  question = ui_elements.problem_statement;
  let topic = ui_elements.topic;

  let tooltip = document.getElementById("q-tooltip");
  tooltip.classList.add("tooltip");

  question =
    question.length > 100 ? question.substring(0, 100) + "..." : question;

  let tooltiptext = question.length > 45 ? question + "<br/><br/>" : "";

  document.getElementById("question-tooltip").innerHTML =
    tooltiptext + '<span id="question-topic">Topic - ' + topic + "</span>";


  if (question.length > 45)
    question = question.substring(0, 45) + "... ";
  
  document.getElementById("question").innerHTML = question;

  let link = ui_elements.url;
  document.getElementById("solve-btn").addEventListener("click", function () {
    window.open(link, "_blank");
  });
};

// ====================== ContestsAPI Feature ====================== 
let container = document.getElementById("Contests");

document
  .getElementById("contests-list")
  .addEventListener("change", function () {
    getContestDetails(this.value);
  });

// Utility Methods:
async function getContestDetails(platform) {
  try {
    let url = contestAPI_url
    if (platform) { 
      url = url + platform;
    } else {
      url = url + '0';
    }
    
    const response = await fetch(url);
    const data = await response.json();

    // Update Contests UI
    updateContestList(data.contests);
  } catch (error) {
    console.error(error.message);
  }
}

function updateContestList(data) {
  container.innerHTML = "";
  for (let i in data) {
    let li = document.createElement("li");
    let atag = document.createElement("a");
    atag.setAttribute("href", data[i].url);
    atag.setAttribute("target", "_blank");
    atag.textContent = data[i].name;

    li.setAttribute("class", "zoom-2");
    li.appendChild(atag);
    container.appendChild(li);
  }
}

// ====================== Bookmark Feature ======================
let bookmarkHeart = document.getElementById("bookmark-heart");
let bookmarkContainer = document.getElementById("Bookmarks");
let question = document.getElementById("question");
let list = [];

document.addEventListener("DOMContentLoaded", function () {
  bookmarkHeart.addEventListener("click", generateBookmark);
});

//  Utility Methods:
function generateBookmark() {

  let index = list.findIndex(item => {
    let listObject = JSON.parse(item);
    return listObject.question == ui_elements.problem_statement
  });

  if(index != -1)
     removeBookmark(list[index])
  else{
     let bookmarkObject = {question: question, url: ui_elements.url}
     let stringifiedObject = JSON.stringify(bookmarkObject);
     POTDStorage.setItem("Bookmark" + generateKey(), stringifiedObject);
  }
  fetchBookmarks();
}

function setHeartColor() {
  bookmarkHeart.src = "/assets/heart-icon-grey.png";

  for (let element in POTDStorage) {
    let result = element.includes("Bookmark");
    if (result) {
      if (element.includes(generateKey())) {
        bookmarkHeart.src = "/assets/heart-icon-red.png";
      }
    }
  }
}

async function removeBookmark(value) {

  value = JSON.parse(value);
  for (let element in POTDStorage) {
    let result = element.includes("Bookmark");
    if (result) {
      let storageItem = JSON.parse(POTDStorage.getItem(element));
    
      if (storageItem.question === value.question) {
        POTDStorage.removeItem(element);
        fetchBookmarks();
        setHeartColor();
        break;
      }
    }
  }
}

function fetchBookmarks() {
  list = [];
  for (let element in POTDStorage) {
    let result = element.includes("Bookmark");
    if (result)
      list.push(POTDStorage.getItem(element));
  }

  setHeartColor();

  bookmarkContainer.innerHTML = "";

  for (let item of list) {
    let li = document.createElement("li");
    let atag = document.createElement("a");
    let img = document.createElement("img");
    let btn = document.createElement("button");
    let bookmarkObject = JSON.parse(item);

    atag.setAttribute("target", "_blank");
    atag.setAttribute("href", bookmarkObject.url);
    atag.textContent = bookmarkObject.question;    
  
    btn.setAttribute("value", item);
    btn.setAttribute("class", "bookmark-del-btn");

    img.setAttribute("src", "/assets/delete-icon.png");

    btn.append(img);
    li.setAttribute("class", "zoom-2");
    li.append(atag);
    li.append(btn);
    bookmarkContainer.appendChild(li);
  }

  let btns = document.getElementsByClassName("bookmark-del-btn");

  for (const button of btns) {
    button.addEventListener("click", function () {
      removeBookmark(this.value);
    });
  }
  console.info("Bookmarks updated.");
}
