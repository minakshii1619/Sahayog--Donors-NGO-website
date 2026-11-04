Sahayog – Connecting Donors with Verified NGOs
Sahayog is a digital donation platform that connects donors with trusted Non‑Governmental Organizations (NGOs). The platform makes giving easy and clear by letting NGOs sign up donors view their profiles and administrators confirm NGOs before they appear online.
The project builds a digital space where donors can find groups working on various social causes.

# Project Objectives
* Bring donors and NGOs together on one platform.
* Build trust by adding a NGO verification step.
* Simplify how NGOs register and manage their profiles.
* Give donors information about NGOs and their social projects.
* Keep user login secure and data organized.

#Key Features
1. User Registration
* Separate sign‑up paths for donors and NGOs.
* Check that all required fields are filled.
* Detect registrations.
  
2. NGO Management
* NGOs can. Provide their details.
* NGO profiles list the name, registration, location, contact and cause.
* Registered NGOs wait for an administrator to verify them before they are shown.

3. Admin Verification
* Admin tools for handling NGO registrations.
* Admins review information that NGOs submit.
* Verification stops groups from being listed as verified.

4. Secure Authentication
* Passwords are hashed with **bcrypt**.
* Different user types have role‑based access.
* The server checks all registration and login requests.

5. Donor Interface
* Browse all NGO profiles.
* Search by cause and other details.
* Read NGO information on the platform.

# Tech Stack

Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
Database: MySQL
Authentication: bcrypt
API: REST APIs
Development Tools: Visual Studio Code, Git, GitHub

## 🏗️ System Architecture
Sahayog uses a client‑server model.
1. Frontend: Shows screens for donors, NGOs and administrators.

2. Backend: Handles API calls, login, validation and business logic with Node.js and Express.js.

3. Database: MySQL holds user accounts NGO data and other application information.

4. Admin Module:  Manages NGO verification and other admin tasks.
* Create a MySQL database.
* Set up the database connection us
