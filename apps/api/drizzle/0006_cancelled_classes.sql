CREATE TABLE "cancelled_classes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cancelled_classes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"date" date NOT NULL,
	CONSTRAINT "cancelled_classes_date_unique" UNIQUE("date")
);
