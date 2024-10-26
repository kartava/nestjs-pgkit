create table albums
(
    "id"         serial primary key,
    "title"      text,
    "songs"      int                      not null default 0,
    "releasedAt" timestamp with time zone not null default now()
);
