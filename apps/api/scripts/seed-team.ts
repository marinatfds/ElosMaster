import "dotenv/config";
import { db } from "../src/db/client.js";
import { teamMembers } from "../src/db/schema.js";
import { TEAM_POSITIONS, type Campus } from "@elosmaster/shared";

const FIRST_NAMES = [
  "Ana", "Bruno", "Carla", "Daniel", "Eduarda", "Felipe", "Gabriela", "Henrique",
  "Isabela", "João", "Larissa", "Marcelo", "Natália", "Otávio", "Patrícia",
  "Rafael", "Sofia", "Thiago", "Vitória", "Camila", "Lucas",
];

const LAST_NAMES = [
  "Alves", "Barbosa", "Cardoso", "Dias", "Ferreira", "Gomes", "Lima", "Martins",
  "Nogueira", "Oliveira", "Pereira", "Ribeiro", "Santos", "Teixeira", "Vieira",
];

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomPhone() {
  const ddd = 11 + Math.floor(Math.random() * 79);
  const number = 900000000 + Math.floor(Math.random() * 99999999);
  return `(${ddd}) 9${String(number).slice(0, 4)}-${String(number).slice(4, 8)}`;
}

function buildMember(campus: Campus, position: string, usedNames: Set<string>, usedEmails: Set<string>) {
  let fullName = "";
  let key = "";
  do {
    fullName = `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
    key = fullName.toLowerCase();
  } while (usedNames.has(key));
  usedNames.add(key);

  const firstName = stripAccents(fullName.split(" ")[0]).toLowerCase();
  let email = `${firstName}@example.com`;
  let suffix = 2;
  while (usedEmails.has(email)) {
    email = `${firstName}${suffix}@example.com`;
    suffix += 1;
  }
  usedEmails.add(email);

  return {
    name: fullName,
    campus,
    position,
    email,
    phone: randomPhone(),
  };
}

function buildCampusMembers(campus: Campus, usedNames: Set<string>, usedEmails: Set<string>) {
  return TEAM_POSITIONS.map((position) => buildMember(campus, position, usedNames, usedEmails));
}

async function main() {
  const usedNames = new Set<string>();
  const usedEmails = new Set<string>();

  const members = [
    ...buildCampusMembers("PUC", usedNames, usedEmails),
    ...buildCampusMembers("FGV", usedNames, usedEmails),
  ];

  await db.delete(teamMembers);
  await db.insert(teamMembers).values(members);
  console.log(
    `Equipe cadastrada: ${members.length} membros (${TEAM_POSITIONS.length} PUC, ${TEAM_POSITIONS.length} FGV, um por cargo em cada núcleo).`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
