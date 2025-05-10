import sys
import random
from datetime import datetime, timedelta

FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson",
    "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
    "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee",
    "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez",
    "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter",
    "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans",
    "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook"
]

ROLES = [
    ("admin", "UserAdmin"),
    ("cleaner", "Cleaner"),
    ("homeowner", "HomeOwner"),
    ("manager", "PlatformManager")
]

CATEGORY_WORDS = ["Cleaning", "Sweeping", "Washing", "Polishing", "Dusting", "Vacuuming", "Sanitizing", "Organizing",
                  "Mopping", "Tidying"]
DESCRIPTION_TEXT = "Lorem ipsum dolor sit amet consectetur adipiscing elit. Vestibulum porttitor congue leo, in consequat lorem pretium in. Quisque vel pellentesque odio. Vivamus et pretium lectus. Praesent dictum leo et mauris mollis tincidunt. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec vel massa nisi. Sed facilisis nibh in varius maximus. Vestibulum elementum erat lectus, vel cursus nunc dictum ut. In sagittis sapien ut tortor maximus iaculis. In ullamcorper tempor commodo. Maecenas sed odio vel lorem rutrum pellentesque ut non sem. Aliquam erat volutpat. Donec at purus non nisi vehicula blandit. "
DESCRIPTION_WORDS = DESCRIPTION_TEXT.split()


def random_description(word_list, length=10):
    return " ".join(random.choice(word_list).capitalize() for _ in range(length))


def generate_user_accounts() -> str:
    """
    Generates INSERT statements for the UserAccount table.
    100 accounts: 25 for each role prefix.
    """
    lines = []
    for role_prefix, role_name in ROLES:
        for i in range(1, 26):
            username = f"{role_prefix}{i}"
            password = "1234"
            # All isActive TRUE for simplicity
            lines.append(f"('{username}', '{password}', '{role_name}', TRUE)")
    values = ",\n".join(lines)
    sql = f"INSERT INTO UserAccount (username, password, role, isActive) VALUES\n{values};\n"
    return sql


def generate_user_profiles() -> str:
    """
    Generates INSERT statements for the UserProfile table.
    Each username matches a UserAccount.
    """
    lines = []
    count = 0
    for role_prefix, _ in ROLES:
        for i in range(1, 26):
            username = f"{role_prefix}{i}"
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            email = f"{first.lower()}.{last.lower()}@example.com"
            phone = f"9{random.randint(1000000, 9999999)}"
            lines.append(f"('{username}', '{first}', '{last}', '{email}', '{phone}')")
            count += 1
    values = ",\n".join(lines)
    sql = f"INSERT INTO UserProfile (username, firstName, lastName, email, phoneNumber) VALUES\n{values};\n"
    return sql


