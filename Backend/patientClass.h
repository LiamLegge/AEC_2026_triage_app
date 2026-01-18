#ifndef PATIENTCLASS_H
#define PATIENTCLASS_H

#include <iostream>
#include <string>
#include <ctime>
#include <algorithm>
#include <cstdlib>
#include <cstring>
#include <curl/curl.h>
#include <sstream>
#include <vector>

using namespace std;

// Email credentials loaded from environment variables for security
// Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables
inline string getEnvVar(const string& key, const string& defaultVal = "") {
    char* val = getenv(key.c_str());
    return val ? string(val) : defaultVal;
}

// These will be populated from environment variables at runtime
inline string Admin_Email() { return getEnvVar("GMAIL_USER", "triage.2026.aec@gmail.com"); }
inline string Admin_Password() { return getEnvVar("GMAIL_APP_PASSWORD", ""); }

class patient; 

bool validate_email(const string& email);
string get_Current_Time(void);
int UTC_to_Seconds(const string& temp);
void Update_Severity(patient& p);
void generate_email(patient& p);
void send_welcome_email(patient& p);
void Move_Patient(patient& p, int Target_TL);


class patient{

    public:

        unsigned int Patient_ID;
        string Name;
        unsigned int Age;
        char Sex;
        string Birth_Day;
        string Health_Card;
        string Email;
        string Chief_Complaint;
        string Accessibility_Profile;
        string Preferred_Mode;
        string UI_Setting;
        string Language;
        string Check_In;
        int Internal_Time;
        long long Timestamp;
        unsigned int Triage_Level;

        patient(int ID = 0, string N = "John Doe", int A = 0, char S = 'X',string E = "NULL", string BD = "NULL",string HC = "NULL", string CC = "NULL", int TL = 5, string AP = "None", string PM = "Standard", string UI = "Default", string Lang = "English"){

            Patient_ID = ID;
            Name = N;
            Age = A;
            Sex = S;
            if(validate_email(E)){Email = E;}//check for dangerous emails
            else{Email = "NULL";}
            Birth_Day = BD;
            Health_Card = HC;
            Chief_Complaint = CC;
            Triage_Level = TL;
            Accessibility_Profile = AP;
            Preferred_Mode = PM;
            UI_Setting = UI;
            Language = Lang;
            Check_In = get_Current_Time(); // format: Fri Jan 17 10:52:30 2026
            Internal_Time = UTC_to_Seconds(get_Current_Time()); //seconds past midnight
            Timestamp = static_cast<long long>(time(nullptr));
        }

        void set_Patient_ID(int ID){Patient_ID = ID;}
        int get_Patient_ID()const{return Patient_ID;}

        void set_Name(string N){Name = N;}
        string get_Name()const{return Name;}

        void set_Age(int A){Age = A;}
        int get_Age()const{return Age;}

        void set_Sex(char S){Sex = S;}
        char get_Sex()const{return Sex;}

        void set_Email(string E){Email = E;}
        string get_Email()const{return Email;}

        void set_Birth_Day(string BD){Birth_Day = BD;}
        string get_Birth_Day()const{return Birth_Day;}

        void set_Health_Card(string HC){Health_Card = HC;}
        string get_Health_Card()const{return Health_Card;}        

        void set_chief_Complaint(string CC){Chief_Complaint = CC;}
        string get_chief_Complaint()const{return Chief_Complaint;}

        void set_Triage_Level(int TL){Triage_Level = TL;}
        int get_Triage_Level()const{return Triage_Level;}

        void set_Accessibility_Profile(string AP){Accessibility_Profile = AP;}
        string get_Accessibility_Profile()const{return Accessibility_Profile;}

        void set_Preferred_Mode(string PM){Preferred_Mode = PM;}
        string get_Preferred_Mode()const{return Preferred_Mode;}

        void set_UI_Setting(string UI){UI_Setting = UI;}
        string get_UI_Setting()const{return UI_Setting;}

        void set_Language(string Lang){Language = Lang;}
        string get_Language()const{return Language;}

        string get_Check_In_Full(){return Check_In;}
        int get_Check_In_Time()const{return UTC_to_Seconds(Check_In);}

        long long get_Timestamp()const{return Timestamp;}

        void set_Internal_Time(int T){Internal_Time = T;}
        int get_Internal_Time()const{return Internal_Time;}
        
};
string get_Current_Time(void){
        //get current time
    time_t Now = time(nullptr);
    string CT = ctime(&Now);
    if (!CT.empty() && CT.back() == '\n') {//remove trailing \n
        CT.pop_back();
    }
    return CT;
}

int UTC_to_Seconds(const string& temp){
    string timePart = temp.substr(11, 8);
    int h = stoi(timePart.substr(0, 2));
    int m = stoi(timePart.substr(3, 2));
    int s = stoi(timePart.substr(6, 2));
    return h * 3600 + m * 60 + s;
}

