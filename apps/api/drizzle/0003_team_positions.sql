CREATE TABLE "team_positions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "team_positions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "team_positions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
INSERT INTO "team_positions" ("name") VALUES
	('Monitor(a) de Matemática'),
	('Coordenador(a) de Monitoria'),
	('Professor(a) de Roda'),
	('Professor(a) de Escrita'),
	('Professor(a) de Leitura'),
	('Professor(a) de PCS'),
	('Professor(a) de Álgebra'),
	('Professor(a) de Geometria'),
	('Professor(a) de Aritmética'),
	('Coordenador(a)'),
	('Assistente de Coordenação');
--> statement-breakpoint
INSERT INTO "team_positions" ("name")
SELECT DISTINCT "position" FROM "team_members"
ON CONFLICT ("name") DO NOTHING;
