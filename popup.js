//Preloader

let loader = document.getElementById("preloader");
let loadergif = document.getElementById("loadgif");

window.addEventListener("load", function () {
  setTimeout(function () {
    loadergif.classList.add("fade-out-fast");
    loader.classList.add("fade-out");
  }, 800);
  startTime();

  let date = new Date();
  let month = date.getMonth();
  let day = date.getDate();
  let datestring = String(day) + String(month + 1);

  console.log(datestring);
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

// Question description

let question = "Smallest sum contiguous subarray.";

if (question.length > 50) {
  question = question.substring(0, 50) + "... ";
}

document.getElementById("question").innerHTML = question;

// Question topic

let topic = "Dynamic Programming";

document.getElementById("topic").innerHTML = topic;

// Question link

let link = "https://www.geeksforgeeks.org/smallest-sum-contiguous-subarray/";

document.getElementById("solve-btn").addEventListener("click", function () {
  window.open(link, "_blank");
});