void Update_Severity(patient& p) {
    int CT = UTC_to_Seconds(get_Current_Time());
    int IT = p.get_Internal_Time();

    switch (p.get_Triage_Level()) {
        case 1:
            return; // no update needed
        case 2:
            if (IT + 3600 <= CT) { // 1 hour wait
                p.set_Triage_Level(1);
                p.set_Internal_Time(CT);
                generate_email(p);
                Move_Patient(p, 1);
            }
            
            break;
        case 3:
            if (IT + 5400 <= CT) { // 1.5 hours
                p.set_Triage_Level(2);
                p.set_Internal_Time(CT);
                generate_email(p);
                Move_Patient(p, 2);
            }
            break;
        case 4:
            if (IT + 7200 <= CT) { // 2 hours
                p.set_Triage_Level(2);
                p.set_Internal_Time(CT);
                generate_email(p);
                Move_Patient(p, 3);
            }
            break;
        case 5:
            if (IT + 9000 <= CT) { // 2.5 hours
                p.set_Triage_Level(2);
                p.set_Internal_Time(CT);
                generate_email(p);
                Move_Patient(p, 4);
            }
            break;
    }
}

//email validation sourced from ChatGPT
bool validate_email(const string& email) {
    if (email.empty() || email.length() > 254) return false;

    for (char c : email) {
        if (!isalnum(c) && c != '@' && c != '.' && c != '_' && c != '%' && c != '+' && c != '-') {
            return false;
        }
    }

    // Must contain exactly one '@'
    if (count(email.begin(), email.end(), '@') != 1)
        return false;

    return true;
}

// CURL callback for reading email payload
struct EmailPayload {
    vector<string> lines;
    size_t currentLine;
};

static size_t payload_source(char *ptr, size_t size, size_t nmemb, void *userp) {
    EmailPayload *payload = (EmailPayload *)userp;
    
    if (payload->currentLine >= payload->lines.size()) {
        return 0;
    }
    
    const string& line = payload->lines[payload->currentLine];
    size_t len = line.length();
    
    if (len > size * nmemb) {
        return 0;
    }
    
    memcpy(ptr, line.c_str(), len);
    payload->currentLine++;
    
    return len;
}

// Helper function to get triage level description and color
inline string getTriageLevelInfo(int level, string& color, string& description) {
    switch(level) {
        case 1:
            color = "#DC2626";
            description = "Resuscitation - Immediate";
            return "1";
        case 2:
            color = "#EA580C";
            description = "Emergent - Very Urgent";
            return "2";
        case 3:
            color = "#CA8A04";
            description = "Urgent";
            return "3";
        case 4:
            color = "#16A34A";
            description = "Less Urgent";
            return "4";
        case 5:
            color = "#2563EB";
            description = "Non-Urgent";
            return "5";
        default:
            color = "#6B7280";
            description = "Unknown";
            return "?";
    }
}

// Send HTML email using libcurl SMTP
void send_html_email(const string& toEmail, const string& subject, const string& htmlBody) {
    string gmailUser = Admin_Email();
    string gmailPass = Admin_Password();
    
    if (gmailPass.empty()) {
        cerr << "Email not sent: GMAIL_APP_PASSWORD not configured" << endl;
        return;
    }

    CURL *curl;
    CURLcode res = CURLE_OK;
    struct curl_slist *recipients = NULL;
    
    EmailPayload payload;
    payload.currentLine = 0;
    
    // Email headers
    payload.lines.push_back("To: " + toEmail + "\r\n");
    payload.lines.push_back("From: AEC Triage System <" + gmailUser + ">\r\n");
    payload.lines.push_back("Subject: " + subject + "\r\n");
    payload.lines.push_back("MIME-Version: 1.0\r\n");
    payload.lines.push_back("Content-Type: text/html; charset=UTF-8\r\n");
    payload.lines.push_back("\r\n");
    payload.lines.push_back(htmlBody + "\r\n");

    curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, "smtps://smtp.gmail.com:465");
        curl_easy_setopt(curl, CURLOPT_USE_SSL, (long)CURLUSESSL_ALL);
        curl_easy_setopt(curl, CURLOPT_USERNAME, gmailUser.c_str());
        curl_easy_setopt(curl, CURLOPT_PASSWORD, gmailPass.c_str());
        curl_easy_setopt(curl, CURLOPT_MAIL_FROM, gmailUser.c_str());
        recipients = curl_slist_append(recipients, toEmail.c_str());
        curl_easy_setopt(curl, CURLOPT_MAIL_RCPT, recipients);
        curl_easy_setopt(curl, CURLOPT_READFUNCTION, payload_source);
        curl_easy_setopt(curl, CURLOPT_READDATA, &payload);
        curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);

        res = curl_easy_perform(curl);

        if (res != CURLE_OK) {
            cerr << "Email send failed: " << curl_easy_strerror(res) << endl;
        } else {
            cout << "Email sent successfully to " << toEmail << endl;
        }

        curl_slist_free_all(recipients);
        curl_easy_cleanup(curl);
    }
}

