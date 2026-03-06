import { text } from "express";

// References
let generateBtn = document.getElementById("generateBtn");
let saveBtn = document.getElementById("saveBtn");
let copyBtn = document.getElementById("copyBtn");
let autoBtn = document.getElementById("autoBtn");
let filterBtn = document.getElementById("filterBtn");

let statusText = document.getElementById("status");
let quoteText = document.getElementById("quoteText");
let quoteAuthor = document.getElementById("quoteAuthor");

let authorInput = document.getElementById("authorInput");
let searchFavInput = document.getElementById("searchFavInput");
let favoritesList = document.getElementById("favoritesList");

let popup = document.getElementById("popup");
let popupText = document.getElementById("popupText");

let currentQuote = null;
let autoInterval = null;

// Load favorites
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Show popup
function showPopup(message) {
  popupText.textContent = message;
  popup.style.display = "block";
  setTimeout(() => { popup.style.display = "none"; }, 2000);
}

// Render favorites
function renderFavorites() {
  let searchTerm = searchFavInput.value.toLowerCase().trim();
  favoritesList.innerHTML = "";

  favorites
    .filter(q => q.content.toLowerCase().includes(searchTerm) || q.author.toLowerCase().includes(searchTerm))
    .forEach((q, index) => {
      let li = document.createElement("li");
      li.textContent = `"${q.content}" - ${q.author}`;

      let deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        favorites.splice(index, 1);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
      });

      li.appendChild(deleteBtn);
      favoritesList.appendChild(li);
    });
}

// Fetch quote (API-Ninjas with fallback)
async function generateQuote() {
  statusText.textContent = "Loading quote...";
  quoteText.textContent = "";
  quoteAuthor.textContent = "";

  try {
    let response = await fetch("http://localhost:5000/quotes");
    if (!response.ok) throw new Error("Failed to fetch");

    let data = await response.json();
    let quote = data[Math.floor(Math.random() * data.length)];
    currentQuote = quote;

    quoteText.textContent = `"${quote.content}"`;
    quoteAuthor.textContent = `- ${quote.author}`;
    showPopup("Quote loaded!");
  } catch (err) {
    if (err.message === "Failed to fetch") {
      // Fallback hardcoded quotes
      const fallbackQuotes = [
      { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
      { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
      { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
      { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
      { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { text: "Happiness depends upon ourselves.", author: "Aristotle" },
      { text: "Don’t count the days, make the days count.", author: "Muhammad Ali" },
      { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
      { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
      { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { text: "Happiness depends upon ourselves.", author: "Aristotle" },
      { text: "Don’t count the days, make the days count.", author: "Muhammad Ali" },
      { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
      {text: "Success is not the end product of luck, it is the product or result of hardwork", author: "Igba Simon"},
      { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
      { text: "Your time is limited, so don’t waste it living someone else’s life.", author: "Steve Jobs" },
      { text: "Everything you’ve ever wanted is on the other side of fear.", author: "George Addair" },
      { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
      { text: "Fall seven times and stand up eight.", author: "Japanese Proverb" },
      { text: "Act as if what you do makes a difference. It does.", author: "William James" },
      { text: "Don’t wait. The time will never be just right.", author: "Napoleon Hill" },
      { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
      { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
      { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
      { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
      { text: "I never dreamed about success, I worked for it.", author: "Estee Lauder" },
      { text: "Don’t be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
      { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" }  
    ];
      let quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      currentQuote = quote;
      quoteText.textContent = `"${quote.content}"`;
      quoteAuthor.textContent = `- ${quote.author}`;
      showPopup("Using fallback quote!");
    } else {
      showPopup("Error fetching quote!");
      console.error(err);
    }
  }
}

// Save quote
function saveQuote() {
  if (!currentQuote) return showPopup("Generate a quote first!");
  if (favorites.some(q => q.content === currentQuote.content)) return showPopup("Already saved!");
  favorites.push(currentQuote);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
  showPopup("Saved successfully!");
}

// Copy quote
function copyQuote() {
  if (!currentQuote) return showPopup("Generate a quote first!");
  navigator.clipboard.writeText(`"${currentQuote.content}" - ${currentQuote.author}`)
    .then(() => showPopup("Copied!"))
    .catch(() => showPopup("Failed to copy!"));
}

// Auto-generate toggle
function toggleAutoGenerate() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
    autoBtn.textContent = "Start Auto-Generate";
    showPopup("Auto-generation stopped");
  } else {
    generateQuote();
    autoInterval = setInterval(generateQuote, 10000);
    autoBtn.textContent = "Stop Auto-Generate";
    showPopup("Auto-generation started");
  }
}

// Filter by author
async function filterQuoteByAuthor() {
  let author = authorInput.value.trim();
  if (!author) return showPopup("Enter an author!");
  
  try {
    let response = await fetch("http://localhost:5000/quotes");
    if (!response.ok) throw new Error("Failed to fetch");

    let data = await response.json();
    let filtered = data.filter(q => q.author.toLowerCase().includes(author.toLowerCase()));
    if (filtered.length === 0) return showPopup("No quotes found!");

    let quote = filtered[Math.floor(Math.random() * filtered.length)];
    currentQuote = quote;
    quoteText.textContent = `"${quote.content}"`;
    quoteAuthor.textContent = `- ${quote.author}`;
    showPopup("Quote loaded!");
  } catch (err) {
    showPopup("Error fetching quotes!");
    console.error(err);
  }
}

// Event listeners
generateBtn.addEventListener("click", generateQuote);
saveBtn.addEventListener("click", saveQuote);
copyBtn.addEventListener("click", copyQuote);
autoBtn.addEventListener("click", toggleAutoGenerate);
filterBtn.addEventListener("click", filterQuoteByAuthor);
searchFavInput.addEventListener("input", renderFavorites);

// Initial render
renderFavorites();
