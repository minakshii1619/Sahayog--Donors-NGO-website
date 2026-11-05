const bcrypt = require("bcryptjs");
const db = require("./db");

async function setPasswords() {
    try {
        const donorEmail = "minakshii1619@gmail.com";
        const adminEmail = "admin@sahayog.com";

        const donorPassword = "Donor@Sahayog2026";
        const adminPassword = "Admin@Sahayog2026";

        const donorHash = await bcrypt.hash(donorPassword, 10);
        const adminHash = await bcrypt.hash(adminPassword, 10);

        // Check whether the donor account exists
        db.query(
            "SELECT user_id FROM users WHERE email = ? LIMIT 1",
            [donorEmail],
            (err, donorResults) => {
                if (err) {
                    console.error("Error checking donor:", err);
                    db.end();
                    return;
                }

                if (donorResults.length === 0) {
                    console.log("Donor account not found. No account changed.");
                    db.end();
                    return;
                }

                // Update the existing donor password
                db.query(
                    "UPDATE users SET password = ? WHERE email = ?",
                    [donorHash, donorEmail],
                    (err) => {
                        if (err) {
                            console.error("Error updating donor:", err);
                            db.end();
                            return;
                        }

                        console.log("Donor password updated successfully.");

                        // Check whether the admin account already exists
                        db.query(
                            "SELECT user_id, role FROM users WHERE email = ? LIMIT 1",
                            [adminEmail],
                            (err, adminResults) => {
                                if (err) {
                                    console.error("Error checking admin:", err);
                                    db.end();
                                    return;
                                }

                                if (adminResults.length > 0) {
                                    if (adminResults[0].role !== "admin") {
                                        console.log(
                                            "That email already belongs to a non-admin account. Admin not created."
                                        );
                                        db.end();
                                        return;
                                    }

                                    // Update an existing admin password
                                    db.query(
                                        "UPDATE users SET password = ? WHERE email = ?",
                                        [adminHash, adminEmail],
                                        (err) => {
                                            if (err) {
                                                console.error(
                                                    "Error updating admin:",
                                                    err
                                                );
                                            } else {
                                                console.log(
                                                    "Existing admin password updated successfully."
                                                );
                                            }

                                            db.end();
                                        }
                                    );

                                    return;
                                }

                                // Create a new admin account
                                db.query(
                                    `INSERT INTO users
                                     (name, email, password, role)
                                     VALUES (?, ?, ?, ?)`,
                                    [
                                        "Sahayog Admin",
                                        adminEmail,
                                        adminHash,
                                        "admin"
                                    ],
                                    (err) => {
                                        if (err) {
                                            console.error(
                                                "Error creating admin:",
                                                err
                                            );
                                        } else {
                                            console.log(
                                                "Admin account created successfully."
                                            );
                                        }

                                        db.end();
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Password setup failed:", error);
        db.end();
    }
}

setPasswords();