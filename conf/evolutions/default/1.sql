# --- Created by Ebean DDL
# To stop Ebean DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table project (
  id                        bigint not null,
  name                      varchar(255),
  user_id                   bigint,
  constraint pk_project primary key (id))
;

create table task (
  id                        bigint not null,
  user_id                   bigint,
  project_id                bigint,
  priority                  integer,
  message                   varchar(255),
  status                    integer,
  updated                   timestamp,
  created                   timestamp,
  deadline                  timestamp,
  constraint pk_task primary key (id))
;

create table account (
  id                        bigint not null,
  username                  varchar(255),
  password                  varchar(255),
  mail                      varchar(255),
  user_token                varchar(255),
  created                   timestamp,
  updated                   timestamp,
  constraint pk_account primary key (id))
;

create sequence project_seq;

create sequence task_seq;

create sequence account_seq;

alter table project add constraint fk_project_user_1 foreign key (user_id) references account (id) on delete restrict on update restrict;
create index ix_project_user_1 on project (user_id);
alter table task add constraint fk_task_user_2 foreign key (user_id) references account (id) on delete restrict on update restrict;
create index ix_task_user_2 on task (user_id);
alter table task add constraint fk_task_project_3 foreign key (project_id) references project (id) on delete restrict on update restrict;
create index ix_task_project_3 on task (project_id);



# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists project;

drop table if exists task;

drop table if exists account;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence if exists project_seq;

drop sequence if exists task_seq;

drop sequence if exists account_seq;

