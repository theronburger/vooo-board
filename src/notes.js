const CMS_URL = "https://cms.lcb.de";
const md = window.markdownit();

async function fetchCMSData(endpoint) {
  const response = await fetch(`${CMS_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function loadBoardData(boardName) {
  const boards = await fetchCMSData("/items/boards");
  return boards.data.find(board => board.name === boardName);
}

async function loadNotesData(boardId) {
  const notes = await fetchCMSData("/items/notes");
  const relationships = await fetchCMSData("/items/notes_boards");
  console.log(notes.data);
  notes.data.forEach(note => {
    note.boards = note.boards.map(boardId => relationships.data.find(rel => rel.id === boardId).boards_id);
  });
  return notes.data.filter(note => note.boards.includes(boardId));
}

async function loadImage(assetId) {
  const response = await fetch(`${CMS_URL}/assets/${assetId}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.blob();
}

async function setupBoard(boardName) {
  try {
    const board = await loadBoardData(boardName);
    if (!board) {
      document.getElementById("board").innerHTML = "404: Board not found";
      return;
    }

    const notes = await loadNotesData(board.id);
    console.log(`📝 Found ${notes.length} notes for "${board.name}" board`);
    const boardDiv = document.getElementById("board");

    loadImage(board.background).then(blob => {
      boardDiv.style.backgroundImage = `url(${URL.createObjectURL(blob)})`;
    });

    notes.forEach(note => {
      console.log(`📝 Adding note ${note.id}`, note)
      const noteDiv = document.createElement("div");
      noteDiv.className = "note";
      noteDiv.style.transform = `translate(${note.pos_horizontal}px, ${note.pos_vertical}px) rotate(${note.rotation}deg)`;

      noteDiv.style.width = `${note.width}px`;
      noteDiv.style.height = `${note.height}px`;
      noteDiv.style.zIndex = note.z_index;

      if (note.image) {
        loadImage(note.image).then(blob => {
          const img = document.createElement("img");
          img.src = URL.createObjectURL(blob);
          noteDiv.appendChild(img);
        });
      }

      if (note.text) {
        const text = document.createElement("div");
        text.className = "text";
        text.style.padding = `${note.padding}px`;
        text.style.textAlign = note.justification || "left";
        text.style.fontFamily = note.font || "sans-serif";
        text.innerHTML = md.render(note.text);
        noteDiv.appendChild(text);
      }

      boardDiv.appendChild(noteDiv);
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

// get board name from the URL query string
const params = new URLSearchParams(window.location.search);
const boardName = params.get('board');

setupBoard(boardName);