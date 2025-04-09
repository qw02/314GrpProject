DROP DATABASE cleaning_platform_db;
CREATE DATABASE cleaning_platform_db;
USE cleaning_platform_db;

-- UserAccount Table
CREATE TABLE UserAccount
(
    username VARCHAR(255)                                                  NOT NULL,
    password VARCHAR(255)                                                  NOT NULL,
    role     ENUM ('UserAdmin', 'Cleaner', 'HomeOwner', 'PlatformManager') NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (username)
);

-- UserProfile Table
CREATE TABLE UserProfile
(
    username    VARCHAR(255)                                                  NOT NULL,
    firstName   VARCHAR(255),
    lastName    VARCHAR(255),
    email       VARCHAR(255),
    phoneNumber VARCHAR(20),
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES UserAccount (username) ON DELETE CASCADE
);
