CREATE TABLE "campuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "campuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "campuses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
-- Os campus que antes eram valores fixos do enum viram registros configuráveis.
INSERT INTO "campuses" ("name") VALUES ('FGV'), ('PUC');
--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "campus" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "campus" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "campus" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_campus_campuses_name_fk" FOREIGN KEY ("campus") REFERENCES "public"."campuses"("name") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_campus_campuses_name_fk" FOREIGN KEY ("campus") REFERENCES "public"."campuses"("name") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_campus_campuses_name_fk" FOREIGN KEY ("campus") REFERENCES "public"."campuses"("name") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
DROP TYPE "public"."campus";