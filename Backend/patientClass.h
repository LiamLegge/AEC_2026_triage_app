#ifndef PATIENTCLASS_H
#define PATIENTCLASS_H

#include <iostream>
#include <string>
#include <ctime>
#include <algorithm>
#include <cstdlib>

using namespace std;

const string Admin_Email = "hospital_email@domain.ca";
const string Admin_Password = "password123";

class patient{
    private:
        unsigned int Patient_ID;
        string Name;
        unsigned int Age;
        char Sex;
        string Birth_Day;
        string Health_Card;
        string Email;
        string Chief_Complaint;
        unsigned int Triage_Level;
        string Accessibility_Profile;
        string Preferred_Mode;
        string UI_Setting;
        string Language;
        string Check_In;
        int Internal_Time;

    public:
        patient(int ID = 0, string N = "John Doe", int A = 0, char S = 'X',string E = "NULL", string BD = "NULL",string HC = "NULL", string CC = "NULL", int TL = 5, string AP = "None", string PM = "Strandard", string UI = "Default", string Lang = "English"){

            Patient_ID = ID;
            Name = N;
            Age = A;
            Sex = S;
            Email = E;
            Birth_Day = BD;
            Health_Card = HC;
            Chief_Complaint = CC;
            Triage_Level = TL;
            Accessibility_Profile = AP;
            Preferred_Mode = PM;
            UI_Setting = UI;
            Language = Lang;
            Check_In = get_Current_Time(); // format: Fri Jan 17 10:52:30 2026
            Internal_Time = UTC_to_int(get_Current_Time());
        }

        void set_Patient_ID(int ID){Patient_ID = ID;}
        int get_Patient_ID(){return Patient_ID;}

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
        int get_Check_In_Time()const{return UTC_to_int(Check_In);}

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

int UTC_to_int(string temp){
    temp = temp.substr(11, 8);
    temp.erase(remove(temp.begin(), temp.end(), ':'), temp.end());
    int tempi = stoi(temp);
    return tempi;
}

void Update_Sevarity(patient p){
    int CT = p.get_Current_Time();
    int IT = p.get_Internal_Time();
    //increase sevarity based on time waiting
    switch(p.get_Triage_Level()){
        case 1:
            return; // no need to update
        case 2:
            //Update after an hour of waiting
            if(IT >= CT +  10000){
                p.set_Triage_Level(1);
                p.set_Internal_Time(CT);
                generate_email(p);
            }
        case 3://Update after an 1.5 hours of waiting
            if(IT >= CT +  13000){
                p.set_Triage_Level(2);
                p.set_Internal_Time(CT);
                generate_email(p);
            }
        case 4://Update after an 2 hours of waiting
            if(IT >= CT +  20000){
                p.set_Triage_Level(2);
                p.set_Internal_Time(CT);
                generate_email(p);
            }
        case 5://Update after an 2.5 hours of waiting
            if(IT >= CT +  23000){
                p.set_Triage_Level(2);
                p.set_Internal_Time(CT);
                generate_email(p);
            }
    }
}

//potentilly change email language
void generate_email(patient& p){
    if(p.get_Email() == "NULL") return;

    string command = "powershell -Command \"Send-MailMessage "
        "-From '" + Admin_Email + "' "
        "-To '" + p.get_Email() + "' "
        "-Subject 'Triage Level Updated' "
        "-Body 'Your Triage Priority has been updated to " + to_string(p.get_Triage_Level()) + " . Thank you for your patience.' "
        "-SmtpServer 'smtp.gmail.com' "
        "-Port 587 "
        "-Credential (New-Object System.Management.Automation.PSCredential('" + Admin_Email + "',(ConvertTo-SecureString '" + Admin_Password + "' -AsPlainText -Force))) " // Fixed: use Admin_Password
        "-UseSsl\"";

    system(command.c_str()); // Warning: potential security risk
}

#endif