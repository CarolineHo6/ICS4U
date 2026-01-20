const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

const TEAMS_FILE = path.join(__dirname, "teams.json");
const GAMES_FILE = path.join(__dirname, "games.json");

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Error parsing", filePath, err);
    return [];
  }
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

let teams = loadJson(TEAMS_FILE);
let games = loadJson(GAMES_FILE);

let nextTeamId = teams.reduce((max, t) => Math.max(max, t.id), 0) + 1;
let nextGameId = games.reduce((max, g) => Math.max(max, g.id), 0) + 1;

// TODO: Add /teams and /games CRUD routes below.
app.get("/teams", (req, res) => {
  res.json(teams);
});

app.get("/teams/:id", (req, res) => {
  const id = Number(req.params.id);
  const team = teams.find(t => t.id === id);
  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }
  res.json(team);
});

app.post("/teams", (req, res) => {
  const { name, shortName, school, sport, level } = req.body;
  if (!name || !school || !sport || !level) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newTeam = {
    id: nextTeamId++,
    name,
    shortName: shortName || name,
    school,
    sport,
    level
  };
  teams.push(newTeam);
  saveJson(TEAMS_FILE, teams);
  res.status(201).json(newTeam);
});

app.put("/teams/:id", (req, res) => {
  const id = Number(req.params.id);
  const team = teams.find(t => t.id === id);
  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }
  const { name, shortName, school, sport, level } = req.body;
  if (!name && !shortName && !school && !sport && !level) {
    return res.status(400).json({ error: "No fields provided to update" });
  }
  if (name !== undefined) team.name = name;
  if (shortName !== undefined) team.shortName = shortName;
  if (school !== undefined) team.school = school;
  if (sport !== undefined) team.sport = sport;
  if (level !== undefined) team.level = level;
  saveJson(TEAMS_FILE, teams);
  res.json(team);
});

app.delete("/teams/:id", (req, res) => {
  const id = Number(req.params.id);
  const usedInGame = games.some(g => g.homeTeamId === id || g.awayTeamId === id);
  if (usedInGame) {
    return res.status(400).json({
      error: "Cannot delete team that is used in games. Delete or update those games first."
    });
  }
  const index = teams.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Team not found" });
  }
  const deleted = teams.splice(index, 1)[0];
  saveJson(TEAMS_FILE, teams);
  res.json(deleted);
});

app.get("/games", (req, res) => {
  res.json(games);
});

app.get("/games/:id", (req, res) => {
  const id = Number(req.params.id);
  const game = games.find(g => g.id === id);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }
  res.json(game);
});

app.post("/games", (req, res) => {
  const { homeTeamId, awayTeamId, date, time, location, homeScore, awayScore, notes } = req.body;
  if (!homeTeamId || !awayTeamId || !date || !time || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const homeTeam = teams.find(t => t.id === Number(homeTeamId));
  const awayTeam = teams.find(t => t.id === Number(awayTeamId));
  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: "homeTeamId and awayTeamId must be valid team ids" });
  }
  const newGame = {
    id: nextGameId++,
    homeTeamId: Number(homeTeamId),
    awayTeamId: Number(awayTeamId),
    date,
    time,
    location,
    homeScore: homeScore !== undefined ? Number(homeScore) : 0,
    awayScore: awayScore !== undefined ? Number(awayScore) : 0,
    notes: notes || ""
  };
  games.push(newGame);
  saveJson(GAMES_FILE, games);
  res.status(201).json(newGame);
});

app.put("/games/:id", (req, res) => {
  const id = Number(req.params.id);
  const game = games.find(g => g.id === id);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }
  const { homeTeamId, awayTeamId, date, time, location, homeScore, awayScore, notes } = req.body;
  if (
    homeTeamId === undefined &&
    awayTeamId === undefined &&
    date === undefined &&
    time === undefined &&
    location === undefined &&
    homeScore === undefined &&
    awayScore === undefined &&
    notes === undefined
  ) {
    return res.status(400).json({ error: "No fields provided to update" });
  }
  if (homeTeamId !== undefined) {
    const homeTeam = teams.find(t => t.id === Number(homeTeamId));
    if (!homeTeam) {
      return res.status(400).json({ error: "homeTeamId must be a valid team id" });
    }
    game.homeTeamId = Number(homeTeamId);
  }
  if (awayTeamId !== undefined) {
    const awayTeam = teams.find(t => t.id === Number(awayTeamId));
    if (!awayTeam) {
      return res.status(400).json({ error: "awayTeamId must be a valid team id" });
    }
    game.awayTeamId = Number(awayTeamId);
  }
  if (date !== undefined) game.date = date;
  if (time !== undefined) game.time = time;
  if (location !== undefined) game.location = location;
  if (homeScore !== undefined) game.homeScore = Number(homeScore);
  if (awayScore !== undefined) game.awayScore = Number(awayScore);
  if (notes !== undefined) game.notes = notes;
  saveJson(GAMES_FILE, games);
  res.json(game);
});

app.delete("/games/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = games.findIndex(g => g.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Game not found" });
  }
  const deleted = games.splice(index, 1)[0];
  saveJson(GAMES_FILE, games);
  res.json(deleted);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
