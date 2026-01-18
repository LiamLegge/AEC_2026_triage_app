#include <iostream>
#include "circularQueue.h"
#include "patientClass.h"

#include "crow/crow.h"
#include "crow/json.hpp"
#include "crow/middlewares/cors.h"

#include <string>
#include <fstream>
#include <sstream>
#include <vector>
#include <chrono>
#include <thread>
#include <cstdlib>  // For getenv (Cloud Run PORT)

using json = nlohmann::json;
using namespace std;

int Max_ID = 1051;

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
    triageQueues[Target_TL-1].push(p);
}

//scanPatient Sourced from chatGPT
patient scanPatient(const string& line) {
    patient p;
    stringstream ss(line);
    string field;

    // Patient_ID
    getline(ss, field, ',');
    p.Patient_ID = stoi(field);

    // Name
    getline(ss, p.Name, ',');

    // Age
    getline(ss, field, ',');
    p.Age = stoi(field);

    // Sex
    getline(ss, field, ',');
    p.Sex = field.empty() ? 'X' : field[0];

    // Email
    getline(ss, p.Email, ',');

    // Birth_Day
    getline(ss, p.Birth_Day, ',');

    // Chief_Complaint
    getline(ss, p.Chief_Complaint, ',');

    // Health_Card
    getline(ss, p.Health_Card, ',');

    // Triage_Level
    getline(ss, field, ',');
    p.Triage_Level = stoi(field);

    // Accessibility_Profile
    getline(ss, p.Accessibility_Profile, ',');

    // Preferred_Mode
    getline(ss, p.Preferred_Mode, ',');

    // UI_Setting
    getline(ss, p.UI_Setting, ',');

    // Language
    getline(ss, p.Language, ',');

    return p;
}


void importPatientData(){
    patient temp;
    int count = 0;

    ifstream sampleData("sample_data.txt");
    if (!sampleData.is_open()) {
        std::cerr << "Failed to open sample_data.txt - make sure to run server from Backend directory\n";
        return;
    }
    string line; 
    getline(sampleData, line);//skip header

    while(getline(sampleData, line)){
        if(!line.empty()){
            temp = scanPatient(line);
            triageQueues[temp.Triage_Level-1].push(temp);
            count++;
        }
    }
    std::cout << "Loaded " << count << " patients from sample_data.txt\n";
}

void check_triages(){
    for(int i = 0; i < 5; i++){
        for(int n = 0; n < triageQueues[i].size(); n++){
            Update_Severity(triageQueues[i].arr[n]);
        }
    }
}

void backgroundTask() {
    while (true) {
        this_thread::sleep_for(chrono::minutes(25));
        check_triages();
    }
}



int main() {
    // Load mock patient data from sample_data.txt
    importPatientData();
    
    crow::App<crow::CORSHandler> app;

    thread t(backgroundTask);
    t.detach();

    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors.global()
        .origin("*")
        .headers("Content-Type")
        .methods("GET"_method, "POST"_method, "OPTIONS"_method);

    CROW_ROUTE(app, "/api/intake").methods("POST"_method)(
        [](const crow::request& req){
            try {
                json j = json::parse(req.body);

                patient p;
                p.Patient_ID = Max_ID;
                Max_ID++;
                p.Name = j.value("name", "N/A");
                p.Age = j.value("age", 0);
                p.Birth_Day = j.value("birth_day", "N/A");
                p.Health_Card = j.value("health_card", "N/A");
                p.Email = j.value("email", "");
                p.Chief_Complaint = j.value("chief_complaint", "N/A");
                p.Triage_Level = j.value("triage_level", 5);
                p.Accessibility_Profile = j.value("accessibility_profile", "None");
                p.Preferred_Mode = j.value("preferred_mode", "Standard");
                p.UI_Setting = j.value("ui_setting", "Default");
                p.Language = j.value("language", "English");

                queuePatient(p);
                
                // Send welcome email to patient (runs in background thread)
                thread emailThread([p]() {
                    send_welcome_email(const_cast<patient&>(p));
                });
                emailThread.detach();

                json res;
                res["status"] = "success";
                res["queue_position"] = triageQueues[p.Triage_Level - 1].size();
                res["patient_id"] = p.Patient_ID;
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
                        {"timestamp", p.Timestamp}
                    });

                    q.dequeue();
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

    // --- CLOUD RUN PORT CONFIGURATION ---
    // Cloud Run injects PORT env variable; default to 8080 for local dev
    char* portStr = std::getenv("PORT");
    int port = (portStr != nullptr) ? std::stoi(portStr) : 8080;
    
    std::cout << "Starting server on port " << port << std::endl;

    // Listen on 0.0.0.0 (required for containers)
    app.bindaddr("0.0.0.0").port(port).multithreaded().run();
}
