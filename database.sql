create TABLE persons(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    surname VARCHAR(255),
    avatar INTEGER
);

create TABLE messages(
    id SERIAL PRIMARY KEY,
    msg VARCHAR(255),
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
