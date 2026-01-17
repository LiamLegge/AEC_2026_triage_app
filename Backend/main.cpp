#include <iostream>
#include "circularQueue.h"
#include "patientClass.h"

#include "crow/crow.h"
#include "crow/json.hpp"

#include <string>

using json = nlohmann::json;
using namespace std;

queue<patient> triageQueues[5];

void queuePatient(const Patient& p) {
    if (p.triage_level < 1 || p.triage_level > 5) {
        // If invalid level, default to non-urgent
        triageQueues[4].push(p);
    } else {
        triageQueues[p.triage_level - 1].push(p);
    }
}

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/intake").methods("POST"_method)(
        [](const crow::request& req){
            try {
                json j = json::parse(req.body);

                Patient p;
                p.Patient_ID = j.value("id", 0);
                p.Name = j.value("name", "N/A");
                p.Age = j.value("age", 0);
                p.Birth_Day = j.value("birth_day", );
                p.Health_Card = j.value("Health_Card", 0);
                p.Chief_Complaint = j.value("chief_complaint", "N/A");
                p.Triage_Level = j.value("triage_level", 5); // default non-urgent
                p.Accessibility_Profile = j.value("accessibility_profile", "None");
                p.Prefered_Mode = j.value("preferred_mode", "Standard");
                p.ui_setting = j.value("ui_setting", "Default");
                p.Language = j.value("language", "English");

                queuePatient(p); // Add to correct triage queue

                json res;
                res["status"] = "success";
                res["queue_position"] = triageQueues[p.triage_level - 1].size();
                return crow::response{res.dump()};
            } catch (...) {
                return crow::response{400, "Invalid JSON"};
            }
        }
    );    
    
    CROW_ROUTE(app, "/api/queue")(
        []() {
            json res = json::array(); // Will hold all patients

            // Loop from Level 1 (most urgent) to Level 5
            for (int i = 0; i < 5; i++) {
                auto q = triageQueues[i]; // Copy queue so we don't pop original

                while (!q.empty()) {
                    const Patient& p = q.front();

                    // Convert Patient to JSON
                    res.push_back({
                        {"id", p.Patient_ID},
                        {"name", p.Name},
                        {"age", p.Age},
                        {"birth_day", p.Birth_Day},
                        {"health_card", p.Health_Card},
                        {"chief_complaint", p.Chief_Complaint},
                        {"triage_level", p.Triage_Level},
                        {"accessibility_profile", p.Accessibility_Profile},
                        {"preferred_mode", p.Preferred_Mode},
                        {"ui_setting", p.UI_Setting},
                        {"language", p.Language},
                        {"timestamp", p.Timestamp}
                    });

                    q.pop();
                }
            }

            // Send JSON array back to frontend
            return crow::response{res.dump()};
        }
    );


    CROW_ROUTE(app, "/api/next_patient")(
        []() {
            for (int i = 0; i < 5; i++) {
                if (!triageQueues[i].empty()) {
                    const Patient& p = triageQueues[i].front();
                    json res = {
                        {"id", p.Patient_ID},
                        {"name", p.Name},
                        {"triage_level", p.Triage_Level}
                    };
                    return crow::response{res.dump()};
                }
            }
            return crow::response{json({}).dump()}; // empty if no patients
        }
    );

    app.port(8080).multithreaded().run();
}

