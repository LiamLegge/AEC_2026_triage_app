#ifndef PATIENTCLASS_H
#define PATIENTCLASS_H

#include <iostream>
#include <string>

using namespace std;


class patient{
    private:
        unsigned int Patient_ID;
        string Name;
        unsigned int Age;
        string Chief_Complaint;
        unsigned int Triage_Level;
        string Accessibility_Profile;
        string Prefered_Mode;
        string UI_Setting;
        string Language;

    public:
        patient(int ID = 0, string N = "John Doe", int A = 0, string CC = "NUll", int TL = 5, string AP = "None", string PM = "Strandard", string UI = "Default", string Lang = "English"){
            Patient_ID = ID;
            Name = N;
            Age = A;
            Chief_Complaint = CC;
            Triage_Level = TL;
            Accessibility_Profile = AP;
            Prefered_Mode = PM;
            UI_Setting = UI;
            Language = Lang;
        }

        void set_Patient_ID(int ID){Patient_ID = ID;}
        int get_Patient_ID(){return Patient_ID;}

        void set_Name(string N){Name = N;}
        string get_Name(){return Name;}

        void set_Age(int A){Age = A;}
        int get_Age(){return Age;}

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
};


#endif