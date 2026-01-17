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

    // Remove patient
    T dequeue() {
        if (empty()) {
            cout << "Queue empty\n";
            return T();
        }

        T temp = arr[front];
        front = (front + 1) % capacity;
        count--;
        return temp;
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