// Send welcome email when patient checks in
void send_welcome_email(patient& p) {
    if (p.get_Email() == "NULL" || p.get_Email().empty() || !validate_email(p.get_Email())) return;
    
    string color, description;
    getTriageLevelInfo(p.get_Triage_Level(), color, description);
    
    string html = R"(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                                &#127973; Hospital Triage System
                            </h1>
                            <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">
                                Atlantic Engineering Competition 2026
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Welcome Message -->
                    <tr>
                        <td style="padding: 40px 30px 20px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                                Welcome, )" + p.get_Name() + R"(!
                            </h2>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                                You have been successfully checked into our emergency triage system. 
                                We understand waiting can be difficult, and we appreciate your patience.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Triage Level Card -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border-left: 4px solid )" + color + R"(;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                                            Your Triage Level
                                        </p>
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="background-color: )" + color + R"(; color: #ffffff; font-size: 32px; font-weight: 700; width: 50px; height: 50px; text-align: center; border-radius: 8px;">
                                                    )" + to_string(p.get_Triage_Level()) + R"(
                                                </td>
                                                <td style="padding-left: 15px;">
                                                    <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0;">
                                                        )" + description + R"(
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Details Section -->
                    <tr>
                        <td style="padding: 30px;">
                            <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">
                                &#128203; Your Information
                            </h3>
                            <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                                <tr>
                                    <td style="color: #6b7280; font-size: 14px; width: 40%;">Patient ID:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-weight: 500;">)" + to_string(p.get_Patient_ID()) + R"(</td>
                                </tr>
                                <tr>
                                    <td style="color: #6b7280; font-size: 14px;">Chief Complaint:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-weight: 500;">)" + p.get_chief_Complaint() + R"(</td>
                                </tr>
                                <tr>
                                    <td style="color: #6b7280; font-size: 14px;">Check-in Time:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-weight: 500;">)" + p.get_Check_In_Full() + R"(</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Info Box -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.6;">
                                            <strong>&#128161; What happens next?</strong><br><br>
                                            You will be called when a medical professional is ready to see you. 
                                            If your condition changes or worsens, please notify our staff immediately.
                                            You will receive email updates if your triage level changes.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                This is an automated message from the AEC 2026 Triage System.<br>
                                Built by Team CTRL+ALT+ELITE
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
)";
    
    send_html_email(p.get_Email(), "Welcome to Hospital Triage - Check-in Confirmed", html);
}

// Send triage update email (called when triage level changes)
void generate_email(patient& p) {
    if (p.get_Email() == "NULL" || p.get_Email().empty() || !validate_email(p.get_Email())) return;
    
    string color, description;
    getTriageLevelInfo(p.get_Triage_Level(), color, description);
    
    string html = R"(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, )" + color + R"( 0%, )" + color + R"(dd 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                                &#9888;&#65039; Triage Update
                            </h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                                Your priority level has changed
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Update Message -->
                    <tr>
                        <td style="padding: 40px 30px 20px 30px; text-align: center;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">
                                Hello, )" + p.get_Name() + R"(
                            </h2>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                                Your triage priority has been updated based on your wait time.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- New Triage Level -->
                    <tr>
                        <td style="padding: 0 30px;" align="center">
                            <table cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border: 2px solid )" + color + R"(;">
                                <tr>
                                    <td style="padding: 30px 50px; text-align: center;">
                                        <p style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
                                            New Triage Level
                                        </p>
                                        <div style="background-color: )" + color + R"(; color: #ffffff; font-size: 48px; font-weight: 700; width: 80px; height: 80px; line-height: 80px; text-align: center; border-radius: 50%; display: inline-block; margin: 0 auto;">
                                            )" + to_string(p.get_Triage_Level()) + R"(
                                        </div>
                                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 15px 0 0 0;">
                                            )" + description + R"(
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Notice -->
                    <tr>
                        <td style="padding: 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                                            <strong>&#128276; Please Note:</strong><br><br>
                                            This update means you will be seen sooner. Please remain in the waiting area 
                                            and listen for your name to be called. Thank you for your continued patience.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                This is an automated message from the AEC 2026 Triage System.<br>
                                Built by Team CTRL+ALT+ELITE
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
)";
    
    send_html_email(p.get_Email(), "Triage Level Updated - Priority Changed to Level " + to_string(p.get_Triage_Level()), html);
}

#endif