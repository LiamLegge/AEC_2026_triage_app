#ifndef circularQueue_H
#define circularQueue_H

#include <iostream>
#include "patientClass.h"
using namespace std;

class Queue{
private:
    patient* arr;
    int front;
    int rear;
    int capacity;
    int count;

    void resize() {
        int newCap = capacity * 2;
        patient* newArr = new patient[newCap];

        // Copy elements in order
        for (int i = 0; i < count; i++)
            newArr[i] = arr[(front + i) % capacity];

        delete[] arr;

        arr = newArr;
        capacity = newCap;
        front = 0;
        rear = count - 1;
    }

public:
    // Constructor
    Queue(int size = 20) {
        capacity = size;
        arr = new patient[capacity];
        front = 0;
        rear = -1;
        count = 0;
    }

    // Destructor
    ~queue() {
        delete[] arr;
    }

    // Add patient
    void enqueue(patient value) {
        if (isFull())
            resize();

        rear = (rear + 1) % capacity;
        arr[rear] = value;   // OBJECT COPY
        count++;
    }

    // Remove front patient
    patient dequeue() {
        if (empty()) {
            cout << "Queue empty\n";
            return patient();
        }

        patient temp = arr[front];
        front = (front + 1) % capacity;
        count--;
        return temp;
    }

    //removePatient function from chatGPT
    void removePatient(const patient& target) {
        if (count == 0) {
            cout << "Queue empty\n";
            return;
        }

        int i = front;
        bool found = false;

        // Search for the patient by unique ID
        for (int c = 0; c < count; c++) {
            if (arr[i].get_Patient_ID() == target.get_Patient_ID()) {
                found = true;
                break;
            }
            i = (i + 1) % capacity;
        }

        if (!found) {
            cout << "Patient not found in queue\n";
            return;
        }

        // Shift elements to remove patient
        int j = i;
        while (j != rear) {
            int next = (j + 1) % capacity;
            arr[j] = arr[next];
            j = next;
        }

        // Update rear and count
        if (rear == 0)
            rear = capacity - 1;
        else
            rear = (rear - 1) % capacity;

        count--;
        cout << "Patient removed successfully\n";
    }



    // Peek front
    patient peek() {
        if (empty()) {
            cout << "Queue empty\n";
            return patient();
        }
        return arr[front];
    }

    void pop() {
        if (count == 0) {
            std::cout << "Queue is empty!\n";
            return;
        }
        front = (front + 1) % capacity;
        count--;
    }

    bool empty() {
        return count == 0;
    }

    bool isFull() {
        return count == capacity;
    }

    int size() {
        return count;
    }

    void display() {
        for (int i = 0; i < count; i++)
            cout << arr[(front + i) % capacity].get_Name() << " ";
        cout << endl;
    }
};



#endif