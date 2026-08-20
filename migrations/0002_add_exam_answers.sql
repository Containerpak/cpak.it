-- Private answer keys used when Learn marks a professional exam.

create table if not exists exam_answers (
  exam     text not null,
  question integer not null check (question >= 0),
  choice   integer not null check (choice >= 0),
  primary key (exam, question)
);
