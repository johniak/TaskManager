# --- Created by Ebean DDL
# To stop Ebean DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table account (
  id                        integer not null,
  username                  varchar(255),
  password                  varchar(255),
  mail                      varchar(255),
  user_token                varchar(255),
  created                   timestamp,
  updated                   timestamp,
  constraint pk_account primary key (id))
;

create sequence account_seq;




# --- !Downs

SET REFERENTIAL_INTEGRITY FALSE;

drop table if exists account;

SET REFERENTIAL_INTEGRITY TRUE;

drop sequence if exists account_seq;

