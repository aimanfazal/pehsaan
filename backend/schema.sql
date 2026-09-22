CREATE DATABASE IF NOT EXISTS linkedin_db;
USE linkedin_db;

CREATE TABLE Users (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Schools (
    id INT AUTO_INCREMENT,
    name VARCHAR(100),
    type VARCHAR(50),
    location VARCHAR(100),
    year INT,
    PRIMARY KEY (id)
);

CREATE TABLE Companies (
    id INT AUTO_INCREMENT,
    name VARCHAR(100),
    industry VARCHAR(100),
    location VARCHAR(100),
    PRIMARY KEY (id)
);

CREATE TABLE UserConnections (
    user_id INT,
    connection_id INT,
    status VARCHAR(20) NOT NULL CHECK (
        status IN (
            'pending',
            'accepted',
            'rejected'
        )
    ),
    created_at DATETIME,
    PRIMARY KEY (user_id, connection_id),
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (connection_id) REFERENCES Users (id)
);

CREATE TABLE Education (
    id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    school_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    degree VARCHAR(100),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (school_id) REFERENCES Schools (id)
);

CREATE TABLE Employment (
    id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    title VARCHAR(100),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (company_id) REFERENCES Companies (id)
);

CREATE TABLE Skills (
    id INT AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE UserSkills (
    user_id INT,
    skill_id INT,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (skill_id) REFERENCES Skills (id)
);

CREATE TABLE Posts (
    id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES Users (id)
);
