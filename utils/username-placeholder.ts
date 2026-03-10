import { log } from "./logger";

const adjectives = [
  "Serious",
  "Delightful",
  "Bashful",
  "Secretive",
  "Anonymous",
  "Silent",
  "Otherworldly",
  "Mathematical",
  "Erudite",
  "Pretty",
  "Beautiful",
  "Sweet",
  "Loudmouth",
];

const nouns = [
  "Penguin",
  "Marsupial",
  "Martian",
  "Seafarer",
  "Walrus",
  "Seal",
  "Cowpoke",
  "Scientist",
  "Librarian",
  "Grace",
  "Girlfriend",
  "Juanita",
];

function randomIndex(array) {
  const index = Math.floor(Math.random() * array.length);
  log.debug(index);
  log.debug(array[index]);
  return array[index];
}

export default function generateUserName() {
  log.debug(`${randomIndex(adjectives)} ${randomIndex(nouns)}`);
  return `${randomIndex(adjectives)} ${randomIndex(nouns)}`;
}
