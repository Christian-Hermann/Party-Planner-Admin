// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2504-FTB-ET-WEB-FT"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function partyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
  <h3>Add a New Party</h3>
  <input name="name" placeholder="Name" required />
  <input name="description" placeholder="Description" required />
  <input name="date" type="date" required />
  <input name="location" type="text" required/>
  <button type="submit">Add Party</button>
  `;

  $form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newParty = {
      name: $form.name.value,
      description: $form.description.value,
      date: new Date($form.date.value).toISOString(),
      location: $form.location.value,
    };

    try {
      await fetch(API + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParty),
      });
      await getParties();
      $form.reset();
    } catch (e) {
      console.error(e);
    }
  });
  return $form;
}

function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button id="delete-btn">Delete party</button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());

  const $deleteBtn = $party.querySelector("#delete-btn");
  $deleteBtn.addEventListener("click", async () => {
    try {
      await fetch(API + "/events/" + selectedParty.id, {
        method: "DELETE",
      });
      await getParties();
    } catch (e) {
      console.error(e);
    }
  });

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
      <section id="form-section">
      <form></form>
      </section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("form").replaceWith(partyForm());
  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
