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
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyCidr1DAcB23lVyg1icMXUZm2HG6OGTnq8",
  authDomain: "class8gngl.firebaseapp.com",
  projectId: "class8gngl",
  storageBucket: "class8gngl.firebasestorage.app",
  messagingSenderId: "121527977909",
  appId: "1:121527977909:web:77f1289393cadb46867bfc"
};


/* =========================
   INITIALIZE FIREBASE
========================= */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================
   ELEMENTS
========================= */

const messagesContainer =
  document.getElementById("messages");

const totalMessages =
  document.getElementById("totalMessages");

const loading =
  document.getElementById("loading");

const empty =
  document.getElementById("empty");

const error =
  document.getElementById("error");


/* =========================
   FIRESTORE QUERY
========================= */

const messagesQuery = query(
  collection(db, "messages"),
  orderBy("createdAt", "desc")
);


/* =========================
   REALTIME LISTENER
========================= */

onSnapshot(
  messagesQuery,

  (snapshot) => {

    loading.classList.add("hidden");
    error.classList.add("hidden");

    messagesContainer.innerHTML = "";

    totalMessages.textContent = snapshot.size;

    if (snapshot.empty) {

      empty.classList.remove("hidden");

      return;
    }

    empty.classList.add("hidden");

    let number = 1;

    snapshot.forEach((messageDoc) => {

      const data = messageDoc.data();

      createMessageCard(
        messageDoc.id,
        data,
        number
      );

      number++;
    });
  },

  (err) => {

    console.error(err);

    loading.classList.add("hidden");

    error.classList.remove("hidden");

    error.textContent =
      "Gagal mengambil pesan: " + err.message;
  }
);


/* =========================
   CREATE MESSAGE CARD
========================= */

function createMessageCard(id, data, number) {

  const card =
    document.createElement("article");

  card.className = "message-card";


  /* NUMBER */

  const numberElement =
    document.createElement("div");

  numberElement.className =
    "message-number";

  numberElement.textContent =
    `MESSAGE #${number}`;


  /* MESSAGE TEXT */

  const text =
    document.createElement("div");

  text.className = "message-text";

  // textContent digunakan agar pesan tidak
  // bisa menjalankan HTML/JavaScript.
  text.textContent =
    data.text || "(Pesan kosong)";


  /* FOOTER */

  const footer =
    document.createElement("div");

  footer.className =
    "message-footer";


  /* TIME */

  const time =
    document.createElement("span");

  time.className =
    "message-time";

  if (data.createdAt) {

    try {

      const date =
        data.createdAt.toDate();

      time.textContent =
        date.toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short"
        });

    } catch {

      time.textContent =
        "Waktu tidak tersedia";
    }

  } else {

    time.textContent =
      "Menunggu waktu...";
  }


  /* DELETE BUTTON */

  const deleteButton =
    document.createElement("button");

  deleteButton.className =
    "delete-btn";

  deleteButton.textContent =
    "Hapus";


  deleteButton.addEventListener(
    "click",
    async () => {

      const confirmDelete =
        confirm(
          "Yakin ingin menghapus pesan ini?"
        );

      if (!confirmDelete) return;

      deleteButton.disabled = true;

      deleteButton.textContent =
        "Menghapus...";

      try {

        await deleteDoc(
          doc(db, "messages", id)
        );

      } catch (err) {

        console.error(err);

        alert(
          "Gagal menghapus pesan."
        );

        deleteButton.disabled = false;

        deleteButton.textContent =
          "Hapus";
      }
    }
  );


  footer.appendChild(time);
  footer.appendChild(deleteButton);

  card.appendChild(numberElement);
  card.appendChild(text);
  card.appendChild(footer);

  messagesContainer.appendChild(card);
}