def generate_service_categories() -> str:
    """
    Generates INSERT statements for the ServiceCategory table.
    100 rows, cycling through CATEGORY_WORDS.
    """
    lines = []
    n_words = len(CATEGORY_WORDS)
    for i in range(100):
        word = CATEGORY_WORDS[i % n_words]
        count = (i // n_words) + 1
        name = f"{word} #{count}"
        desc = random_description(DESCRIPTION_WORDS, 10)
        lines.append(f"('{name}', '{desc}', TRUE)")
    values = ",\n".join(lines)
    sql = f"INSERT INTO ServiceCategory (name, description, isActive) VALUES\n{values};\n"
    return sql


def generate_services() -> str:
    """
    Generates INSERT statements for the Service table.
    Two-phase generation:
      1) a random 0–500 entries,
      2) then ensure each of the 25 cleaners has at least one service.
    """
    lines = []
    used_cleaners = set()
    num_cleaners = 25
    num_categories = 100
    price_steps = int((20.00 - 1.00) / 0.05) + 1

    # Phase 1: random entries
    for _ in range(random.randint(0, 500)):
        cleaner = f"cleaner{random.randint(1, num_cleaners)}"
        used_cleaners.add(cleaner)
        category_id = random.randint(1, num_categories)
        desc = random_description(DESCRIPTION_WORDS, 10)
        price = 1.00 + 0.05 * random.randint(0, price_steps - 1)
        lines.append(f"('{cleaner}', {category_id}, '{desc}', {price:.2f}, TRUE)")

    # Phase 2: make sure every cleaner appears at least once
    for i in range(1, num_cleaners + 1):
        cleaner = f"cleaner{i}"
        if cleaner not in used_cleaners:
            category_id = random.randint(1, num_categories)
            desc = random_description(DESCRIPTION_WORDS, 10)
            price = 1.00 + 0.05 * random.randint(0, price_steps - 1)
            lines.append(f"('{cleaner}', {category_id}, '{desc}', {price:.2f}, TRUE)")

    values = ",\n".join(lines)
    return f"INSERT INTO Service (cleanerUsername, categoryID, description, pricePerHour, isActive) VALUES\n{values};\n"


def generate_cleaner_profile_views() -> str:
    """
    Generates INSERT statements for the CleanerProfileView table.
    One row per cleaner, viewCount is random between 20 and 500.
    """
    lines = []
    for i in range(1, 26):
        username = f"cleaner{i}"
        view_count = random.randint(20, 500)
        lines.append(f"('{username}', {view_count})")
    values = ",\n".join(lines)
    sql = f"INSERT INTO CleanerProfileView (username, viewCount) VALUES\n{values};\n"
    return sql


def generate_shortlist() -> str:
    """
    Generates INSERT statements for the Shortlist table.
    Two-phase generation:
      1) a random 0–500 unique (homeowner, service) pairs,
      2) then ensure each of the 25 homeowners has at least one entry.
    """
    lines = []
    pairs = set()
    num_homeowners = 25
    num_services = 100
    n_random = random.randint(0, 500)

    # Phase 1: random unique pairs
    while len(pairs) < n_random:
        home_owner = f"homeowner{random.randint(1, num_homeowners)}"
        service_id = random.randint(1, num_services)
        key = (home_owner, service_id)
        if key not in pairs:
            pairs.add(key)
            lines.append(f"('{home_owner}', {service_id})")

    # Phase 2: make sure every homeowner appears at least once
    for i in range(1, num_homeowners + 1):
        home_owner = f"homeowner{i}"
        if not any(h == home_owner for h, _ in pairs):
            service_id = random.randint(1, num_services)
            while (home_owner, service_id) in pairs:
                service_id = random.randint(1, num_services)
            pairs.add((home_owner, service_id))
            lines.append(f"('{home_owner}', {service_id})")

    values = ",\n".join(lines)
    return f"INSERT INTO Shortlist (homeOwnerUsername, serviceID) VALUES\n{values};\n"


def random_date(start: datetime, end: datetime) -> str:
    """
    Returns a random date string in 'YYYY-MM-DD' format between start and end.
    """
    delta = end - start
    random_days = random.randint(0, delta.days)
    date = start + timedelta(days=random_days)
    return date.strftime("%Y-%m-%d")


def generate_bookings() -> str:
    """
    Generates INSERT statements for the Booking table.
    Two-phase generation:
      1) a random 0–500 entries,
      2) then ensure each of the 25 homeowners has at least one booking.
    """
    lines = []
    seen_homeowners = set()
    num_homeowners = 25
    num_services = 100
    start_date = datetime.strptime("2020-01-01", "%Y-%m-%d")
    end_date = datetime.strptime("2025-04-30", "%Y-%m-%d")
    n_random = random.randint(0, 500)

    # Phase 1: random bookings
    for _ in range(n_random):
        home_owner = f"homeowner{random.randint(1, num_homeowners)}"
        seen_homeowners.add(home_owner)
        service_id = random.randint(1, num_services)
        booking_date = random_date(start_date, end_date)
        lines.append(f"('{home_owner}', {service_id}, '{booking_date}')")

    # Phase 2: make sure every homeowner appears at least once
    for i in range(1, num_homeowners + 1):
        home_owner = f"homeowner{i}"
        if home_owner not in seen_homeowners:
            service_id = random.randint(1, num_services)
            booking_date = random_date(start_date, end_date)
            lines.append(f"('{home_owner}', {service_id}, '{booking_date}')")

    values = ",\n".join(lines)
    return f"INSERT INTO Booking (homeOwnerUsername, serviceID, bookingDate) VALUES\n{values};\n"


def main():
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    else:
        filename = "test_data.sql"
    sql_blocks = []
    sql_blocks.append("-- UserAccount test data\n" + generate_user_accounts())
    sql_blocks.append("-- UserProfile test data\n" + generate_user_profiles())
    sql_blocks.append("-- ServiceCategory test data\n" + generate_service_categories())
    sql_blocks.append("-- Service test data\n" + generate_services())
    sql_blocks.append("-- CleanerProfileView test data\n" + generate_cleaner_profile_views())
    sql_blocks.append("-- Shortlist test data\n" + generate_shortlist())
    sql_blocks.append("-- Booking test data\n" + generate_bookings())
    output = "\n\n".join(sql_blocks)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(output)
    print(f"Test data SQL written to '{filename}'.")


if __name__ == "__main__":
    main()
