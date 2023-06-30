create database if not exists `nodelogin`;
use `nodelogin`;

create table if not exists accounts
(
    id       int auto_increment
        primary key,
    username varchar(50)  not null,
    password varchar(255) not null,
    email    varchar(100) not null
);

insert into `accounts` (id, username, password, email)
VALUES (1, 'test', 'test', 'test@test.com');
