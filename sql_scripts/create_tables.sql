DROP DATABASE cleaning_platform_db;
CREATE DATABASE cleaning_platform_db;
USE cleaning_platform_db;

CREATE TABLE UserAccount
(
    username VARCHAR(255)                                                  NOT NULL,
    password VARCHAR(255)                                                  NOT NULL,
    role     ENUM ('UserAdmin', 'Cleaner', 'HomeOwner', 'PlatformManager') NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (username)
);

CREATE TABLE UserProfile
(
    username    VARCHAR(255) NOT NULL,
    firstName   VARCHAR(255),
    lastName    VARCHAR(255),
    email       VARCHAR(255),
    phoneNumber VARCHAR(20),
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES UserAccount (username)
);

CREATE TABLE ServiceCategory
(
    id          INT AUTO_INCREMENT NOT NULL,
    name        VARCHAR(255)       NOT NULL,
    description TEXT,
    isActive    BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id)
);

CREATE TABLE Service
(
    serviceID       INT AUTO_INCREMENT NOT NULL,
    cleanerUsername VARCHAR(255)       NOT NULL,
    categoryID      INT                NOT NULL,
    description     TEXT,
    pricePerHour    DECIMAL(10, 2),
    isActive        BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (serviceID),
    FOREIGN KEY (cleanerUsername) REFERENCES UserAccount (username),
    FOREIGN KEY (categoryID) REFERENCES ServiceCategory (id)
);

CREATE TABLE CleanerProfileView
(
    username VARCHAR(255) NOT NULL,
    viewCount       INT DEFAULT 0,
    PRIMARY KEY (username),
    FOREIGN KEY (username) REFERENCES UserAccount (username)
);

CREATE TABLE Shortlist
(
    homeOwnerUsername VARCHAR(255) NOT NULL,
    serviceID INT NOT NULL,
    PRIMARY KEY (homeOwnerUsername, serviceID), -- Composite key: Homeowner can only shortlist a specific service once
    FOREIGN KEY (homeOwnerUsername) REFERENCES UserAccount (username),
    FOREIGN KEY (serviceID) REFERENCES Service (serviceID)
);

CREATE TABLE Booking
(
    bookingID INT AUTO_INCREMENT NOT NULL,
    homeOwnerUsername VARCHAR(255) NOT NULL,
    serviceID INT NOT NULL,
    bookingDate DATE NOT NULL,
    PRIMARY KEY (bookingID),
    FOREIGN KEY (homeOwnerUsername) REFERENCES UserAccount (username),
    FOREIGN KEY (serviceID) REFERENCES Service (serviceID)
);