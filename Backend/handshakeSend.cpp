#include "patientClass.h"

#include "crow/crow.h"
#include "crow/json.hpp"

// GET /api/queue
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
