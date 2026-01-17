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

    // Remove patient
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