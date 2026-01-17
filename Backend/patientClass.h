#ifndef PATIENTCLASS_H
#define PATIENTCLASS_H

#include <iostream>
#include <string>
#include <ctime>
#include <algorithm>
#include <cstdlib>

using namespace std;

class patient{
    private:
        unsigned int Patient_ID;
        string Name;
        unsigned int Age;
        char Sex;
        string Birth_Day;
        string Health_Card;
        string Email;
        string Birth_Day;
        string Chief_Complaint;
        unsigned int Triage_Level;
        string Accessibility_Profile;
        string Prefered_Mode;
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
            Prefered_Mode = PM;
            UI_Setting = UI;
            Language = Lang;
            Check_In = get_Current_Time(); // format: Fri Jan 17 10:52:30 2026
            Internal_Time = get_Current_Time();
        }

        void set_Patient_ID(int ID){Patient_ID = ID;}
        int get_Patient_ID(){return Patient_ID;}

        void set_Name(string N){Name = N;}
        string get_Name(){return Name;}

        void set_Age(int A){Age = A;}
        int get_Age(){return Age;}

        void set_Sex(char S){Sex = S;}
        char get_Sex(){return Sex;}

        void set_Email(string E){Email = E;}
        string get_Email(){return Email;}

        void set_Birth_Day(string BD){Birth_Day = BD;}
        string get_Birth_Day(){return Birth_Day;}

        void set_Health_Card(string HC){Health_Card = HC;}
        string get_Health_Card() {return Health_Card;}        

        void set_Cheif_Complaint(string CC){Chief_Complaint = CC;}
        string get_Cheif_Complaint() {return Chief_Complaint;}

        void set_Triage_Level(int TL){Triage_Level = TL;}
        int get_Triage_Level(){return Triage_Level;}

        void set_Accessibility_Profile(string AP){Accessibility_Profile = AP;}
        string get_Accessibility_Profile(){return Accessibility_Profile;}

        void set_Prefered_Mode(string PM){Prefered_Mode = PM;}
        string get_Prefered_Mode(){return Prefered_Mode;}

        void set_UI_Setting(string UI){UI_Setting = UI;}
        string get_UI_Setting(){return UI_Setting;}

        void set_Language(string Lang){Language = Lang;}
        string get_Language(){return Language;}

        string get_Check_In_Full(){return Check_In;}
        int get_Check_In_Time(){return UTC_to_int(Check_In);}

        void set_Internal_Time(int T){Internal_Time = T;}
        
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
        Case 1:
            return; // no need to update
        Case 2:
            //Update after an hour of waiting
            if(IT >= CT +  10000){
                p.set_Triage_Level(1);
                p.set_Internal_Time(CT);
                generate_email(p);
            }
        Case 3://Update after an 1.5 hours of waiting
            if(IT >= CT +  13000){
                p.set_Triage_Level(2);
                p.set_Internal_Time(CT);
                generate_email(p);
            }
        Case 4://Update after an 2 hours of waiting
            if(IT >= CT +  20000){
                p.set_Triage_Level(2);
                p.set_Internal_Time(CT);
                generate_email(p);
            }
        Case 5://Update after an 2.5 hours of waiting
            if(IT >= CT +  23000){
                p.set_Triage_Level(2);
                p.set_Internal_Time(CT);
                generate_email(p);
            }
    }
}

//potentilly change email language
void generate_email(patient p){
    //check if no email
    if(p.get_Email() == "NULL"){return;}
    string command = "powershell -Command \"Send-MailMessage "
        "-From 'hospital@admin.com' "
        "-To '" + p.get_Email() + "' "
        "-Subject 'Triage Level Updated' "
        "-Body 'Your Triage Priority has been updated to " + to_string(p.get_Triage_Level()) + " . Thank you for your patience' "
        "-SmtpServer 'smtp.gmail.com' "
        "-Port 587 "
        "-Credential (New-Object System.Management.Automation.PSCredential('hostpital@gmail.com',(ConvertTo-SecureString 'your_password' -AsPlainText -Force))) "
        "-UseSsl\"";

    system(command.c_str());
}

#endif