#include <iostream>
using namespace std;

class queue {
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
    queue(int size = 20) {
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
        if (isEmpty()) {
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
        if (isEmpty()) {
            cout << "Queue empty\n";
            return patient();
        }
        return arr[front];
    }

    bool isEmpty() {
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
            cout << arr[(front + i) % capacity].name << " ";
        cout << endl;
    }
};
