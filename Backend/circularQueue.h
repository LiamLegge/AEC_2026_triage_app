#ifndef circularQueue_H
#define circularQueue_H

#include <iostream>
#include "patientClass.h"
using namespace std;

template <typename T>
class Queue{

public:

    T* arr;
    int front;
    int rear;
    int capacity;
    int count;

    void resize() {
        int newCap = capacity * 2;
        T* newArr = new T[newCap];

        // Copy elements in order
        for (int i = 0; i < count; i++)
            newArr[i] = arr[(front + i) % capacity];

        delete[] arr;

        arr = newArr;
        capacity = newCap;
        front = 0;
        rear = count - 1;
    }
    
    // Constructor
    Queue(int size = 20) {
        capacity = size;
        arr = new T[capacity];
        front = 0;
        rear = -1;
        count = 0;
    }

    // Copy constructor (deep copy)
    Queue(const Queue& other) {
        capacity = other.capacity;
        arr = new T[capacity];
        front = other.front;
        rear = other.rear;
        count = other.count;

        for (int i = 0; i < capacity; i++) {
            arr[i] = other.arr[i];
        }
    }

    // Copy assignment operator (deep copy)
    Queue& operator=(const Queue& other) {
        if (this == &other) return *this;

        delete[] arr;

        capacity = other.capacity;
        arr = new T[capacity];
        front = other.front;
        rear = other.rear;
        count = other.count;

        for (int i = 0; i < capacity; i++) {
            arr[i] = other.arr[i];
        }

        return *this;
    }

    // Destructor
    ~Queue() {
        delete[] arr;
    }

    // Add element
    void push(T value) {
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
            return T();
        }

        T temp = arr[front];
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
    T peek() {
        if (empty()) {
            cout << "Queue empty\n";
            return T();
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