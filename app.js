import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================
   ADMIN KEY
========================= */

const ADMIN_KEY = "XOTZ8GADMIN";


/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyCidr1DAcB23lVyg1icMXUZm2HG6OGTq8",
  authDomain: "class8gngl.firebaseapp.com",
  projectId: "class8gngl",
  storageBucket: "class8gngl.firebasestorage.app",
  messagingSenderId: "121527977909",
  appId: "1:121527977909:web:77f1289393cadb46867bfc"
};

const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);


/* =========================
   LOGIN ELEMENTS
========================= */

const loginScreen =
  document.getElementById(
    "loginScreen"
  );

const dashboard =
  document.getElementById(
    "dashboard"
  );

const adminKey =
  document.getElementById(
    "adminKey"
  );

const loginButton =
  document.getElementById(
    "loginButton"
  );

const loginError =
  document.getElementById(
    "loginError"
  );

const logoutButton =
  document.getElementById(
    "logoutButton"
  );


/* =========================
   DASHBOARD ELEMENTS
========================= */

const messagesContainer =
  document.getElementById(
    "messages"
  );

const totalMessages =
  document.getElementById(
    "totalMessages"
  );

const loading =
  document.getElementById(
    "loading"
  );

const empty =
  document.getElementById(
    "empty"
  );

const error =
  document.getElementById(
    "error"
  );


/* =========================
   LOGIN
========================= */

loginButton.addEventListener(
  "click",
  login
);


adminKey.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {
      login();
    }

  }
);


function login() {

  const key =
    adminKey.value.trim();

  if (key === ADMIN_KEY) {

    sessionStorage.setItem(
      "class8g_admin",
      "true"
    );

    loginScreen.classList.add(
      "hidden"
    );

    dashboard.classList.remove(
      "hidden"
    );

    startDashboard();

  } else {

    loginError.classList.remove(
      "hidden"
    );

    adminKey.value = "";

    adminKey.focus();

  }

}


/* =========================
   CHECK SESSION
========================= */

if (
  sessionStorage.getItem(
    "class8g_admin"
  ) === "true"
) {

  loginScreen.classList.add(
    "hidden"
  );

  dashboard.classList.remove(
    "hidden"
  );

  startDashboard();
}


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
  "click",
  () => {

    sessionStorage.removeItem(
      "class8g_admin"
    );

    location.reload();

  }
);


/* =========================
   START DASHBOARD
========================= */

let dashboardStarted = false;

function startDashboard() {

  if (dashboardStarted) return;

  dashboardStarted = true;

  listenToMessages();
}


/* =========================
   FIRESTORE
========================= */

function listenToMessages() {

  const messagesQuery =
    query(
      collection(
        db,
        "messages"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );


  onSnapshot(
    messagesQuery,

    (snapshot) => {

      loading.classList.add(
        "hidden"
      );

      error.classList.add(
        "hidden"
      );

      messagesContainer.innerHTML =
        "";

      totalMessages.textContent =
        snapshot.size;


      if (snapshot.empty) {

        empty.classList.remove(
          "hidden"
        );

        return;
      }


      empty.classList.add(
        "hidden"
      );


      let number = 1;


      snapshot.forEach(
        (messageDoc) => {

          createMessageCard(
            messageDoc.id,
            messageDoc.data(),
            number
          );

          number++;

        }
      );

    },

    (err) => {

      console.error(err);

      loading.classList.add(
        "hidden"
      );

      error.classList.remove(
        "hidden"
      );

      error.textContent =
        "Gagal mengambil pesan: " +
        err.message;

    }
  );

}


/* =========================
   CREATE CARD
========================= */

function createMessageCard(
  id,
  data,
  number
) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "message-card";


  /* TOP */

  const top =
    document.createElement(
      "div"
    );

  top.className =
    "message-top";


  const numberElement =
    document.createElement(
      "span"
    );

  numberElement.className =
    "message-number";

  numberElement.textContent =
    `MESSAGE #${number}`;


  const type =
    document.createElement(
      "span"
    );

  type.className =
    "message-type";

  type.textContent =
    data.type || "Message";


  top.appendChild(
    numberElement
  );

  top.appendChild(
    type
  );


  /* INFO */

  const info =
    document.createElement(
      "div"
    );

  info.className =
    "message-info";


  const toBox =
    createInfoBox(
      "SEND THIS TO",
      data.to || "Unknown"
    );


  const fromBox =
    createInfoBox(
      "THIS IS FROM",
      data.from || "Anonymous"
    );


  info.appendChild(
    toBox
  );

  info.appendChild(
    fromBox
  );


  /* MESSAGE */

  const text =
    document.createElement(
      "div"
    );

  text.className =
    "message-text";

  /*
    textContent digunakan supaya
    pesan tidak bisa menjalankan
    HTML atau JavaScript.
  */

  text.textContent =
    data.text ||
    "(Pesan kosong)";


  /* FOOTER */

  const footer =
    document.createElement(
      "div"
    );

  footer.className =
    "message-footer";


  const time =
    document.createElement(
      "span"
    );

  time.className =
    "message-time";


  if (data.createdAt) {

    try {

      const date =
        data.createdAt.toDate();

      time.textContent =
        date.toLocaleString(
          "id-ID",
          {
            dateStyle: "medium",
            timeStyle: "short"
          }
        );

    } catch {

      time.textContent =
        "Waktu tidak tersedia";
    }

  } else {

    time.textContent =
      "Menunggu waktu...";
  }


  /* DELETE */

  const deleteButton =
    document.createElement(
      "button"
    );

  deleteButton.className =
    "delete-btn";

  deleteButton.textContent =
    "Hapus";


  deleteButton.addEventListener(
    "click",
    async () => {

      const confirmed =
        confirm(
          "Yakin ingin menghapus pesan ini?"
        );


      if (!confirmed) return;


      deleteButton.disabled =
        true;

      deleteButton.textContent =
        "Menghapus...";


      try {

        await deleteDoc(
          doc(
            db,
            "messages",
            id
          )
        );

      } catch (err) {

        console.error(err);

        alert(
          "Gagal menghapus pesan."
        );

        deleteButton.disabled =
          false;

        deleteButton.textContent =
          "Hapus";
      }

    }
  );


  footer.appendChild(
    time
  );

  footer.appendChild(
    deleteButton
  );


  card.appendChild(
    top
  );

  card.appendChild(
    info
  );

  card.appendChild(
    text
  );

  card.appendChild(
    footer
  );


  messagesContainer.appendChild(
    card
  );

}


/* =========================
   INFO BOX
========================= */

function createInfoBox(
  label,
  value
) {

  const box =
    document.createElement(
      "div"
    );

  box.className =
    "info-box";


  const labelElement =
    document.createElement(
      "span"
    );

  labelElement.className =
    "info-label";

  labelElement.textContent =
    label;


  const valueElement =
    document.createElement(
      "span"
    );

  valueElement.className =
    "info-value";

  valueElement.textContent =
    value;


  box.appendChild(
    labelElement
  );

  box.appendChild(
    valueElement
  );


  return box;
}
