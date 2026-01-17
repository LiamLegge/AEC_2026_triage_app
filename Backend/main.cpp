#include <iostream>
#include "circularQueue.h"
#include "patientClass.h"

#include "crow/crow.h"
#include "crow/json.hpp"

#include <string>

using json = nlohmann::json;
using namespace std;

Queue<patient> triageQueues[5];

void queuePatient(const patient& p) {
    if (p.Triage_Level < 1 || p.Triage_Level > 5) {
        triageQueues[4].push(p); // default to non-urgent
    } else {
        triageQueues[p.Triage_Level - 1].push(p);
    }
}

void Move_Patient(patient& p, int Target_TL){
    triageQueues[Target_TL].removePatient(p);
    triagesQueues[Target_TL-1].push(p);
}

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/intake").methods("POST"_method)(
        [](const crow::request& req){
            try {
                json j = json::parse(req.body);

                patient p;
                p.Patient_ID = j.value("id", 0);
                p.Name = j.value("name", "N/A");
                p.Age = j.value("age", 0);
                p.Birth_Day = j.value("birth_day", "N/A"); // FIXED
                p.Health_Card = j.value("health_card", 0);
                p.Chief_Complaint = j.value("chief_complaint", "N/A");
                p.Triage_Level = j.value("triage_level", 5); // FIXED
                p.Accessibility_Profile = j.value("accessibility_profile", "None");
                p.Preferred_Mode = j.value("preferred_mode", "Standard"); // FIXED
                p.UI_Setting = j.value("ui_setting", "Default");
                p.Language = j.value("language", "English");

                queuePatient(p);

                json res;
                res["status"] = "success";
                res["queue_position"] = triageQueues[p.Triage_Level - 1].size(); // FIXED
                return crow::response{res.dump()};
            } catch (...) {
                return crow::response{400, "Invalid JSON"};
            }
        }
    );

    CROW_ROUTE(app, "/api/queue")(
        []() {
            json res = json::array();

            for (int i = 0; i < 5; i++) {
                auto q = triageQueues[i]; // copy so original stays intact

                while (!q.empty()) {
                    const patient& p = q.peek();

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
                    });

                    q.pop();
                }
            }

            return crow::response{res.dump()};
        }
    );

    CROW_ROUTE(app, "/api/next_patient")(
        []() {
            for (int i = 0; i < 5; i++) {
                if (!triageQueues[i].empty()) {
                    const patient& p = triageQueues[i].peek();

                    json res = {
                        {"id", p.Patient_ID},
                        {"name", p.Name},
                        {"triage_level", p.Triage_Level}
                    };

                    return crow::response{res.dump()};
                }
            }

            return crow::response{json({}).dump()}; // no patients
        }
    );

    app.port(8080).multithreaded().run();
}
