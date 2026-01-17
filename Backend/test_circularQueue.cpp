#include "circularQueue.h"
#include <cassert>
#include <iostream>

void testQueue() {
    // Test 1: Basic push and pop
    Queue<int> q;
    q.push(1);
    q.push(2);
    q.push(3);
    assert(q.size() == 3);
    assert(q.peek() == 1);
    q.pop();
    assert(q.peek() == 2);

    // Test 2: Empty queue behavior
    q.pop();
    q.pop();
    assert(q.empty());

    // Test 3: Resize functionality
    Queue<int> q2(2);
    q2.push(10);
    q2.push(20);
    q2.push(30); // Should trigger resize
    assert(q2.size() == 3);
    assert(q2.peek() == 10);

    // Test 4: Custom object
    Queue<patient> patientQueue;
    patient p1, p2;
    p1.Patient_ID = 1;
    p2.Patient_ID = 2;
    patientQueue.push(p1);
    patientQueue.push(p2);
    assert(patientQueue.peek().Patient_ID == 1);
    patientQueue.pop();
    assert(patientQueue.peek().Patient_ID == 2);

    std::cout << "All tests passed!\n";
}

int main() {
    testQueue();
    return 0;
}