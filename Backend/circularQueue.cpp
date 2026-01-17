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
        int* newArr = new int[newCap];

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
    queue(int size = 4) {
        capacity = size;
        arr = new int[capacity];
        front = 0;
        rear = -1;
        count = 0;
    }

    // Destructor
    ~queue() {
        delete[] arr;
    }

    // Add element
    void enqueue(int value) {
        if (isFull())
            resize();

        rear = (rear + 1) % capacity;
        arr[rear] = value;
        count++;
    }

    // Remove element
    void dequeue() {
        if (isEmpty()) {
            cout << "Queue empty\n";
            return;
        }

        front = (front + 1) % capacity;
        count--;
    }

    // Peek front
    int peek() {
        if (isEmpty()) {
            cout << "Queue empty\n";
            return -1;
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
            cout << arr[(front + i) % capacity] << " ";
        cout << endl;
    }
};
